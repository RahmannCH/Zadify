import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface HajiSavingsRecord {
  date: string; // ISO date
  amount: number;
  note?: string;
}

export interface HajiPlanState {
  // Basic info
  targetType: "umroh" | "haji";
  estimatedCost: number;
  currentSavings: number;
  targetYear: number;
  monthlyIncome: number;

  // Tracking
  savingsHistory: HajiSavingsRecord[];
  savingsStreak: number;
  lastSavingDate: string | null;

  // Actions
  setSavingsGoal: (type: "umroh" | "haji", cost: number, targetYear: number, monthlyIncome: number) => void;
  addSavings: (amount: number, note?: string) => void;
  updateSavingsHistory: (records: HajiSavingsRecord[]) => void;
  calculateStreak: () => void;
  resetPlan: () => void;
}

export const useHajiSavingsStore = create<HajiPlanState>()(
  persist(
    (set, get) => ({
      targetType: "umroh",
      estimatedCost: 35000000,
      currentSavings: 0,
      targetYear: 3,
      monthlyIncome: 5000000,
      savingsHistory: [],
      savingsStreak: 0,
      lastSavingDate: null,

      setSavingsGoal: (type, cost, targetYear, monthlyIncome) =>
        set({
          targetType: type,
          estimatedCost: cost,
          targetYear,
          monthlyIncome,
        }),

      addSavings: (amount, note) =>
        set((state) => {
          const today = new Date().toISOString().split("T")[0];
          const newRecord: HajiSavingsRecord = {
            date: today,
            amount,
            note,
          };

          // Cek apakah sudah ada catatan hari ini
          const existingIndex = state.savingsHistory.findIndex(
            (r) => r.date === today
          );

          let updatedHistory: HajiSavingsRecord[];
          if (existingIndex !== -1) {
            // Update existing record
            updatedHistory = [...state.savingsHistory];
            updatedHistory[existingIndex].amount += amount;
          } else {
            // Add new record
            updatedHistory = [newRecord, ...state.savingsHistory];
          }

          return {
            savingsHistory: updatedHistory,
            currentSavings: state.currentSavings + amount,
            lastSavingDate: today,
          };
        }),

      updateSavingsHistory: (records) =>
        set((state) => ({
          savingsHistory: records,
          currentSavings: records.reduce((sum, r) => sum + r.amount, 0),
        })),

      calculateStreak: () =>
        set((state) => {
          if (state.savingsHistory.length === 0) {
            return { savingsStreak: 0 };
          }

          const sorted = [...state.savingsHistory].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          let streak = 0;
          const today = new Date();
          const todayStr = today.toISOString().split("T")[0];
          
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          const latestStr = new Date(sorted[0].date).toISOString().split("T")[0];
          if (latestStr !== todayStr && latestStr !== yesterdayStr) {
            return { savingsStreak: 0 };
          }

          const startOffset = latestStr === yesterdayStr ? 1 : 0;

          for (let i = 0; i < sorted.length; i++) {
            const recordDateStr = new Date(sorted[i].date).toISOString().split("T")[0];
            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - (i + startOffset));
            const expectedDateStr = expectedDate.toISOString().split("T")[0];

            if (recordDateStr === expectedDateStr) {
              streak++;
            } else {
              break;
            }
          }

          return { savingsStreak: streak };
        }),

      resetPlan: () =>
        set({
          targetType: "umroh",
          estimatedCost: 35000000,
          currentSavings: 0,
          targetYear: 3,
          monthlyIncome: 5000000,
          savingsHistory: [],
          savingsStreak: 0,
          lastSavingDate: null,
        }),
    }),
    {
      name: "haji-savings-storage",
    }
  )
);

// Utility functions
export function calculateInflatedCost(
  currentCost: number,
  inflationRate: number,
  years: number
): number {
  return currentCost * Math.pow(1 + inflationRate / 100, years);
}

export function calculateMonthlyContribution(
  targetCost: number,
  currentSavings: number,
  monthsRemaining: number
): number {
  const remaining = Math.max(0, targetCost - currentSavings);
  return Math.ceil(remaining / monthsRemaining);
}

export function calculateIncomePercentage(
  monthlyContribution: number,
  monthlyIncome: number
): number {
  return Math.round((monthlyContribution / monthlyIncome) * 100 * 10) / 10;
}

export function calculateDepartureDate(
  currentSavings: number,
  targetCost: number,
  monthlyContribution: number
): Date | null {
  if (monthlyContribution === 0) return null;

  const remaining = Math.max(0, targetCost - currentSavings);
  const monthsNeeded = Math.ceil(remaining / monthlyContribution);

  const date = new Date();
  date.setMonth(date.getMonth() + monthsNeeded);
  return date;
}

export function getSavingsBreakdown(totalCost: number) {
  return {
    airfare: Math.round(totalCost * 0.35),
    accommodation: Math.round(totalCost * 0.30),
    visa: Math.round(totalCost * 0.05),
    transportation: Math.round(totalCost * 0.15),
    meals: Math.round(totalCost * 0.10),
    contingency: Math.round(totalCost * 0.05),
  };
}
