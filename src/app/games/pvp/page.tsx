"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "@/components/layout/back-button";
import { Swords, Bot, User, CheckCircle2, XCircle, Timer, Trophy } from "lucide-react";
import { useGamificationStore } from "@/store/gamification-store";
import { useLeaderboardStore } from "@/store/leaderboard-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { sfx } from "@/lib/sfx";

const PVP_QUESTIONS = [
  {
    q: "Surah apakah yang disebut Ummul Kitab?",
    opts: ["Al-Ikhlas", "Al-Fatihah", "Al-Baqarah", "Yasin"],
    ans: 1,
  },
  {
    q: "Berapa jumlah rakaat sholat fardhu dalam sehari semalam?",
    opts: ["15 Rakaat", "17 Rakaat", "20 Rakaat", "12 Rakaat"],
    ans: 1,
  },
  {
    q: "Hukum nun mati bertemu huruf Ba (ب) adalah...",
    opts: ["Izhar", "Ikhfa", "Iqlab", "Idgham"],
    ans: 2,
  },
  {
    q: "Puasa sunnah yang dilaksanakan setiap tanggal 13, 14, 15 bulan Hijriyah adalah...",
    opts: ["Puasa Daud", "Puasa Arafah", "Puasa Ayyamul Bidh", "Puasa Senin Kamis"],
    ans: 2,
  },
  {
    q: "Zakat emas wajib dikeluarkan jika sudah mencapai nisab...",
    opts: ["85 gram", "100 gram", "50 gram", "200 gram"],
    ans: 0,
  },
];

