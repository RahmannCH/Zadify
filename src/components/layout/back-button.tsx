"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <motion.button
      onClick={handleBack}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed top-20 left-4 z-40 p-2.5 rounded-xl bg-background/80 backdrop-blur-md border shadow-sm hover:bg-accent text-foreground transition-all"
      aria-label="Kembali ke halaman sebelumnya"
      title="Kembali (Tekan Escape)"
    >
      <ArrowLeft className="h-5 w-5" />
    </motion.button>
  );
}
