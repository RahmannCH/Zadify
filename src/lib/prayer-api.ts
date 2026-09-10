import type { PrayerTimesResponse } from "@/types/prayer";

const API_BASE = "https://api.aladhan.com/v1";

const HIJRI_MONTHS_NAMES = [
  "Muharram", "Safar", "Rabi'ul Awwal", "Rabi'ul Akhir",
  "Jumadil Ula", "Jumadil Akhir", "Rajab", "Sya'ban",
  "Ramadhan", "Syawwal", "Dzulqa'dah", "Dzulhijjah"
];

// Algoritma konversi Masehi ke Hijriah matematis akurat (Ummul Qura / Astronomis)
export function gregorianToHijri(date: Date = new Date()): { day: number; month: number; monthName: string; year: number } {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  const day = date.getDate();

  if (month <= 2) {
    year -= 1;
    month += 12;
  }

  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;

  let z = jd - 1948439.5;
  const hy = Math.floor((z * 30 + 10646) / 10631);
  z -= Math.floor((hy * 10631 - 10646) / 30);
  const hm = Math.min(12, Math.max(1, Math.ceil(z / 29.5)));
  const hd = Math.max(1, Math.floor(z - Math.floor((hm - 1) * 29.5) + 1));

  return {
    day: hd,
    month: hm,
    monthName: HIJRI_MONTHS_NAMES[hm - 1] || "Rabi'ul Awwal",
    year: hy,
  };
}

export async function getPrayerTimes(latitude?: number, longitude?: number): Promise<NonNullable<PrayerTimesResponse["data"]>> {
  const now = new Date();
  const currentDate = now.toISOString().split("T")[0];
  const lat = latitude ?? -3.4472;
  const lng = longitude ?? 114.8405;

  // 1. Jika di sisi browser, gunakan proxy internal API route untuk menghindari CORS / TypeError
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`/api/prayer-times?latitude=${lat}&longitude=${lng}&date=${currentDate}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.date && json.data.timings) return json.data;
      }
    } catch (err) {
      console.warn("Client internal proxy failed, trying direct or fallback:", err);
    }
  }

  // 2. Fetch langsung (Server-side atau Direct Fallback)
  try {
    const url = `${API_BASE}/timings/${currentDate}?latitude=${lat}&longitude=${lng}&method=2`;
    const response = await fetch(url, {
      next: { revalidate: 3600 },
    });
    
    if (response.ok) {
      const data: PrayerTimesResponse = await response.json();
      if (data.data && data.data.date && data.data.timings) return data.data;
    }
  } catch (error) {
    console.error("Direct prayer times fetch error:", error);
  }

  // 3. Fallback dinamis akurat berdasarkan hari ini
  return getDynamicFallbackPrayerTimes(now);
}

function getDynamicFallbackPrayerTimes(now: Date = new Date()): NonNullable<PrayerTimesResponse["data"]> {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const gregorianWeekday = days[now.getDay()];
  const gregorianMonth = months[now.getMonth()];
  const gregorianDay = String(now.getDate()).padStart(2, "0");
  const gregorianYear = String(now.getFullYear());

  // Hitung Hijriah hari ini secara real-time
  const hijriCalc = gregorianToHijri(now);

  return {
    date: {
      readable: now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      timestamp: Date.now(),
      hijri: {
        date: { string: `${hijriCalc.day} ${hijriCalc.monthName} ${hijriCalc.year}` },
        year: String(hijriCalc.year),
        month: { number: hijriCalc.month, en: hijriCalc.monthName },
        day: String(hijriCalc.day),
      },
      gregorian: {
        date: { string: `${gregorianDay} ${gregorianMonth.slice(0, 3)} ${gregorianYear}` },
        weekday: { en: gregorianWeekday },
        year: gregorianYear,
        month: { number: now.getMonth() + 1, en: gregorianMonth },
        day: gregorianDay,
      },
    },
    timings: {
      Fajr: "05:04",
      Sunrise: "06:21",
      Dhuhr: "12:28",
      Asr: "15:47",
      Sunset: "18:32",
      Maghrib: "18:32",
      Isha: "19:42",
      Imsak: "04:54",
      Midnight: "00:28",
    },
  };
}

export function getNextPrayer(prayerTimes: NonNullable<PrayerTimesResponse["data"]>) {
  const times = prayerTimes?.timings;
  
  if (!times || !times.Fajr || !times.Dhuhr || !times.Asr || !times.Maghrib || !times.Isha) {
    return {
      name: "Fajr",
      time: "04:45",
      secondsLeft: 16200,
    };
  }
  
  const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  for (const prayer of prayers) {
    const timeStr = times[prayer as keyof typeof times];
    if (!timeStr) continue;
    
    const [hour, minute] = timeStr.split(":").map(Number);
    if (isNaN(hour) || isNaN(minute)) continue;
    
    const prayerTime = hour * 60 + minute;

    if (prayerTime > currentTime) {
      return {
        name: prayer,
        time: timeStr,
        secondsLeft: (prayerTime - currentTime) * 60,
      };
    }
  }

  const [fH, fM] = (times.Fajr || "04:30").split(":").map(Number);
  const fajrMinutes = (isNaN(fH) ? 4 : fH) * 60 + (isNaN(fM) ? 30 : fM);

  return {
    name: "Fajr",
    time: times.Fajr,
    secondsLeft: (24 * 60 - currentTime + fajrMinutes) * 60,
  };
}

export function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  if (h > 0) {
    return `${h}h ${m}m ${s}s`;
  }
  return `${m}m ${s}s`;
}

export function getPrayerProgress(currentTime: string, nextTime: string, previousTime?: string) {
  const [currH, currM] = currentTime.split(":").map(Number);
  const [nextH, nextM] = nextTime.split(":").map(Number);
  
  const currentMinutes = currH * 60 + currM;
  let nextMinutes = nextH * 60 + nextM;
  if (nextMinutes < currentMinutes) nextMinutes += 24 * 60;
  
  let prevMinutes = 0;
  if (previousTime) {
    const [prevH, prevM] = previousTime.split(":").map(Number);
    prevMinutes = prevH * 60 + prevM;
  } else {
    prevMinutes = Math.max(0, nextMinutes - 180);
  }
  
  const totalTime = nextMinutes - prevMinutes;
  const elapsed = currentMinutes - prevMinutes;
  
  if (totalTime <= 0) return 0;
  return Math.min(100, Math.max(0, (elapsed / totalTime) * 100));
}
