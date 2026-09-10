"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "@/components/layout/back-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  PlaneTakeoff,
  Flame,
  Wallet,
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Zap,
  BookOpen,
  DollarSign,
  Volume2,
  VolumeX,
} from "lucide-react";
import { sfx } from "@/lib/sfx";
import {
  useHajiSavingsStore,
  calculateInflatedCost,
  calculateMonthlyContribution,
  calculateIncomePercentage,
  calculateDepartureDate,
  getSavingsBreakdown,
} from "@/store/haji-savings-store";

const HAJ_ROADMAP = [
  { step: 1, title: "Persiapan Mental & Spiritual", desc: "Niat ikhlas, belajar tata cara haji, perbanyak doa", icon: "🤲" },
  { step: 2, title: "Persiapan Fisik & Kesehatan", desc: "Medical check-up, vaksinasi, olahraga rutin", icon: "💪" },
  { step: 3, title: "Persiapan Dokumen", desc: "Paspor, visa, surat keterangan dari kantor", icon: "📋" },
  { step: 4, title: "Persiapan Barang & Pakaian", desc: "Beli pakaian ihram, sandal, overhead bag", icon: "👜" },
  { step: 5, title: "Persiapan Keluarga", desc: "Urus warisan, wasiat, rencana jika ada hal darurat", icon: "👨‍👩‍👧‍👦" },
  { step: 6, title: "Tabung Sesuai Target", desc: "Kumpulkan dana sesuai rencana savings yang sudah dibuat", icon: "💰" },
  { step: 7, title: "Daftar ke Travel Haji", desc: "Pilih agen terpercaya, daftar, lunasi pembayaran", icon: "✈️" },
  { step: 8, title: "Mengerjakan Ibadah Haji", desc: "Berangkat, menjalankan rukun haji, menjadi haji sejati", icon: "🕌" },
];

