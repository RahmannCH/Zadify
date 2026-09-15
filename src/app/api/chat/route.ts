import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// --- CONFIGURATION ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const ipRequestMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 15;

// --- RATE LIMITER ---
function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Periodic cleanup if map grows
  if (ipRequestMap.size > 500) {
    for (const [key, val] of ipRequestMap.entries()) {
      if (now > val.resetTime) {
        ipRequestMap.delete(key);
      }
    }
  }

  const record = ipRequestMap.get(ip);

  if (!record) {
    ipRequestMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (now > record.resetTime) {
    ipRequestMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  record.count += 1;
  return record.count > MAX_REQUESTS_PER_WINDOW;
}

// --- SYSTEM PROMPT ---
const systemPrompt = `You are "Zad Mentor", a wise, academic, neutral, and highly knowledgeable Islamic Educational AI Assistant inside Zadify (the comprehensive digital Al-Qur'an provision for Muslims).

MISSION:
Provide authentic, balanced, and structured Islamic guidance to help users collect daily spiritual provisions (Zad).

STRICT OUTPUT RULES:
1. Format: Always output clean, well-formatted Markdown (use bolding, bullet points, headers, no em dashes).
2. Religious Queries: When users ask about Islamic principles, fiqh, dua, or Quranic verses, you MUST provide:
   - Original Arabic Text (with full harakat/tashkeel).
   - Latin Transliteration (in italics, e.g., *Subhanallah*).
   - Indonesian Translation.
   - Authentic Reference/Source (Qur'an surah & verse number, or authentic Hadith collection e.g., Sahih Bukhari / Sahih Muslim).
3. Anti-Hallucination Rule: If a query involves complex/uncertain fiqh rulings or historical details where you lack 100% verified authentic evidence, you MUST explicitly state "Wallahu a'lam" (والله أعلم) and kindly advise the user to consult a qualified local scholar (ulama), without fabricating any dalil or ruling.
4. Tone: Respectful, objective, academic, warm, and highly structured.
5. Gamification: When evaluating knowledge or providing quizzes, reward users with imaginary Zad Points (ZP).`;

// --- POST HANDLER ---
export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "anonymous";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { reply: "⚠️ **Terlalu Banyak Permintaan!**\n\nMaaf, Anda melakukan terlalu banyak pertanyaan dalam waktu singkat. Mohon tunggu 1 menit sebelum bertanya kembali." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { message, history } = body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { reply: "⚠️ **Pesan Terlalu Panjang**\n\nMaksimal panjang pertanyaan adalah 2000 karakter. Mohon ringkas pertanyaan Anda." },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "") {
      return NextResponse.json(
        {
          reply: "⚠️ **API Key Gemini Belum Dikonfigurasi!**\n\nPastikan Anda telah memasukkan `GEMINI_API_KEY=kunci_anda` di dalam file `.env.local` untuk mengaktifkan Zad Mentor AI. 🛠️"
        },
        { status: 200 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 2048,
      }
    });

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Assalamu'alaikum. Saya Zad Mentor, asisten edukasi Islami Anda. Bagaimana saya dapat membantu memandu studi Al-Qur'an dan ibadah Anda hari ini?" }] },
        ...(Array.isArray(history) ? history.slice(-8) : []).flatMap((msg: { role: string; content: string }) => {
          if (!msg.role || !msg.content) return [];
          return [{
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          }];
        }),
      ],
    });

    const result = await chat.sendMessage(message);
    const response = result.response;
    let text = response.text();

    if (!text) text = "Wallahu a'lam. Mohon maaf, bolehkah mengulangi pertanyaannya? Zad Mentor siap membantu.";

    return NextResponse.json({ reply: text });
  } catch (error: any) {
    console.error("Zad Mentor Gemini API error:", error);

    let userMessage = "⚠️ **Kendala Jaringan / Layanan**\n\n";

    if (error.message?.includes("API_KEY_INVALID")) {
      userMessage += "Kunci API Gemini tidak valid atau kedaluwarsa. Mohon periksa kembali konfigurasi API Key.";
    } else if (error.message?.includes("RATE_LIMIT")) {
      userMessage += "Server sedang melayani banyak permintaan (Rate Limit). Silakan coba kembali dalam 1 menit.";
    } else if (error.message?.includes("SAFETY")) {
      userMessage += "Pertanyaan tidak dapat diproses karena terfilter oleh kebijakan keamanan Google.";
    } else {
      userMessage += `Terjadi kendala: \`${error.message}\`. Silakan coba beberapa saat lagi.`;
    }

    return NextResponse.json({ reply: userMessage }, { status: 200 });
  }
}
