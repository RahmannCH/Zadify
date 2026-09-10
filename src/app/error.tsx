"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Zadify Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center p-8 rounded-3xl border bg-card/60 backdrop-blur shadow-sm">
        <div className="inline-flex p-4 rounded-full bg-amber-500/10 text-amber-500 mb-6">
          <AlertTriangle className="h-10 w-10" />
        </div>

        <h1 className="text-2xl font-bold font-display mb-2 text-foreground">
          Terjadi Kendala Teknis
        </h1>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Mohon maaf atas ketidaknyamanannya. Halaman ini mengalami kendala saat memuat data.
          Silakan coba muat ulang atau kembali ke Beranda.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto gap-2 rounded-xl"
          >
            <RotateCcw className="h-4 w-4" />
            Coba Lagi
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full gap-2 rounded-xl"
            >
              <Home className="h-4 w-4" />
              Ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
