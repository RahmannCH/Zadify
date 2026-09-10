import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Reminder {
  id: string;
  type: "savings" | "prayer" | "reading" | "custom";
  title: string;
  message: string;
  time: string; // HH:mm format
  enabled: boolean;
  lastTriggered?: string;
}

interface ReminderState {
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, "id">) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  toggleReminder: (id: string) => void;
  markTriggered: (id: string) => void;
}

export const useReminderStore = create<ReminderState>()(
  persist(
    (set) => ({
      reminders: [
        {
          id: "savings-daily",
          type: "savings",
          title: "Waktunya Menabung!",
          message: "Jangan lupa sisihkan sebagian penghasilan untuk tabungan haji/umroh.",
          time: "08:00",
          enabled: true,
        },
        {
          id: "prayer-subuh",
          type: "prayer",
          title: "Sholat Subuh",
          message: "Waktu Subuh telah tiba. Mari tunaikan sholat.",
          time: "04:30",
          enabled: true,
        },
        {
          id: "quran-daily",
          type: "reading",
          title: "Baca Al-Qur'an",
          message: "Waktunya membaca Al-Qur'an hari ini.",
          time: "18:00",
          enabled: true,
        },
      ],

      addReminder: (reminder) =>
        set((state) => ({
          reminders: [...state.reminders, { ...reminder, id: Date.now().toString() }],
        })),

      updateReminder: (id, updates) =>
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      deleteReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.filter((r) => r.id !== id),
        })),

      toggleReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, enabled: !r.enabled } : r
          ),
        })),

      markTriggered: (id) =>
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, lastTriggered: new Date().toISOString() } : r
          ),
        })),
    }),
    {
      name: "reminder-storage",
    }
  )
);

// Utility hook for checking reminders
export function useReminderCheck() {
  const { reminders, markTriggered } = useReminderStore();

  const checkReminders = () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const today = now.toISOString().split("T")[0];

    reminders.forEach((reminder) => {
      if (!reminder.enabled) return;
      if (reminder.lastTriggered?.startsWith(today)) return;
      if (reminder.time <= currentTime) {
        // Trigger notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(reminder.title, {
            body: reminder.message,
            icon: "/icon-192x192.png",
          });
        }
        markTriggered(reminder.id);
      }
    });
  };

  return { checkReminders };
}
