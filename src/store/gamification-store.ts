import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getWitaDate } from "./prayer-store";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

export const AVAILABLE_BADGES: Badge[] = [
  { id: "first_read", name: "Langkah Pertama", description: "Membaca ayat pertama", icon: "📖" },
  { id: "night_owl", name: "Night Owl", description: "Membaca Al-Qur'an di atas jam 12 malam", icon: "🦉" },
  { id: "streak_7", name: "Istiqomah 7", description: "Membaca atau beribadah 7 hari berturut-turut", icon: "🔥" },
  { id: "hafiz_apprentice", name: "Murid Hafiz", description: "Menghafal 1 Surah atau 10 Ayat Mutqin", icon: "🎓" },
  { id: "jumuah_mubarak", name: "Jumu'ah Mubarak", description: "Buka Surah Al-Kahfi di hari Jumat", icon: "🕌" },
  { id: "chat_explorer", name: "Explorer", description: "Diskusi dengan Zad Mentor AI sebanyak 5 kali", icon: "🤖" },
  { id: "dzikir_master", name: "Dzikir Master", description: "Lakukan 1000x Tasbih & Dzikir", icon: "📿" },
  { id: "early_bird", name: "Pejuang Subuh", description: "Aktif membaca/sholat di waktu Subuh", icon: "🌅" },
  { id: "zakat_pioneer", name: "Perencana Syariat", description: "Menghitung Zakat atau Tabungan Haji", icon: "💰" },
  { id: "tarbiyah_champion", name: "Mualaf Pembelajar", description: "Menyelesaikan modul di Roadmap Belajar", icon: "⭐" },
  { id: "sunnah_lover", name: "Cinta Sunnah", description: "Menuntaskan amalan sunnah harian", icon: "💖" },
  { id: "quran_marathon", name: "Pembaca Setia", description: "Membaca total 50 ayat", icon: "📜" },
  { id: "hafiz_master", name: "Penjaga Al-Qur'an", description: "Menghafal 50 ayat Mutqin", icon: "👑" },
  { id: "quiz_master", name: "Jawara Trivia", description: "Lulus Kuis dengan skor sempurna (100%)", icon: "🏆" },
  { id: "hajj_planner", name: "Niat Rabbani", description: "Membuat target perencanaan Tabungan Haji", icon: "✈️" }
];

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  nextXp: number;
}

export interface DailyQuest {
  id: string;
  type: "read" | "dzikir" | "sholat";
  title: string;
  target: number;
  progress: number;
  xpReward: number;
  completed: boolean;
}

export function getLevelInfo(xp: number): LevelInfo {
  const levels = [
    { level: 1, title: "Mubtadi", minXp: 0, nextXp: 100 },
    { level: 2, title: "Mubtadi II", minXp: 100, nextXp: 300 },
    { level: 3, title: "Mubtadi III", minXp: 300, nextXp: 600 },
    { level: 4, title: "Mutawassith", minXp: 600, nextXp: 1200 },
    { level: 5, title: "Mutawassith II", minXp: 1200, nextXp: 2500 },
    { level: 6, title: "Muta'allim", minXp: 2500, nextXp: 5000 },
    { level: 7, title: "Muta'allim II", minXp: 5000, nextXp: 10000 },
    { level: 8, title: "Mujahid", minXp: 10000, nextXp: 20000 },
    { level: 9, title: "Mujahid II", minXp: 20000, nextXp: 40000 },
    { level: 10, title: "Hafiz", minXp: 40000, nextXp: 100000 }
  ];

  let current = levels[0];
  for (const lvl of levels) {
    if (xp >= lvl.minXp) current = lvl;
    else break;
  }
  return current;
}

interface GamificationStore {
  xp: number;
  unlockedBadges: string[];
  recentXpGains: { amount: number; reason: string; id: string }[];
  shields: number;
  readCount: number;
  chatCount: number;
  dzikirCount: number;
  
  dailyQuests: DailyQuest[];
  lastOpenedDate: string;
  lastOpenedTimestamp: number;
  lootboxAvailable: boolean;

