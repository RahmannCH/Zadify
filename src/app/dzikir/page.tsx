"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "@/components/layout/back-button";
import { useGamificationStore } from "@/store/gamification-store";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Sparkles, Volume2, Check } from "lucide-react";
import { sfx } from "@/lib/sfx";

interface DzikirOption {
  id: string;
  name: string;
  arabic: string;
  latin: string;
  meaning: string;
  defaultTarget: number;
}

const DZIKIR_LIST: DzikirOption[] = [
  {
    id: "tasbih",
    name: "Tasbih",
    arabic: "سُبْحَانَ اللَّهِ",
    latin: "Subhanallah",
    meaning: "Maha Suci Allah",
    defaultTarget: 33,
  },
  {
    id: "tahmid",
    name: "Tahmid",
    arabic: "الْحَمْدُ لِلَّهِ",
    latin: "Alhamdulillah",
    meaning: "Segala Puji Bagi Allah",
    defaultTarget: 33,
  },
  {
    id: "takbir",
    name: "Takbir",
    arabic: "اللَّهُ أَكْبَرُ",
    latin: "Allahu Akbar",
    meaning: "Allah Maha Besar",
    defaultTarget: 33,
  },
  {
    id: "tahlil",
    name: "Tahlil",
    arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ",
    latin: "Laa Ilaha Illallah",
    meaning: "Tiada Tuhan Selain Allah",
    defaultTarget: 100,
  },
  {
    id: "istighfar",
    name: "Istighfar",
    arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ",
    latin: "Astaghfirullahal 'Azhim",
    meaning: "Aku memohon ampun kepada Allah Yang Maha Agung",
    defaultTarget: 100,
  },
  {
    id: "shalawat",
    name: "Shalawat Nabi",
    arabic: "اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ",
    latin: "Allahumma Sholli 'Ala Muhammad",
    meaning: "Ya Allah limpahkanlah shalawat kepada Nabi Muhammad",
    defaultTarget: 100,
  },
  {
    id: "hauqalah",
    name: "Hauqalah",
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    latin: "Laa Hawla wa Laa Quwwata Illa Billah",
    meaning: "Tiada daya dan kekuatan melainkan dengan pertolongan Allah",
    defaultTarget: 33,
  },
];

export default function DzikirPage() {
  const [selectedDzikir, setSelectedDzikir] = useState<DzikirOption>(DZIKIR_LIST[0]);
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const { addXp, incrementDzikir } = useGamificationStore();

  const handleSelectDzikir = (dzikir: DzikirOption) => {
    sfx.playTap();
    setSelectedDzikir(dzikir);
    setTarget(dzikir.defaultTarget);
    setCount(0);
  };

  const handleTap = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    sfx.playTap();
    const newCount = count + 1;
    incrementDzikir(1);

    if (newCount >= target) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      sfx.playSuccess();
      addXp(10, `Dzikir ${selectedDzikir.latin} (${target}x) selesai`);
      setShowCelebrate(true);
      setCount(0); // Reset otomatis ke 0 untuk putaran berikutnya!
      setTimeout(() => setShowCelebrate(false), 3200);
    } else {
      setCount(newCount);
    }
  };

  const handleReset = () => {
    if (navigator.vibrate) navigator.vibrate(20);
    sfx.playWoosh();
    setCount(0);
  };

  const progress = Math.min(100, (count / target) * 100);
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 text-center min-h-[85vh] flex flex-col items-center justify-between pb-32">
      <BackButton />
      
      <div className="w-full mb-6">
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-1">Tasbih & Dzikir Digital</h1>
        <p className="text-sm text-muted-foreground">Pilih lantunan dzikir dan sentuh cincin untuk bertasbih.</p>
      </div>

      {/* Pilihan List Dzikir Cepat */}
      <div className="w-full flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none justify-start sm:justify-center">
        {DZIKIR_LIST.map((dzikir) => {
          const isSelected = selectedDzikir.id === dzikir.id;
          return (
            <button
              key={dzikir.id}
              onClick={() => handleSelectDzikir(dzikir)}
              className={`px-4 py-2 rounded-2xl border text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                  : "bg-card hover:bg-muted text-muted-foreground border-border/70"
              }`}
            >
              <span>{dzikir.name}</span>
              {isSelected && <Check className="h-3.5 w-3.5" />}
            </button>
          );
        })}
      </div>

      {/* Box Bacaan Dzikir Utama yang Sedang Dilantunkan */}
      <motion.div
        key={selectedDzikir.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-5 bg-card border rounded-3xl shadow-sm mb-6 relative overflow-hidden"
      >
        <p className="font-arabic text-3xl md:text-4xl text-primary leading-loose mb-1 text-center" dir="rtl">
          {selectedDzikir.arabic}
        </p>
        <p className="font-display font-bold text-base text-foreground mb-0.5">{selectedDzikir.latin}</p>
        <p className="text-xs text-muted-foreground italic">&ldquo;{selectedDzikir.meaning}&rdquo;</p>
      </motion.div>

      {/* Target Presets */}
      <div className="flex gap-2 mb-6">
        {[33, 100, 1000].map((t) => (
          <Button
            key={t}
            variant={target === t ? "default" : "outline"}
            className={`rounded-xl h-9 text-xs font-bold ${target === t ? "bg-teal hover:bg-teal/90" : ""}`}
            onClick={() => { setTarget(t); setCount(0); sfx.playTap(); }}
          >
            {t}x
          </Button>
        ))}
      </div>

      {/* Cincin Tasbih Haptic */}
      <motion.div 
        className="relative cursor-pointer select-none group my-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-teal rounded-full" 
        onClick={handleTap}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleTap();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Tekan cincin untuk menghitung dzikir"
        whileTap={{ scale: 0.95 }}
      >
        <div className={`absolute inset-4 rounded-full bg-teal/10 blur-3xl transition-opacity duration-500 ${count > 0 ? 'opacity-100' : 'opacity-0'}`} />
        
        <svg viewBox="0 0 300 300" className="w-[280px] h-[280px] md:w-[300px] md:h-[300px] transform -rotate-90 relative z-10 filter drop-shadow-xl">
          <circle
            cx="150" cy="150" r={radius}
            className="stroke-muted/30"
            strokeWidth="18" fill="transparent"
          />
          <motion.circle
            cx="150" cy="150" r={radius}
            className="stroke-teal"
            strokeWidth="18" fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
          <motion.p 
            key={count}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="text-6xl md:text-7xl font-display font-bold text-primary drop-shadow-md"
          >
            {count}
          </motion.p>
          <p className="text-muted-foreground text-xs mt-1 font-semibold bg-background/60 px-3 py-1 rounded-full backdrop-blur-sm">
            Target: {target}
          </p>
        </div>

        {showCelebrate && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.85 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-2xl border bg-card/95 px-5 py-3 shadow-2xl backdrop-blur-md z-30"
          >
            <p className="text-lg font-display font-bold text-primary">MasyaAllah! 🎉</p>
            <p className="text-xs text-muted-foreground font-medium">Target {target}x tercapai (+10 ZP). Semoga istiqamah.</p>
          </motion.div>
        )}
      </motion.div>

      {/* Reset Action */}
      <div className="mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="rounded-xl px-5 gap-2 text-xs font-bold text-muted-foreground hover:text-destructive hover:border-destructive/30"
        >
          <RefreshCcw className="h-3.5 w-3.5" /> Reset Hitungan
        </Button>
      </div>
    </div>
  );
}
