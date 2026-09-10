"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BackButton } from "@/components/layout/back-button";
import { Button } from "@/components/ui/button";
import { useGamificationStore } from "@/store/gamification-store";
import { Lightbulb, RefreshCcw, Eye } from "lucide-react";

// Dynamic vocab pairs from Quranic themes
const THEMATIC_VOCAB = [
  { ar: "الرَّحْمَٰنِ", id: "Maha Pengasih" },
  { ar: "الرَّحِيمِ", id: "Maha Penyayang" },
  { ar: "الْمَلِكِ", id: "Maha Raja" },
  { ar: "الْقُدُّوسِ", id: "Maha Suci" },
  { ar: "السَّلَامُ", id: "Maha Sejahtera" },
  { ar: "الْمُؤْمِنُ", id: "Maha Memelihara Iman" },
  { ar: "الْمُهَيْمِنُ", id: "Maha Pengawas" },
  { ar: "الْعَزِيزُ", id: "Maha Perkasa" },
  { ar: "الْجَبَّارُ", id: "Maha Kekuasaan" },
  { ar: "الْمُتَكَبِّرُ", id: "Maha Megah" },
  { ar: "خَالِقُ", id: "Pencipta" },
  { ar: "رَبُّ", id: "Rabb" },
  { ar: "نَبِيُّ", id: "Nabi" },
  { ar: "رَسُولُ", id: "Rasul" },
  { ar: "مَلَكُ", id: "Malaikat" },
  { ar: "كِتَابُ", id: "Kitab" },
  { ar: "سَمَاءُ", id: "Langit" },
  { ar: "أَرْضُ", id: "Bumi" },
  { ar: "جَنَّةُ", id: "Surga" },
  { ar: "نَارُ", id: "Api/Neraka" },
];

const getRandomPairs = (count: number) => {
  const shuffled = [...THEMATIC_VOCAB].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

function calculateXpWithPenalty(baseXp: number, hintsUsed: number): number {
  if (hintsUsed === 0) return baseXp;
  if (hintsUsed === 1) return Math.ceil(baseXp * 0.5);
  return 3;
}

interface Card {
  id: number;
  content: string;
  type: "ar" | "id";
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const { addXp } = useGamificationStore();

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const pairs = getRandomPairs(4);
    const shuffled: Card[] = [];
    pairs.forEach((pair, idx) => {
      shuffled.push({ id: idx * 2, content: pair.ar, type: "ar", isFlipped: false, isMatched: false });
      shuffled.push({ id: idx * 2 + 1, content: pair.id, type: "id", isFlipped: false, isMatched: false });
    });
    shuffled.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setHintsUsed(0);
    setGameComplete(false);
  };

  const handleCardClick = (cardId: number) => {
    if (isLocked || gameComplete) return;
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newCards = cards.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c));
    setCards(newCards);

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      setIsLocked(true);

      const [first, second] = newFlipped;
      const firstCard = newCards.find((c) => c.id === first)!;
      const secondCard = newCards.find((c) => c.id === second)!;

      const isMatch =
        firstCard.type !== secondCard.type &&
        THEMATIC_VOCAB.some(
          (p) =>
            (p.ar === firstCard.content && p.id === secondCard.content) ||
            (p.id === firstCard.content && p.ar === secondCard.content)
        );

      setTimeout(() => {
        if (isMatch) {
          setCards(
            newCards.map((c) => (c.id === first || c.id === second ? { ...c, isMatched: true } : c))
          );
          setMatches((m) => {
            const newMatches = m + 1;
            if (newMatches === 4) {
              setGameComplete(true);
              addXp(calculateXpWithPenalty(20, hintsUsed), "Memory Match");
              if (navigator.vibrate) navigator.vibrate([50, 50, 100]);
            }
            return newMatches;
          });
        } else {
          setCards(
            newCards.map((c) => (c.id === first || c.id === second ? { ...c, isFlipped: false } : c))
          );
        }
        setFlippedCards([]);
        setIsLocked(false);
      }, 800);
    }
  };

  const handleHint = () => {
    if (hintsUsed >= 1 || gameComplete) return;
    setHintsUsed(1);
    const unmatched = cards.filter((c) => !c.isMatched && !c.isFlipped);
    const tempFlipped = unmatched.slice(0, 2).map((c) => c.id);
    setCards((prev) => prev.map((c) => (tempFlipped.includes(c.id) ? { ...c, isFlipped: true } : c)));
    setTimeout(() => {
      setCards((prev) => prev.map((c) => (tempFlipped.includes(c.id) && !c.isMatched ? { ...c, isFlipped: false } : c)));
    }, 2000);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <BackButton />
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-display font-bold mb-1">Memory Match</h1>
        <p className="text-muted-foreground">Cocokkan kata Arab dengan artinya (RTL: Kanan → Kiri)</p>
      </div>

      <div className="flex justify-between mb-6">
        <div className="bg-muted px-4 py-2 rounded-lg">
          <span className="text-muted-foreground text-sm">Langkah: </span>
          <span className="font-bold">{moves}</span>
        </div>
        <div className="bg-muted px-4 py-2 rounded-lg">
          <span className="text-muted-foreground text-sm">Cocok: </span>
          <span className="font-bold">{matches}/4</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6" dir="rtl">
        {cards.map((card) => (
          <motion.button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={card.isFlipped || card.isMatched}
            className="aspect-square rounded-xl flex items-center justify-center text-center p-2 transition-all"
            style={{ perspective: "1000px" }}
          >
            <div className="relative w-full h-full rounded-xl" dir="rtl">
              {card.isFlipped || card.isMatched ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`w-full h-full rounded-xl flex items-center justify-center p-2 ${
                    card.isMatched ? "bg-emerald/20 border-2 border-emerald" : "bg-primary text-primary-foreground"
                  }`}
                >
                  <span className={card.type === "ar" ? "font-arabic text-lg" : "text-xs"}>{card.content}</span>
                </motion.div>
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary/80 to-teal flex items-center justify-center">
                  <Eye className="h-6 w-6 text-white opacity-50" />
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {!gameComplete && (
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleHint} disabled={hintsUsed >= 1}>
            <Lightbulb className="h-4 w-4 mr-2" />
            Hint {hintsUsed > 0 && "(-50% XP)"}
          </Button>
          <Button variant="ghost" className="flex-1" onClick={initGame}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      )}

      {gameComplete && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl text-center bg-emerald/10 border border-emerald/30">
          <p className="text-3xl mb-3 text-emerald">🎉 Selesai!</p>
          <p className="text-muted-foreground mb-2">Langkah: {moves}</p>
          <p className="text-muted-foreground mb-4">+{calculateXpWithPenalty(20, hintsUsed)} XP</p>
          <Button onClick={initGame} className="w-full">
            Main Lagi
          </Button>
        </motion.div>
      )}
    </div>
  );
}