const DOA_HAJI = [
  { title: "Doa Niat Haji", arabic: "اللَّهُمَّ إِنِّي نَوَيْتُ الْحَجَّ لِوَجْهِكَ الْكَرِيمِ فَيَسِّرْهُ لِي وَتَقَبَّلْهُ مِنِّي", meaning: "Ya Allah, aku berniat untuk menunaikan haji karena wajah-Mu yang mulia, maka mudahkanlah dan terimalah dari aku." },
  { title: "Talbiyah", arabic: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكُ لَا شَرِيكَ لَكَ", meaning: "Aku datang, ya Allah, aku datang. Tiada sekutu bagi-Mu, aku datang. Sesungguhnya segala puji dan nikmat adalah milik-Mu dan segala kerajaan adalah milik-Mu." },
  { title: "Doa di Arafah", arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ", meaning: "Tidak ada Tuhan selain Engkau. Maha Suci Engkau, sesungguhnya aku adalah termasuk orang-orang yang zalim." },
];

export default function EnhancedHajiCalculator() {
  const store = useHajiSavingsStore();
  const [type, setType] = useState<"umroh" | "haji">("umroh");
  const [biayaAwal, setBiayaAwal] = useState(35000000);
  const [inflasi, setInflasi] = useState(5);
  const [targetTahun, setTargetTahun] = useState(3);
  const [monthlyIncome, setMonthlyIncome] = useState(5000000);
  const [dailySavings, setDailySavings] = useState(0);
  const [activeTab, setActiveTab] = useState<"kalkulator" | "riwayat" | "roadmap" | "doa">("kalkulator");
  const [playingDoaIndex, setPlayingDoaIndex] = useState<number | null>(null);

  const handlePlayDoaAudio = (arabic: string, index: number) => {
    sfx.playTap();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (playingDoaIndex === index) {
        window.speechSynthesis.cancel();
        setPlayingDoaIndex(null);
        return;
      }
      window.speechSynthesis.resume();
      window.speechSynthesis.cancel();

      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find((v) => v.lang.startsWith("ar"));

      const utterance = new SpeechSynthesisUtterance(arabic);
      if (arabicVoice) {
        utterance.voice = arabicVoice;
        utterance.lang = "ar-SA";
        utterance.rate = 0.85;
      } else {
        utterance.lang = "ar-SA";
        utterance.rate = 0.9;
      }

      utterance.onend = () => setPlayingDoaIndex(null);
      utterance.onerror = () => setPlayingDoaIndex(null);

      setPlayingDoaIndex(index);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    store.calculateStreak();
  }, [store.savingsHistory]);

  const biayaFuture = calculateInflatedCost(biayaAwal, inflasi, targetTahun);
  const monthlyNeeded = calculateMonthlyContribution(biayaFuture, store.currentSavings, targetTahun * 12);
  const incomePercent = calculateIncomePercentage(monthlyNeeded, monthlyIncome);
  const departureDate = calculateDepartureDate(store.currentSavings, biayaFuture, monthlyNeeded);
  const breakdown = getSavingsBreakdown(biayaFuture);
  const progress = Math.min(100, (store.currentSavings / biayaFuture) * 100);

  const formatRp = (value: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
  };

  const handleAddSavings = () => {
    if (dailySavings > 0) {
      store.addSavings(dailySavings, `Tabungan harian`);
      setDailySavings(0);
      sfx.playSuccess();
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-32">
      <BackButton />

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
            <PlaneTakeoff className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold">Tabungan Haji & Umroh</h1>
        </div>
        <p className="text-muted-foreground">Rencanakan perjalanan ibadah suci dengan sistem tabungan terstruktur dan reminder harian.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {(["kalkulator", "riwayat", "roadmap", "doa"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === tab
                ? "bg-primary text-white shadow-md"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {tab === "kalkulator" && "💰 Kalkulator"}
            {tab === "riwayat" && "📊 Riwayat"}
            {tab === "roadmap" && "🗺️ Roadmap"}
            {tab === "doa" && "🤲 Doa"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: KALKULATOR */}
        {activeTab === "kalkulator" && (
          <motion.div
            key="kalkulator"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Form Input */}
              <div className="space-y-4">
                <div className="rounded-3xl border bg-card p-6">
                  <h3 className="font-display font-bold text-lg mb-4">⚙️ Pengaturan Target</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-bold mb-2 block">Jenis Ibadah</label>
                      <div className="flex gap-2">
                        <Button
                          variant={type === "umroh" ? "default" : "outline"}
                          onClick={() => setType("umroh")}
                          className="flex-1 rounded-xl"
                        >
                          Umroh
                        </Button>
                        <Button
                          variant={type === "haji" ? "default" : "outline"}
                          onClick={() => setType("haji")}
                          className="flex-1 rounded-xl"
                        >
                          Haji
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-muted-foreground mb-2 block">
                        Estimasi Biaya Saat Ini
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">Rp</span>
                        <Input
                          type="number"
                          value={biayaAwal}
                          onChange={(e) => setBiayaAwal(Number(e.target.value))}
                          className="pl-12 h-12 rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-muted-foreground mb-2 block">
                        Inflasi Tahunan: {inflasi}%
                      </label>
                      <Slider value={[inflasi]} onValueChange={(v) => setInflasi(Array.isArray(v) ? v[0] : v)} min={0} max={20} step={0.5} className="rounded-xl" />
                    </div>

                    <div>
                      <label className="text-sm font-bold text-muted-foreground mb-2 block">
                        Target Berangkat dalam: {targetTahun} tahun
                      </label>
                      <Slider value={[targetTahun]} onValueChange={(v) => setTargetTahun(Array.isArray(v) ? v[0] : v)} min={1} max={10} step={1} className="rounded-xl" />
                    </div>

                    <div>
                      <label className="text-sm font-bold text-muted-foreground mb-2 block">
                        Penghasilan Bulanan
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">Rp</span>
                        <Input
                          type="number"
                          value={monthlyIncome}
                          onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                          className="pl-12 h-12 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <label className="text-sm font-bold text-muted-foreground mb-2 block">Tabung Hari Ini</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">Rp</span>
                          <Input
                            type="number"
                            value={dailySavings}
                            onChange={(e) => setDailySavings(Number(e.target.value))}
                            placeholder="0"
                            className="pl-12 h-12 rounded-xl"
                          />
                        </div>
                        <Button onClick={handleAddSavings} className="px-6 rounded-xl" size="lg">
                          <Zap className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="space-y-4">
                {/* Progress Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border bg-gradient-to-br from-primary/10 to-teal/10 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-lg">Progress Tabungan</h3>
                    <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
                  </div>

                  <div className="h-4 w-full bg-muted rounded-full overflow-hidden mb-6">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-teal"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Terkumpul</p>
                      <p className="font-bold text-emerald-600">{formatRp(store.currentSavings)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Target</p>
                      <p className="font-bold text-primary">{formatRp(biayaFuture)}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl border bg-card p-4"
                  >
                    <p className="text-xs text-muted-foreground mb-1">💰 Per Bulan</p>
                    <p className="font-bold text-lg">{formatRp(monthlyNeeded)}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl border bg-card p-4"
                  >
                    <p className="text-xs text-muted-foreground mb-1">📊 % Gaji</p>
                    <p className={`font-bold text-lg ${incomePercent > 20 ? "text-rose-600" : "text-emerald-600"}`}>
                      {incomePercent}%
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl border bg-card p-4"
                  >
                    <p className="text-xs text-muted-foreground mb-1">📅 Perkiraan</p>
                    <p className="font-bold text-lg">
                      {departureDate
                        ? new Date(departureDate).toLocaleDateString("id-ID", { year: "numeric", month: "short" })
                        : "-"}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl border bg-card p-4 flex items-center justify-center"
                  >
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">🔥 Streak</p>
                      <p className="font-bold text-2xl text-amber-600">{store.savingsStreak}</p>
                    </div>
                  </motion.div>
                </div>

                {/* Expense Breakdown */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-3xl border bg-card p-6"
                >
                  <h4 className="font-bold mb-4">📋 Rincian Biaya</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>✈️ Tiket Pesawat (35%)</span>
                      <span className="font-bold">{formatRp(breakdown.airfare)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>🏨 Penginapan (30%)</span>
                      <span className="font-bold">{formatRp(breakdown.accommodation)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>📄 Visa (5%)</span>
                      <span className="font-bold">{formatRp(breakdown.visa)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>🚗 Transportasi (15%)</span>
                      <span className="font-bold">{formatRp(breakdown.transportation)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>🍽️ Makan (10%)</span>
                      <span className="font-bold">{formatRp(breakdown.meals)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span>⚠️ Darurat (5%)</span>
                      <span className="font-bold text-amber-600">{formatRp(breakdown.contingency)}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: RIWAYAT */}
        {activeTab === "riwayat" && (
          <motion.div
            key="riwayat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="rounded-3xl border bg-card p-6"
          >
            <h3 className="font-display font-bold text-lg mb-4">📊 Riwayat Tabungan Harian</h3>

            {store.savingsHistory.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Belum ada riwayat tabungan. Mulai sekarang!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {store.savingsHistory.map((record, idx) => (
                  <motion.div
                    key={`${record.date}-${idx}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-sm">{new Date(record.date).toLocaleDateString("id-ID")}</p>
                      {record.note && <p className="text-xs text-muted-foreground">{record.note}</p>}
                    </div>
                    <p className="font-bold text-emerald-600">{formatRp(record.amount)}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: ROADMAP */}
        {activeTab === "roadmap" && (
          <motion.div
            key="roadmap"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {HAJ_ROADMAP.map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-2xl border bg-card p-5 hover:shadow-lg transition-all hover:border-primary/50"
              >
                <div className="flex gap-4">
                  <div className="text-4xl shrink-0">{item.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold font-display text-lg mb-1">
                      Step {item.step}: {item.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* TAB 4: DOA */}
        {activeTab === "doa" && (
          <motion.div
            key="doa"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {DOA_HAJI.map((doa, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-3xl border bg-card p-6"
              >
                <h4 className="font-display font-bold text-lg mb-4">🤲 {doa.title}</h4>
                <p className="font-arabic text-2xl leading-loose text-primary mb-4 text-right" dir="rtl">
                  {doa.arabic}
                </p>
                <p className="text-sm text-muted-foreground italic mb-3 font-medium">{doa.meaning}</p>
                <Button
                  onClick={() => handlePlayDoaAudio(doa.arabic, idx)}
                  variant={playingDoaIndex === idx ? "default" : "outline"}
                  className="w-full rounded-xl text-sm gap-2"
                >
                  {playingDoaIndex === idx ? (
                    <>
                      <VolumeX className="h-4 w-4 text-amber-300 animate-pulse" />
                      Hentikan Audio
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4" />
                      Dengarkan Audio Doa
                    </>
                  )}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