export default function PvPQuizArenaPage() {
  const { addXP } = useGamificationStore();
  const { addWeeklyXp } = useLeaderboardStore();

  const [gameState, setGameState] = useState<"matchmaking" | "playing" | "result">("matchmaking");
  const [rival, setRival] = useState<{ name: string; avatar: string }>({ name: "", avatar: "" });
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isAnswered, setIsAnswered] = useState(false);

  // Matchmaking simulation
  useEffect(() => {
    if (gameState === "matchmaking") {
      const rivals = [
        { name: "Ahmad_Hafiz99", avatar: "👳‍♂️" },
        { name: "Siti_Ruhiyah", avatar: "🧕" },
        { name: "Umar_Warrior", avatar: "🧔" },
      ];
      const selected = rivals[Math.floor(Math.random() * rivals.length)];
      const timer = setTimeout(() => {
        setRival(selected);
        setGameState("playing");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Timer per question
  useEffect(() => {
    if (gameState !== "playing" || isAnswered) return;
    if (timeLeft === 0) {
      handleAnswer(-1);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft, isAnswered]);

  const handleAnswer = (optIndex: number) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOpt(optIndex);

    const currentQ = PVP_QUESTIONS[currentQIndex];
    const isCorrect = optIndex === currentQ.ans;
    const addedUserScore = isCorrect ? 100 + timeLeft * 10 : 0;
    if (isCorrect) {
      sfx.playSuccess();
      setMyScore((s) => s + addedUserScore);
    } else {
      sfx.playWoosh();
    }

    // Simulate rival logic (75% accuracy)
    const rivalIsCorrect = Math.random() < 0.75;
    const addedRivalScore = rivalIsCorrect ? 100 + Math.floor(Math.random() * 8) * 10 : 0;
    if (rivalIsCorrect) {
      setRivalScore((s) => s + addedRivalScore);
    }

    const calculatedMyScore = myScore + addedUserScore;
    const calculatedRivalScore = rivalScore + addedRivalScore;

    setTimeout(() => {
      if (currentQIndex < PVP_QUESTIONS.length - 1) {
        setCurrentQIndex((i) => i + 1);
        setSelectedOpt(null);
        setIsAnswered(false);
        setTimeLeft(10);
      } else {
        const finalReward = calculatedMyScore > calculatedRivalScore ? 150 : 50;
        addXP(finalReward, "Tanding PvP Arena");
        addWeeklyXp(finalReward);
        setGameState("result");
      }
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8 pb-32">
      <BackButton />

      {/* MATCHMAKING SCREEN */}
      {gameState === "matchmaking" && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="p-6 bg-amber-500/10 rounded-full mb-6"
          >
            <Swords className="h-12 w-12 text-amber-500" />
          </motion.div>
          <h2 className="text-2xl font-bold font-display mb-2">Mencari Lawan Tanding...</h2>
          <p className="text-sm text-muted-foreground">Menghubungkan ke PvP Server Zadify</p>
        </div>
      )}

      {/* PLAYING SCREEN */}
      {gameState === "playing" && (
        <div>
          {/* Header Scoreboard */}
          <div className="flex items-center justify-between gap-4 mb-6 p-4 rounded-2xl border bg-card/60 backdrop-blur shadow-sm">
            <div className="flex items-center gap-3">
              <div className="text-2xl">👤</div>
              <div>
                <div className="text-xs font-bold">Kamu</div>
                <div className="text-lg font-bold font-display text-emerald-600">{myScore} ZP</div>
              </div>
            </div>

            <div className="flex flex-col items-center shrink-0">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Waktu</span>
              <div className="flex items-center gap-1 font-mono font-bold text-amber-500 text-lg">
                <Timer className="h-4 w-4" />
                {timeLeft}s
              </div>
            </div>

            <div className="flex items-center gap-3 text-right">
              <div>
                <div className="text-xs font-bold">{rival.name}</div>
                <div className="text-lg font-bold font-display text-rose-500">{rivalScore} ZP</div>
              </div>
              <div className="text-2xl">{rival.avatar}</div>
            </div>
          </div>

          {/* Question Card */}
          <Card className="p-6 mb-6 border-primary/20 bg-card/80 shadow-lg">
            <div className="text-xs font-bold text-primary mb-2">
              Soal {currentQIndex + 1} dari {PVP_QUESTIONS.length}
            </div>
            <h3 className="text-lg font-bold font-display leading-snug">
              {PVP_QUESTIONS[currentQIndex].q}
            </h3>
          </Card>

          {/* Options */}
          <div className="space-y-3">
            {PVP_QUESTIONS[currentQIndex].opts.map((opt, idx) => {
              const isSelected = selectedOpt === idx;
              const isCorrect = idx === PVP_QUESTIONS[currentQIndex].ans;

              let btnStyle = "border-border bg-card hover:border-primary/50";
              if (isAnswered) {
                if (isCorrect) btnStyle = "border-emerald-500 bg-emerald-500/15 text-emerald-600 font-bold";
                else if (isSelected) btnStyle = "border-rose-500 bg-rose-500/15 text-rose-600 font-bold";
              }

              return (
                <Button
                  key={idx}
                  variant="outline"
                  disabled={isAnswered}
                  className={`w-full justify-start text-left p-4 h-auto rounded-xl border text-sm transition-all ${btnStyle}`}
                  onClick={() => handleAnswer(idx)}
                >
                  <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold mr-3 shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* RESULT SCREEN */}
      {gameState === "result" && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-6xl mb-4">{myScore >= rivalScore ? "🏆" : "🤝"}</div>
          <h2 className="text-3xl font-bold font-display mb-2">
            {myScore > rivalScore ? "Kemenangan Mutlak!" : myScore === rivalScore ? "Hasil Seri!" : "Tetap Semangat!"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Skor Kamu: {myScore} ZP &middot; Skor {rival.name}: {rivalScore} ZP
          </p>

          <Card className="p-4 w-full max-w-sm mb-6 border-emerald-500/30 bg-emerald-500/10">
            <div className="text-xs text-muted-foreground">Hadiah Pertandingan</div>
            <div className="text-xl font-bold text-emerald-600">+{myScore > rivalScore ? 150 : 50} Zad Points</div>
          </Card>

          <Button onClick={() => setGameState("matchmaking")} className="gap-2">
            <Swords className="h-4 w-4" />
            Tanding Lagi
          </Button>
        </div>
      )}
    </div>
  );
}
