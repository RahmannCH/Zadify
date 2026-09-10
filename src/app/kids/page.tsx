"use client";

import { motion } from "framer-motion";
import { BackButton } from "@/components/layout/back-button";
import { Star, BookOpen, Smile, ChevronRight, Shield, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { sfx } from "@/lib/sfx";

const KIDS_FEATURES = [
  { href: "/kids/kisah-nabi", label: "Kisah Para Nabi", icon: BookOpen, desc: "Cerita teladan 15 Nabi & Rasul dengan hikmah menarik.", color: "text-amber-500", bg: "bg-amber-500/10" },
  { href: "/kids/parent", label: "Dashboard Orang Tua", icon: Shield, desc: "Pantau progress dan pencapaian ibadah anak.", color: "text-blue-500", bg: "bg-blue-500/10" },
  { href: "/kids/gender-edu", label: "Edukasi Tumbuh Kembang", icon: Smile, desc: "Panduan orang tua: Edukasi fitrah & gender versi Islam.", color: "text-indigo-500", bg: "bg-indigo-500/10" },
];

export default function KidsEduHub() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 min-h-[80vh]">
      <BackButton />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <div className="inline-block p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl mb-4 shadow-lg shadow-orange-500/30">
          <Star className="h-8 w-8 text-white fill-white" />
        </div>
        <h1 className="text-4xl font-display font-bold mb-3">Dunia Anak Muslim</h1>
        <p className="text-muted-foreground text-lg">Edukasi ceria, kisah nabi, dan panduan tumbuh kembang islami.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {KIDS_FEATURES.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <Link key={feat.href} href={feat.href} onClick={() => sfx.playWoosh()}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group p-6 rounded-3xl border bg-card hover:bg-accent hover:shadow-xl hover:-translate-y-1 transition-all flex items-start gap-5"
              >
                <div className={`p-4 rounded-2xl ${feat.bg}`}>
                  <Icon className={`h-8 w-8 ${feat.color}`} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl mb-1">{feat.label}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{feat.desc}</p>
                  <div className="flex items-center text-xs font-bold text-primary group-hover:gap-2 transition-all gap-1">
                    Mulai Jelajah <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
      
      <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
            <Rocket className="h-10 w-10 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-display font-bold mb-2">Panduan Mualaf & Belajar Tahap Awal</h3>
            <p className="text-white/80 max-w-lg text-sm leading-relaxed mb-4">
              Punya teman mualaf atau baru ingin mendalami Islam dari nol? Kami punya panduan bertahap (Beginner to Advance) untuk belajar sholat, wudhu, dan tauhid.
            </p>
            <Link href="/learn" onClick={() => sfx.playWoosh()}>
              <Button className="bg-white text-indigo-600 hover:bg-white/90 font-bold rounded-xl px-6">
                Lihat Roadmap Pembelajaran
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
