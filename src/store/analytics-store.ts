import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getWitaDate } from "./prayer-store";

export interface DailyActivityLog {
  date: string; // YYYY-MM-DD
  ayahsRead: number;
  minutesSpent: number;
  dzikirCount: number;
  prayersCompleted: number;
  tadabburCount: number;
  xpEarned: number;
}

interface AnalyticsStore {
  history: Record<string, DailyActivityLog>;
  
  logReading: (ayahs: number, minutes?: number) => void;
  logDzikir: (count: number) => void;
  logPrayer: () => void;
  logTadabbur: () => void;
  logXp: (amount: number) => void;
  
  getHeatmapData: (days?: number) => { date: string; intensity: number; count: number }[];
  getWeeklySummary: () => { totalAyahs: number; totalMinutes: number; avgDailyAyahs: number };
}

export const useAnalyticsStore = create<AnalyticsStore>()(
  persist(
    (set, get) => ({
      history: {},

      logReading: (ayahs, minutes = 1) => {
        const today = getWitaDate();
        set((state) => {
          const current = state.history[today] || {
            date: today,
            ayahsRead: 0,
            minutesSpent: 0,
            dzikirCount: 0,
            prayersCompleted: 0,
            tadabburCount: 0,
            xpEarned: 0,
          };
          return {
            history: {
              ...state.history,
              [today]: {
                ...current,
                ayahsRead: current.ayahsRead + ayahs,
                minutesSpent: current.minutesSpent + minutes,
              },
            },
          };
        });
      },

      logDzikir: (count) => {
        const today = getWitaDate();
        set((state) => {
          const current = state.history[today] || {
            date: today,
            ayahsRead: 0,
            minutesSpent: 0,
            dzikirCount: 0,
            prayersCompleted: 0,
            tadabburCount: 0,
            xpEarned: 0,
          };
          return {
            history: {
              ...state.history,
              [today]: { ...current, dzikirCount: current.dzikirCount + count },
            },
          };
        });
      },

      logPrayer: () => {
        const today = getWitaDate();
        set((state) => {
          const current = state.history[today] || {
            date: today,
            ayahsRead: 0,
            minutesSpent: 0,
            dzikirCount: 0,
            prayersCompleted: 0,
            tadabburCount: 0,
            xpEarned: 0,
          };
          return {
            history: {
              ...state.history,
              [today]: { ...current, prayersCompleted: Math.min(5, current.prayersCompleted + 1) },
            },
          };
        });
      },

      logTadabbur: () => {
        const today = getWitaDate();
        set((state) => {
          const current = state.history[today] || {
            date: today,
            ayahsRead: 0,
            minutesSpent: 0,
            dzikirCount: 0,
            prayersCompleted: 0,
            tadabburCount: 0,
            xpEarned: 0,
          };
          return {
            history: {
              ...state.history,
              [today]: { ...current, tadabburCount: current.tadabburCount + 1 },
            },
          };
        });
      },

      logXp: (amount) => {
        const today = getWitaDate();
        set((state) => {
          const current = state.history[today] || {
            date: today,
            ayahsRead: 0,
            minutesSpent: 0,
            dzikirCount: 0,
            prayersCompleted: 0,
            tadabburCount: 0,
            xpEarned: 0,
          };
          return {
            history: {
              ...state.history,
              [today]: { ...current, xpEarned: current.xpEarned + amount },
            },
          };
        });
      },

      getHeatmapData: (days = 60) => {
        const history = get().history;
        const result = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = getWitaDate(d);
          const log = history[dateStr];
          const totalActivity = log
            ? log.ayahsRead + log.dzikirCount / 10 + log.prayersCompleted * 5
            : 0;

          let intensity = 0;
          if (totalActivity > 30) intensity = 4;
          else if (totalActivity > 15) intensity = 3;
          else if (totalActivity > 5) intensity = 2;
          else if (totalActivity > 0) intensity = 1;

          result.push({
            date: dateStr,
            intensity,
            count: log ? log.ayahsRead : 0,
          });
        }
        return result;
      },

      getWeeklySummary: () => {
        const history = get().history;
        const today = new Date();
        let totalAyahs = 0;
        let totalMinutes = 0;

        for (let i = 0; i < 7; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = getWitaDate(d);
          const log = history[dateStr];
          if (log) {
            totalAyahs += log.ayahsRead;
            totalMinutes += log.minutesSpent;
          }
        }

        return {
          totalAyahs,
          totalMinutes,
          avgDailyAyahs: Math.round(totalAyahs / 7),
        };
      },
    }),
    { name: "zadify-analytics-storage" }
  )
);
