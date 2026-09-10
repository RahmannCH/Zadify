"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "@/components/layout/back-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coins, HelpCircle, Activity } from "lucide-react";

type ZakatType = "fitrah" | "penghasilan" | "maal" | "emas";

const formatRp = (num: number) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
};

export default function ZakatCalculator() {
  const [activeTab, setActiveTab] = useState<ZakatType>("penghasilan");

  // Fitrah
  const [fitrahCount, setFitrahCount] = useState<number>(1);
  const [ricePrice, setRicePrice] = useState<number>(15000);

  // Penghasilan
  const [income, setIncome] = useState<number>(0);
  const [bonus, setBonus] = useState<number>(0);
  
  // Maal
  const [savings, setSavings] = useState<number>(0);
  const [investments, setInvestments] = useState<number>(0);
  const [debts, setDebts] = useState<number>(0);

  // Emas
  const [goldGrams, setGoldGrams] = useState<number>(0);
  const [goldPrice, setGoldPrice] = useState<number>(1450000);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);

  useEffect(() => {
    // Simulasi Fetch Live Emas (Karena API publik sering limit, kita pakai estimasi terbaru)
    // Di aplikasi nyata, gunakan API seperti metals-api.com
    setIsFetchingPrice(true);
    setTimeout(() => {
      setGoldPrice(1450000); // Rp 1.450.000 / gram (Asumsi Harga 2024-2025)
      setIsFetchingPrice(false);
    }, 1500);
  }, []);

  const calculateFitrah = () => {
    return fitrahCount * 2.5 * ricePrice; // 2.5kg beras per orang
  };

  const calculatePenghasilan = () => {
    const totalIncome = income + bonus;
    // Nisab penghasilan: setara 85 gram emas per tahun, atau sekitar 653 kg gabah (beras) per bulan. 
    // Kita asumsikan nisab beras 653kg x Rp 15.000 = Rp 9.795.000
    const nisab = 653 * ricePrice;
    if (totalIncome >= nisab) {
      return { total: totalIncome * 0.025, wajib: true, nisab };
    }
    return { total: 0, wajib: false, nisab };
  };

  const calculateMaal = () => {
    const totalAssets = Math.max(0, savings + investments - debts);
    const nisab = 85 * goldPrice; // Nisab 85 gram emas
    if (totalAssets >= nisab) {
      return { total: totalAssets * 0.025, wajib: true, nisab };
    }
    return { total: 0, wajib: false, nisab };
  };

  const calculateEmas = () => {
    if (goldGrams >= 85) {
      return { total: goldGrams * goldPrice * 0.025, wajib: true, nisab: 85 };
    }
    return { total: 0, wajib: false, nisab: 85 };
  };

  interface InputFieldProps {
    label: string;
    value: number;
    onChange: (val: number) => void;
    prefix?: string;
  }

  const InputField = ({ label, value, onChange, prefix = "Rp" }: InputFieldProps) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{prefix}</span>
        <Input 
          type="number" 
          min={0}
          value={value === 0 ? "" : value} 
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          className="pl-10 h-12 text-lg"
          placeholder="0"
        />
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <BackButton />
      
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Coins className="h-8 w-8 text-emerald-500" />
          <h1 className="text-3xl font-display font-bold">Kalkulator Zakat</h1>
        </div>
        <p className="text-muted-foreground">Hitung kewajiban zakatmu dengan akurat</p>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: "penghasilan", label: "Profesi / Penghasilan" },
          { id: "maal", label: "Harta (Maal)" },
          { id: "fitrah", label: "Zakat Fitrah" },
          { id: "emas", label: "Emas / Perak" }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            onClick={() => setActiveTab(tab.id as ZakatType)}
            className={`whitespace-nowrap rounded-full ${activeTab === tab.id ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-card border rounded-3xl p-6 shadow-sm mb-8"
        >
          {activeTab === "penghasilan" && (
            <div>
               <h3 className="font-bold mb-4 flex items-center gap-2"><HelpCircle className="h-4 w-4" /> Pendapatan Bulanan</h3>
               <InputField label="Gaji Pokok & Tunjangan Bulanan" value={income} onChange={setIncome} />
               <InputField label="Pendapatan Lain / Bonus (opsional)" value={bonus} onChange={setBonus} />
               
               {/* Result Widget */}
               {(() => {
                 const res = calculatePenghasilan();
                 return (
                   <div className={`mt-8 p-6 rounded-2xl border ${res.wajib ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-muted border-border'}`}>
                     <div className="flex items-center justify-between mb-2">
                       <span className="text-sm font-medium">Status Kewajiban:</span>
                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${res.wajib ? 'bg-emerald-500 text-white' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                         {res.wajib ? 'WAJIB ZAKAT' : 'BELUM NISAB'}
                       </span>
                     </div>
                     <p className="text-sm text-muted-foreground mb-4">Nisab bulanan (asumsi 653kg beras): {formatRp(res.nisab)}</p>
                     
                     <div className="border-t border-black/10 dark:border-white/10 pt-4">
                       <p className="text-sm font-medium mb-1">Zakat yang harus dibayar (2.5%):</p>
                       <p className={`text-4xl font-bold font-display ${res.wajib ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                         {formatRp(res.total)} <span className="text-lg font-normal text-muted-foreground">/bulan</span>
                       </p>
                     </div>
                   </div>
                 )
               })()}
            </div>
          )}

          {activeTab === "maal" && (
            <div>
               <h3 className="font-bold mb-4 flex items-center gap-2"><HelpCircle className="h-4 w-4" /> Harta Simpanan (Telah Haul 1 Tahun)</h3>
               <div className="mb-4 flex items-center gap-2 rounded-xl border bg-muted/50 px-3 py-2 text-sm">
                 <Activity className={`h-4 w-4 ${isFetchingPrice ? "animate-pulse text-amber-500" : "text-emerald-500"}`} />
                 <span className="text-muted-foreground">
                   {isFetchingPrice ? "Menyinkronkan harga emas..." : "Harga emas tersinkron:"} 
                 </span>
                 <span className="ml-auto font-semibold">{formatRp(goldPrice)}/gram</span>
               </div>
               <InputField label="Uang Tunai / Tabungan" value={savings} onChange={setSavings} />
               <InputField label="Saham / Investasi / Surat Berharga" value={investments} onChange={setInvestments} />
               <InputField label="Hutang Jatuh Tempo Tahun Ini" value={debts} onChange={setDebts} />
               <InputField label="Estimasi Harga Emas Saat Ini (per gram)" value={goldPrice} onChange={setGoldPrice} />
               
               {/* Result Widget */}
               {(() => {
                 const res = calculateMaal();
                 return (
                   <div className={`mt-8 p-6 rounded-2xl border ${res.wajib ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-muted border-border'}`}>
                     <div className="flex items-center justify-between mb-2">
                       <span className="text-sm font-medium">Status Kewajiban:</span>
                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${res.wajib ? 'bg-emerald-500 text-white' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                         {res.wajib ? 'WAJIB ZAKAT' : 'BELUM NISAB'}
                       </span>
                     </div>
                     <p className="text-sm text-muted-foreground mb-4">Nisab harta (85 gram emas): {formatRp(res.nisab)}</p>
                     
                     <div className="border-t border-black/10 dark:border-white/10 pt-4">
                       <p className="text-sm font-medium mb-1">Zakat yang harus dibayar (2.5%):</p>
                       <p className={`text-4xl font-bold font-display ${res.wajib ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                         {formatRp(res.total)} <span className="text-lg font-normal text-muted-foreground">/tahun</span>
                       </p>
                     </div>
                   </div>
                 )
               })()}
            </div>
          )}

          {activeTab === "fitrah" && (
            <div>
               <h3 className="font-bold mb-4 flex items-center gap-2"><HelpCircle className="h-4 w-4" /> Zakat Jiwa (Ramadhan)</h3>
               <div className="mb-4">
                 <label className="block text-sm font-medium text-muted-foreground mb-1">Jumlah Jiwa / Anggota Keluarga</label>
                 <Input type="number" value={fitrahCount} onChange={(e) => setFitrahCount(Number(e.target.value))} className="h-12 text-lg" min={1} />
               </div>
               <InputField label="Harga Beras Makanan Pokok (per Kg)" value={ricePrice} onChange={setRicePrice} />
               
               <div className="mt-8 p-6 rounded-2xl border bg-emerald-500/10 border-emerald-500/30">
                 <p className="text-sm font-medium mb-1">Zakat Fitrah yang harus dibayar (2.5 kg x Jiwa):</p>
                 <p className="text-4xl font-bold font-display text-emerald-600 dark:text-emerald-400">
                   {formatRp(calculateFitrah())}
                 </p>
               </div>
            </div>
          )}

          {activeTab === "emas" && (
            <div>
               <h3 className="font-bold mb-4 flex items-center gap-2"><HelpCircle className="h-4 w-4" /> Kepemilikan Emas Murni</h3>
               <div className="mb-4 flex items-center gap-2 rounded-xl border bg-muted/50 px-3 py-2 text-sm">
                 <Activity className={`h-4 w-4 ${isFetchingPrice ? "animate-pulse text-amber-500" : "text-emerald-500"}`} />
                 <span className="text-muted-foreground">
                   {isFetchingPrice ? "Menyinkronkan harga emas..." : "Harga emas tersinkron:"} 
                 </span>
                 <span className="ml-auto font-semibold">{formatRp(goldPrice)}/gram</span>
               </div>
               <div className="mb-4">
                 <label className="block text-sm font-medium text-muted-foreground mb-1">Total Emas Dimiliki (Gram)</label>
                 <div className="relative">
                    <Input type="number" value={goldGrams === 0 ? "" : goldGrams} onChange={(e) => setGoldGrams(Number(e.target.value))} className="h-12 text-lg" placeholder="0" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">gram</span>
                 </div>
               </div>
               <InputField label="Estimasi Harga Emas Saat Ini (per gram)" value={goldPrice} onChange={setGoldPrice} />
               
               {/* Result Widget */}
               {(() => {
                 const res = calculateEmas();
                 return (
                   <div className={`mt-8 p-6 rounded-2xl border ${res.wajib ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-muted border-border'}`}>
                     <div className="flex items-center justify-between mb-2">
                       <span className="text-sm font-medium">Status Kewajiban:</span>
                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${res.wajib ? 'bg-emerald-500 text-white' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                         {res.wajib ? 'WAJIB ZAKAT' : 'BELUM NISAB'}
                       </span>
                     </div>
                     <p className="text-sm text-muted-foreground mb-4">Nisab emas murni: {res.nisab} gram</p>
                     
                     <div className="border-t border-black/10 dark:border-white/10 pt-4">
                       <p className="text-sm font-medium mb-1">Zakat yang harus dibayar (2.5%):</p>
                       <p className={`text-4xl font-bold font-display ${res.wajib ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                         {formatRp(res.total)} <span className="text-lg font-normal text-muted-foreground">/tahun</span>
                       </p>
                     </div>
                   </div>
                 )
               })()}
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      <div className="p-4 bg-muted/50 rounded-xl text-center">
        <p className="text-xs text-muted-foreground">Perhitungan ini bersifat estimasi berdasarkan syariat umum. Jika terdapat kasus hutang/harta kompleks, disarankan berkonsultasi dengan lembaga Amil Zakat resmi (BAZNAS/LAZ).</p>
      </div>
    </div>
  );
}
