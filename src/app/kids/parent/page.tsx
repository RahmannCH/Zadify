"use client";

import { motion } from "framer-motion";
import { BackButton } from "@/components/layout/back-button";
import { useGamificationStore, getLevelInfo, AVAILABLE_BADGES } from "@/store/gamification-store";
import { ShieldCheck, Star, Trophy, BookOpen, Clock, Activity, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ParentDashboard() {
  const store = useGamificationStore();
  const levelInfo = getLevelInfo(store.xp);
  
  const unlockedBadgesCount = store.unlockedBadges.length;
  const totalBadges = AVAILABLE_BADGES.length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-32">
      <BackButton />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold">Dashboard Orang Tua</h1>
        </div>
        <p className="text-muted-foreground">Pantau perkembangan belajar dan ibadah anak Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-6 md:col-span-2"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-1">Level Saat Ini</p>
              <h2 className="text-3xl font-display font-bold">{levelInfo.title}</h2>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-2xl">
              <Star className="h-8 w-8 text-amber-500" />
            </div>
          </div>
          
          <div className="flex justify-between text-sm font-medium mb-2">
            <span>{store.xp} ZP</span>
            <span className="text-muted-foreground">{levelInfo.nextXp} ZP</span>
          </div>
          <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${((store.xp - levelInfo.minXp) / (levelInfo.nextXp - levelInfo.minXp)) * 100}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border bg-card p-6 flex flex-col justify-center"
        >
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-5 w-5 text-primary" />
            <p className="text-sm font-bold text-muted-foreground">Pencapaian</p>
          </div>
          <p className="text-4xl font-display font-bold text-primary mb-1">
            {unlockedBadgesCount} <span className="text-lg text-muted-foreground font-medium">/ {totalBadges}</span>
          </p>
          <p className="text-xs text-muted-foreground">Lencana Terbuka</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl border bg-card p-6"
        >
          <h3 className="font-display font-bold text-xl mb-6">Aktivitas Belajar & Ibadah</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-emerald-500" />
                <span className="font-medium">Total Baca Qur'an</span>
              </div>
              <span className="font-bold text-lg">{store.readCount}x</span>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Total Dzikir</span>
              </div>
              <span className="font-bold text-lg">{store.dzikirCount}x</span>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Sesi Edukasi AI</span>
              </div>
              <span className="font-bold text-lg">{store.chatCount}x</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl border bg-card p-6"
        >
          <h3 className="font-display font-bold text-xl mb-6">Lencana Diraih</h3>
          
          {unlockedBadgesCount === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Belum ada lencana yang terbuka.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_BADGES.map((badge) => {
                const isUnlocked = store.unlockedBadges.includes(badge.id);
                if (!isUnlocked) return null;
                return (
                  <div key={badge.id} className="p-3 rounded-xl border bg-primary/5 border-primary/20 flex flex-col items-center text-center">
                    <div className="text-2xl mb-2">{badge.icon}</div>
                    <p className="font-bold text-xs leading-tight mb-1">{badge.name}</p>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                      <CheckCircle2 className="h-3 w-3" /> Selesai
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      <div className="p-6 bg-gradient-to-br from-primary/10 to-teal/10 rounded-3xl border border-primary/20 text-center">
        <h3 className="font-display font-bold text-lg mb-2">Perlu Bantuan Edukasi Seks?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Kami menyediakan panduan peran gender dan edukasi yang sesuai dengan syariat Islam berdasarkan umur anak.
        </p>
        <a href="/kids/gender-edu">
          <Button className="rounded-xl px-8">Buka Panduan Gender</Button>
        </a>
      </div>
    </div>
  );
}
