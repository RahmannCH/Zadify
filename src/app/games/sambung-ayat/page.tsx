"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "@/components/layout/back-button";
import { Button } from "@/components/ui/button";
import { useGamificationStore } from "@/store/gamification-store";
import { Lightbulb, RefreshCcw, GripVertical } from "lucide-react";

interface Puzzle {
  surah: string;
  words: string[];
  shuffled: string[];
  translation: string;
}

const LOCAL_PUZZLES = [
  { surah: "Al-Ikhlas: 1", text: "قُلْ هُوَ اللَّهُ أَحَدٌ", translation: "Katakanlah: Dia-lah Allah, Yang Maha Esa" },
  { surah: "Al-Ikhlas: 2", text: "اللَّهُ الصَّمَدُ", translation: "Allah tempat meminta segala sesuatu" },
  { surah: "Al-Falaq: 1", text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", translation: "Katakanlah: Aku berlindung kepada Tuhan yang menguasai subuh" },
  { surah: "An-Nas: 1", text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", translation: "Katakanlah: Aku berlindung kepada Tuhannya manusia" },
  { surah: "An-Nas: 2", text: "مَلِكِ النَّاسِ", translation: "Raja manusia" },
  { surah: "Al-Kafirun: 1", text: "قُلْ يَا أَيُّهَا الْكَافِرُونَ", translation: "Katakanlah: Hai orang-orang kafir" },
  { surah: "Al-Kafirun: 6", text: "لَكُمْ دِينُكُمْ وَلِيَ دِينِ", translation: "Untukmu agamamu, dan untukku agamaku" },
  { surah: "Al-Kauthar: 1", text: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", translation: "Sesungguhnya Kami telah memberikan kepadamu nikmat yang banyak" },
  { surah: "Al-Kauthar: 2", text: "فَصَلِّ لِرَبِّكَ وَانْحَرْ", translation: "Maka dirikanlah shalat karena Tuhanmu; dan berkorbanlah" },
  { surah: "Al-Ma'un: 1", text: "أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ", translation: "Tahukah kamu orang yang mendustakan agama?" },
  { surah: "Al-Fil: 1", text: "أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ", translation: "Tidakkah engkau perhatikan bagaimana Tuhanmu telah bertindak terhadap pasukan bergajah?" },
  { surah: "Al-Asr: 1", text: "وَالْعَصْرِ", translation: "Demi masa" },
  { surah: "Al-Asr: 2", text: "إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ", translation: "Sesungguhnya manusia itu benar-benar dalam kerugian" },
  { surah: "At-Takathur: 1", text: "أَلْهَاكُمُ التَّكَاثُرُ", translation: "Bermegah-megahan telah melalaikan kamu" },
  { surah: "Al-Qari'ah: 1", text: "الْقَارِعَةُ", translation: "Hari Kiamat" },
  { surah: "Al-Adiyat: 1", text: "وَالْعَادِيَاتِ ضَبْحًا", translation: "Demi kuda perang yang berlari kencang terengah-engah" },
  { surah: "Az-Zalzalah: 1", text: "إِذَا زُلْزِلَتِ الْأَرْضُ زِلْزَالَهَا", translation: "Apabila bumi digoncangkan dengan goncangan yang dahsyat" }
];

function calculateXpWithPenalty(baseXp: number, hintsUsed: number): number {
  if (hintsUsed === 0) return baseXp;
  if (hintsUsed === 1) return Math.ceil(baseXp * 0.5);
  return 3;
}

export default function SambungAyatGame() {
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [userOrderIndices, setUserOrderIndices] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const { addXp } = useGamificationStore();

  const loadRandomAyah = () => {
    const randomAyah = LOCAL_PUZZLES[Math.floor(Math.random() * LOCAL_PUZZLES.length)];
    const wordsArray = randomAyah.text.split(" ");
    
    setCurrentPuzzle({
      surah: randomAyah.surah,
      words: wordsArray,
      shuffled: [...wordsArray].sort(() => Math.random() - 0.5),
      translation: randomAyah.translation
    });
    setUserOrderIndices([]);
    setIsComplete(false);
    setIsCorrect(null);
    setHintsUsed(0);
  };

  useEffect(() => {
    loadRandomAyah();
  }, []);

  const handleDrop = (shuffledIdx: number) => {
    if (isComplete || userOrderIndices.includes(shuffledIdx) || !currentPuzzle) return;
    const newIndices = [...userOrderIndices, shuffledIdx];
    setUserOrderIndices(newIndices);

    if (newIndices.length === currentPuzzle.words.length) {
      const reconstructedWords = newIndices.map((i) => currentPuzzle.shuffled[i]);
      const correct = reconstructedWords.every((w, i) => w === currentPuzzle.words[i]);
      setIsCorrect(correct);
      setIsComplete(true);
      if (correct) {
        const earnedXp = calculateXpWithPenalty(15, hintsUsed);
        addXp(earnedXp, "Sambung Ayat");
        if (navigator.vibrate) navigator.vibrate([50, 50, 100]);
      } else {
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      }
    }
  };

  const handleHint = () => {
    if (hintsUsed >= 1 || isComplete || !currentPuzzle) return;
    setHintsUsed(1);
    const nextCorrectWord = currentPuzzle.words[userOrderIndices.length];
    if (nextCorrectWord) {
      const targetIdx = currentPuzzle.shuffled.findIndex(
        (w, i) => w === nextCorrectWord && !userOrderIndices.includes(i)
      );
      if (targetIdx !== -1) handleDrop(targetIdx);
    }
  };

  const handleReset = () => {
    loadRandomAyah();
  };

  const handleUndo = () => {
    if (isComplete || userOrderIndices.length === 0) return;
    setUserOrderIndices(userOrderIndices.slice(0, -1));
  };

  if (!currentPuzzle) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <BackButton />
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <GripVertical className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-display font-bold">Sambung Ayat</h1>
        </div>
        <p className="text-muted-foreground">Susun kata-kata dari kanan ke kiri</p>
      </div>

      <div className="bg-card border rounded-2xl p-6 mb-6 text-center shadow-sm">
        <p className="text-sm text-muted-foreground mb-2 font-semibold">Bantuan Terjemahan:</p>
        <p className="text-lg leading-relaxed">"{currentPuzzle.translation}"</p>
        <p className="text-xs font-bold text-primary mt-3 bg-primary/10 inline-block px-3 py-1 rounded-full">{currentPuzzle.surah}</p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-bold text-muted-foreground">Susunan Ayat (Baca Kanan ➡️ Kiri):</p>
          {userOrderIndices.length > 0 && !isComplete && (
            <button onClick={handleUndo} className="text-xs text-primary font-bold hover:underline">Undo Kata Terakhir</button>
          )}
        </div>
        <div className="min-h-[100px] rounded-2xl border-2 border-dashed border-primary/30 p-5 flex flex-wrap gap-3 items-center justify-start bg-accent/20" dir="rtl">
          {userOrderIndices.length === 0 ? (
            <p className="text-sm text-muted-foreground w-full text-center my-auto" dir="ltr">Tap kata di bawah untuk mulai menyusun</p>
          ) : (
            <AnimatePresence>
              {userOrderIndices.map((shuffledIdx, idx) => (
                <motion.span key={idx + "-" + shuffledIdx} initial={{ opacity: 0, scale: 0.5, x: 20 }} animate={{ opacity: 1, scale: 1, x: 0 }} className="bg-gradient-to-br from-primary to-teal text-white px-5 py-3 rounded-xl font-arabic text-2xl shadow-md">
                  {currentPuzzle.shuffled[shuffledIdx]}
                </motion.span>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-8" dir="rtl">
        {currentPuzzle.shuffled.map((word, idx) => {
          const used = userOrderIndices.includes(idx);
          return (
            <motion.button
              key={idx + word}
              whileHover={!used ? { scale: 1.05, y: -2 } : {}}
              whileTap={!used ? { scale: 0.95 } : {}}
              onClick={() => handleDrop(idx)}
              disabled={used || isComplete}
              className={`px-6 py-4 rounded-xl font-arabic text-2xl transition-all shadow-sm border ${used ? "opacity-20 cursor-not-allowed bg-muted border-transparent" : "bg-card border-border hover:border-primary hover:shadow-md text-foreground"}`}
            >
              {word}
            </motion.button>
          );
        })}
      </div>

      {!isComplete && (
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 border-gold/30 text-gold hover:bg-gold/10 hover:text-gold" onClick={handleHint} disabled={hintsUsed >= 1}>
            <Lightbulb className="h-4 w-4 mr-2" />
            Bantu Kata Selanjutnya {hintsUsed > 0 && "(-50% XP)"}
          </Button>
        </div>
      )}

      {isComplete && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`p-8 rounded-2xl text-center shadow-lg ${isCorrect ? "bg-gradient-to-br from-emerald/20 to-emerald/5 border border-emerald/30" : "bg-gradient-to-br from-destructive/20 to-destructive/5 border border-destructive/30"}`}>
          <p className={`text-4xl mb-4 font-bold ${isCorrect ? "text-emerald" : "text-destructive"}`}>
            {isCorrect ? "Masha Allah! Benar! 🎉" : "Kurang Tepat 😢"}
          </p>
          {!isCorrect && (
            <div className="mb-6 p-4 bg-background/50 rounded-xl">
              <p className="text-sm font-bold mb-2">Urutan yang benar:</p>
              <div className="flex flex-wrap gap-2 justify-center" dir="rtl">
                {currentPuzzle.words.map((w, i) => <span key={i} className="font-arabic text-xl text-emerald">{w}</span>)}
              </div>
            </div>
          )}
          <p className="font-bold text-lg mb-6">
            {isCorrect ? `Kamu mendapatkan +${calculateXpWithPenalty(15, hintsUsed)} XP` : "Terus semangat belajar, ayo coba lagi!"}
          </p>
          <Button onClick={handleReset} className="w-full h-14 text-lg bg-primary hover:scale-[1.02] transition-transform">
            Mainkan Ayat Lain
          </Button>
        </motion.div>
      )}
    </div>
  );
}