  addXP: (amount: number, source: string) => void;
  addXp: (amount: number, reason: string) => void;
  clearRecentXpGain: (id: string) => void;
  unlockBadge: (badgeId: string) => void;
  incrementRead: () => void;
  incrementChat: () => void;
  incrementDzikir: (amount: number) => void;
  checkMilestones: () => void;
  checkAndResetQuests: () => void;
  updateQuestProgress: (type: "read" | "dzikir" | "sholat", amount: number) => void;
  claimLootbox: () => void;
}

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      xp: 0,
      unlockedBadges: [],
      recentXpGains: [],
      shields: 0,
      readCount: 0,
      chatCount: 0,
      dzikirCount: 0,
      dailyQuests: [
        { id: "q1", type: "read", title: "Baca 10 Ayat", target: 10, progress: 0, xpReward: 50, completed: false },
        { id: "q2", type: "dzikir", title: "Tasbih 33x", target: 33, progress: 0, xpReward: 50, completed: false },
        { id: "q3", type: "sholat", title: "Ceklis 3 Waktu Sholat", target: 3, progress: 0, xpReward: 100, completed: false },
      ],
      lastOpenedDate: getWitaDate(),
      lastOpenedTimestamp: Date.now(),
      lootboxAvailable: false,

      addXP: (amount: number, source: string) => {
        if (amount <= 0) return;
        const id = Date.now().toString() + Math.random().toString();
        set((state) => ({
          xp: state.xp + amount,
          lastOpenedTimestamp: Date.now(),
          recentXpGains: [...state.recentXpGains, { amount, reason: source, id }].slice(-20)
        }));
        get().checkMilestones();
      },

      addXp: (amount: number, reason: string) => {
        get().addXP(amount, reason);
      },

      checkAndResetQuests: () => {
        const today = getWitaDate();
        const state = get();
        if (today > state.lastOpenedDate || !state.dailyQuests || state.dailyQuests.length === 0) {
          const freshQuests: DailyQuest[] = [
            { id: "q1", type: "read", title: "Baca 10 Ayat", target: 10, progress: 0, xpReward: 50, completed: false },
            { id: "q2", type: "dzikir", title: "Tasbih 33x", target: 33, progress: 0, xpReward: 50, completed: false },
            { id: "q3", type: "sholat", title: "Ceklis 3 Waktu Sholat", target: 3, progress: 0, xpReward: 100, completed: false },
          ];
          set({
            dailyQuests: freshQuests,
            lastOpenedDate: today,
            lastOpenedTimestamp: Date.now(),
            lootboxAvailable: false
          });
        }
      },

      updateQuestProgress: (type, amount) => {
        get().checkAndResetQuests();
        let pendingXp = 0;
        let pendingReason = "";

        set((state) => {
          let updated = false;
          
          const newQuests = state.dailyQuests.map((q) => {
            if (q.type === type && !q.completed) {
              const newProgress = Math.min(q.progress + amount, q.target);
              if (newProgress !== q.progress) updated = true;
              const completed = newProgress >= q.target;
              if (completed && !q.completed) {
                pendingXp += q.xpReward;
                pendingReason = `Quest Selesai: ${q.title}`;
              }
              return { ...q, progress: newProgress, completed };
            }
            return q;
          });

          const finallyAllCompleted = newQuests.length > 0 && newQuests.every(q => q.completed);
          
          if (updated) {
            return { 
              dailyQuests: newQuests, 
              lastOpenedTimestamp: Date.now(),
              lootboxAvailable: finallyAllCompleted && !state.lootboxAvailable && state.dailyQuests.some(q => !q.completed)
                ? true 
                : state.lootboxAvailable 
            };
          }
          return state;
        });

        if (pendingXp > 0) {
          get().addXP(pendingXp, pendingReason);
        }
      },

      claimLootbox: () => {
        const state = get();
        if (state.lootboxAvailable) {
          get().addXP(200, "Membuka Peti Harian!");
          set({ lootboxAvailable: false });
        }
      },

      clearRecentXpGain: (id) => {
        set((state) => ({
          recentXpGains: state.recentXpGains.filter((g) => g.id !== id)
        }));
      },

      unlockBadge: (badgeId) => {
        set((state) => {
          if (state.unlockedBadges.includes(badgeId)) return state;
          return { unlockedBadges: [...state.unlockedBadges, badgeId] };
        });
      },

      incrementRead: () => {
        set((state) => ({ readCount: state.readCount + 1 }));
        get().updateQuestProgress("read", 1);
      },

      incrementChat: () => set((state) => ({ chatCount: state.chatCount + 1 })),

      incrementDzikir: (amount) => {
        set((state) => ({ dzikirCount: state.dzikirCount + amount }));
        get().updateQuestProgress("dzikir", amount);
      },

      checkMilestones: () => {
        const state = get();
        const hour = new Date().getHours();
        
        if (state.readCount >= 1) get().unlockBadge("first_read");
        if (state.readCount >= 50) get().unlockBadge("quran_marathon");
        if (hour >= 0 && hour < 4 && state.readCount > 0) get().unlockBadge("night_owl");
        if (hour >= 4 && hour <= 6) get().unlockBadge("early_bird");
        if (state.chatCount >= 5) get().unlockBadge("chat_explorer");
        if (state.dzikirCount >= 1000) get().unlockBadge("dzikir_master");
        
        const day = new Date().getDay();
        if (day === 5) get().unlockBadge("jumuah_mubarak");
      }
    }),
    { name: "gamification-storage" }
  )
);
