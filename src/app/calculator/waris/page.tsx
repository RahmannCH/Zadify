"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "@/components/layout/back-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollText, ArrowRight, ArrowLeft } from "lucide-react";

const formatRp = (num: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
};

export default function WarisCalculator() {
  const [step, setStep] = useState(1);

  // --- STEP 1: ASSETS ---
  const [totalAsset, setTotalAsset] = useState<number>(0);
  const [funeralCost, setFuneralCost] = useState<number>(0);
  const [debts, setDebts] = useState<number>(0);
  const [wasiat, setWasiat] = useState<number>(0);

  // --- STEP 2: DECEASED & SPOUSE ---
  const [gender, setGender] = useState<"l" | "p" | null>(null);
  const [spouseAlive, setSpouseAlive] = useState<boolean>(false);
  const [wivesCount, setWivesCount] = useState<number>(1);

  // --- STEP 3: CHILDREN & PARENTS ---
  const [sons, setSons] = useState<number>(0);
  const [daughters, setDaughters] = useState<number>(0);
  const [fatherAlive, setFatherAlive] = useState<boolean>(false);
  const [motherAlive, setMotherAlive] = useState<boolean>(false);

  const hartaSetelahUtang = totalAsset - funeralCost - debts;
  const maxWasiat = hartaSetelahUtang / 3;
  const validWasiat = Math.min(wasiat, Math.max(0, maxWasiat));
  const netEstate = hartaSetelahUtang - validWasiat;
  const hasChildren = sons > 0 || daughters > 0;

  const calculateFaraid = () => {
    let remaining = netEstate;
    const shares: { heir: string; percentage: string; amount: number; note?: string }[] = [];

    if (remaining <= 0) return { error: "Harta tidak tersisa setelah dipotong hutang/biaya." };

    let spouseAmount = 0;

    // --- 1. SPOUSE SHARE ---
    if (spouseAlive) {
      if (gender === "p") {
        const portion = hasChildren ? 1 / 4 : 1 / 2;
        spouseAmount = netEstate * portion;
        shares.push({ heir: "Suami", percentage: hasChildren ? "1/4 (Ada Keturunan)" : "1/2 (Tanpa Keturunan)", amount: spouseAmount });
      } else {
        const portion = hasChildren ? 1 / 8 : 1 / 4;
        spouseAmount = netEstate * portion;
        shares.push({ 
          heir: wivesCount > 1 ? `Istri (${wivesCount} orang dibagi rata)` : "Istri", 
          percentage: hasChildren ? "1/8 (Ada Keturunan)" : "1/4 (Tanpa Keturunan)", 
          amount: spouseAmount,
          note: wivesCount > 1 ? `Masing-masing mendapat ${formatRp(spouseAmount / wivesCount)}` : undefined
        });
      }
      remaining -= spouseAmount;
    }

    // --- 2. PARENTS & GHARRAWAIN CASE ---
    const isGharrawain = !hasChildren && spouseAlive && motherAlive && fatherAlive;

    if (isGharrawain) {
      const motherShare = remaining * (1 / 3);
      shares.push({ heir: "Ibu (Gharrawain)", percentage: "1/3 Sisa", amount: motherShare });
      remaining -= motherShare;

      const fatherShare = remaining;
      shares.push({ heir: "Ayah (Gharrawain - Asabah)", percentage: "2/3 Sisa", amount: fatherShare });
      remaining = 0;
    } else {
      if (motherAlive) {
        const portion = hasChildren ? 1 / 6 : 1 / 3;
        const amount = netEstate * portion;
        shares.push({ heir: "Ibu", percentage: hasChildren ? "1/6 (Ada Keturunan)" : "1/3 (Tanpa Keturunan)", amount });
        remaining -= amount;
      }

      if (fatherAlive) {
        if (hasChildren) {
          if (sons > 0) {
            const amount = netEstate * (1 / 6);
            shares.push({ heir: "Ayah", percentage: "1/6", amount });
            remaining -= amount;
          } else {
            const furudh = netEstate * (1 / 6);
            shares.push({ heir: "Ayah", percentage: "1/6 + Sisa", amount: furudh });
            remaining -= furudh;
          }
        }
      }
    }

    // --- 3. CHILDREN SHARES ---
    if (hasChildren) {
      if (sons > 0 && daughters > 0) {
        const totalShares = (sons * 2) + daughters;
        if (remaining > 0) {
          const valuePerShare = remaining / totalShares;
          shares.push({ 
            heir: sons > 1 ? `Anak Laki-laki (${sons} orang)` : "Anak Laki-laki", 
            percentage: "Asabah bil Ghair (2 Bagian)", 
            amount: valuePerShare * 2 * sons,
            note: `Masing-masing mendapat ${formatRp(valuePerShare * 2)}`
          });
          shares.push({ 
            heir: daughters > 1 ? `Anak Perempuan (${daughters} orang)` : "Anak Perempuan", 
            percentage: "Asabah bil Ghair (1 Bagian)", 
            amount: valuePerShare * daughters,
            note: `Masing-masing mendapat ${formatRp(valuePerShare)}`
          });
          remaining = 0;
        }
      } else if (sons > 0 && daughters === 0) {
        if (remaining > 0) {
          shares.push({ 
            heir: sons > 1 ? `Anak Laki-laki (${sons} orang)` : "Anak Laki-laki", 
            percentage: "Asabah binafsihi (Sisa)", 
            amount: remaining,
            note: sons > 1 ? `Masing-masing mendapat ${formatRp(remaining / sons)}` : undefined
          });
          remaining = 0;
        }
      } else if (sons === 0 && daughters > 0) {
        const daughterPortion = daughters === 1 ? 1 / 2 : 2 / 3;
        const daughterAmount = netEstate * daughterPortion;
        shares.push({
          heir: daughters === 1 ? "1 Anak Perempuan" : `Anak Perempuan (${daughters} orang)`,
          percentage: daughters === 1 ? "1/2 (Furudh)" : "2/3 (Furudh)",
          amount: daughterAmount,
          note: daughters > 1 ? `Masing-masing mendapat ${formatRp(daughterAmount / daughters)}` : undefined
        });
        remaining -= daughterAmount;

        if (fatherAlive && remaining > 0) {
          const existingFather = shares.find(s => s.heir.startsWith("Ayah"));
          if (existingFather) {
            existingFather.amount += remaining;
            existingFather.note = `Mendapat 1/6 (${formatRp(netEstate * (1 / 6))}) + Sisa (${formatRp(remaining)})`;
            remaining = 0;
          }
        }
      }
    } else if (!isGharrawain && fatherAlive && remaining > 0) {
      shares.push({ heir: "Ayah (Asabah)", percentage: "Sisa Harta", amount: remaining });
      remaining = 0;
    }

    // --- 4. KAIDAH 'AWL (Pengurangan Proporsional jika Total Furudh > Harta) ---
    const totalAllocated = shares.reduce((acc, s) => acc + s.amount, 0);
    if (totalAllocated > netEstate && totalAllocated > 0) {
      const awlFactor = netEstate / totalAllocated;
      for (const share of shares) {
        share.amount = Math.round(share.amount * awlFactor);
        share.note = (share.note ? share.note + " • " : "") + "Disesuaikan via kaidah 'Awl";
      }
      remaining = 0;
    } else if (remaining > 1) {
      shares.push({ heir: "Sisa Harta (Baitul Mal / Radd)", percentage: "Sisa", amount: remaining });
    }

    return { shares, netEstate };
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-32">
      <BackButton />

      <div className="mb-8 text-center">
        <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
          <ScrollText className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Kalkulator Waris (Faraid)</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Perhitungan pembagian harta waris otomatis berlandaskan syariat Islam (Al-Qur'an Surah An-Nisa).
        </p>
      </div>

      <div className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm">
        {/* --- STEPPER --- */}
        <div className="flex items-center justify-between mb-8 border-b pb-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step === s ? "bg-primary text-primary-foreground" : step > s ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {s}
              </div>
              <span className="text-xs font-semibold hidden sm:inline text-muted-foreground">
                {s === 1 ? "Harta" : s === 2 ? "Almarhum" : s === 3 ? "Keluarga" : "Hasil"}
              </span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* --- STEP 1: ASSETS --- */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="text-xl font-display font-bold mb-2">1. Rincian Harta Peninggalan</h2>
              
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Total Seluruh Harta (Aset, Tabungan, Tanah, Emas)</label>
                <Input type="number" min={0} value={totalAsset || ""} onChange={(e) => setTotalAsset(Math.max(0, Number(e.target.value)))} placeholder="Rp 0" className="h-12 text-lg font-bold" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1 block">Biaya Pengurusan Jenazah</label>
                  <Input type="number" min={0} value={funeralCost || ""} onChange={(e) => setFuneralCost(Math.max(0, Number(e.target.value)))} placeholder="Rp 0" className="h-12" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1 block">Hutang Almarhum/ah</label>
                  <Input type="number" min={0} value={debts || ""} onChange={(e) => setDebts(Math.max(0, Number(e.target.value)))} placeholder="Rp 0" className="h-12" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Wasiat (Maksimal 1/3 Sisa Harta Bersih)</label>
                <Input type="number" min={0} value={wasiat || ""} onChange={(e) => setWasiat(Math.max(0, Number(e.target.value)))} placeholder="Rp 0" className="h-12" />
                {wasiat > maxWasiat && maxWasiat > 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">Wasiat melebihi 1/3 harta bersih ({formatRp(maxWasiat)}). Sesuai syariat, batas maksimal adalah 1/3.</p>
                )}
              </div>

              <div className="p-4 bg-muted/40 rounded-2xl border text-sm mt-4">
                <div className="flex justify-between font-bold">
                  <span>Harta Waris Bersih (Tirkah):</span>
                  <span className="text-primary">{formatRp(Math.max(0, netEstate))}</span>
                </div>
              </div>

              <Button onClick={() => setStep(2)} disabled={totalAsset <= 0} className="w-full h-12 rounded-2xl font-bold mt-4">
                Lanjut: Data Almarhum <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* --- STEP 2: DECEASED & SPOUSE --- */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h2 className="text-xl font-display font-bold mb-2">2. Status Almarhum & Pasangan</h2>

              <div>
                <label className="text-xs font-bold text-muted-foreground mb-2 block">Jenis Kelamin Almarhum/ah</label>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant={gender === "l" ? "default" : "outline"} onClick={() => setGender("l")} className="h-14 rounded-2xl text-base font-bold">
                    👨 Laki-laki (Suami/Ayah)
                  </Button>
                  <Button variant={gender === "p" ? "default" : "outline"} onClick={() => setGender("p")} className="h-14 rounded-2xl text-base font-bold">
                    👩 Perempuan (Istri/Ibu)
                  </Button>
                </div>
              </div>

              {gender && (
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-2 block">Apakah Pasangan (Suami/Istri) Masih Hidup?</label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant={spouseAlive ? "default" : "outline"} onClick={() => setSpouseAlive(true)} className="h-12 rounded-2xl font-bold">
                      Ya, Masih Hidup
                    </Button>
                    <Button variant={!spouseAlive ? "default" : "outline"} onClick={() => setSpouseAlive(false)} className="h-12 rounded-2xl font-bold">
                      Tidak / Sudah Wafat
                    </Button>
                  </div>
                </div>
              )}

              {gender === "l" && spouseAlive && (
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1 block">Jumlah Istri yang Ditinggalkan</label>
                  <Input type="number" min={1} max={4} value={wivesCount} onChange={(e) => setWivesCount(Math.max(1, Math.min(4, Number(e.target.value))))} className="h-12 w-32" />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(1)} className="h-12 rounded-2xl px-6">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
                </Button>
                <Button onClick={() => setStep(3)} disabled={!gender} className="flex-1 h-12 rounded-2xl font-bold">
                  Lanjut: Data Ahli Waris <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* --- STEP 3: CHILDREN & PARENTS --- */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <h2 className="text-xl font-display font-bold mb-2">3. Anak & Orang Tua</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1 block">Anak Laki-laki</label>
                  <Input type="number" min={0} value={sons} onChange={(e) => setSons(Math.max(0, Number(e.target.value)))} className="h-12 text-center text-lg font-bold" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-1 block">Anak Perempuan</label>
                  <Input type="number" min={0} value={daughters} onChange={(e) => setDaughters(Math.max(0, Number(e.target.value)))} className="h-12 text-center text-lg font-bold" />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-muted-foreground block">Status Orang Tua Almarhum</label>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant={fatherAlive ? "default" : "outline"} onClick={() => setFatherAlive(!fatherAlive)} className="h-12 rounded-2xl font-bold">
                    {fatherAlive ? "✓ Ayah Hidup" : "Ayah Wafat"}
                  </Button>
                  <Button variant={motherAlive ? "default" : "outline"} onClick={() => setMotherAlive(!motherAlive)} className="h-12 rounded-2xl font-bold">
                    {motherAlive ? "✓ Ibu Hidup" : "Ibu Wafat"}
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(2)} className="h-12 rounded-2xl px-6">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1 h-12 rounded-2xl font-bold bg-gradient-to-r from-primary to-teal">
                  Hitung Pembagian Waris <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* --- STEP 4: RESULTS --- */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <h2 className="text-xl font-display font-bold">Hasil Pembagian Faraid</h2>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-xs font-bold text-primary">
                  Hitung Ulang
                </Button>
              </div>

              {(() => {
                const res = calculateFaraid();
                if ("error" in res) {
                  return <p className="text-rose-500 font-bold p-4 bg-rose-50 rounded-2xl">{res.error}</p>;
                }

                return (
                  <div className="space-y-3">
                    <div className="p-4 bg-muted/40 rounded-2xl flex justify-between text-xs font-bold mb-4">
                      <span>Total Harta Bersih:</span>
                      <span className="text-primary text-sm">{formatRp(res.netEstate)}</span>
                    </div>

                    {res.shares.map((share, idx) => (
                      <div key={idx} className="p-4 rounded-2xl border bg-card flex items-center justify-between gap-4">
                        <div>
                          <p className="font-bold text-sm text-foreground">{share.heir}</p>
                          <p className="text-xs text-muted-foreground font-medium">{share.percentage}</p>
                          {share.note && <p className="text-[11px] text-emerald-600 mt-0.5">{share.note}</p>}
                        </div>
                        <p className="font-display font-bold text-base md:text-lg text-primary shrink-0">
                          {formatRp(share.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                );
              })()}

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                <strong>Catatan Fiqih:</strong> Perhitungan ini mencakup ahli waris utama (Ashabul Furudh & Asabah). Untuk kasus mawaris yang lebih kompleks (seperti adanya kakek, nenek, saudara seayah/seibu, 'Awl, atau Radd), disarankan untuk berkonsultasi langsung dengan ulama atau Pengadilan Agama setempat.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
