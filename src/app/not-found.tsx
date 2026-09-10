import Link from "next/link";
import { BookOpen, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center p-8 rounded-3xl border bg-card/60 backdrop-blur shadow-sm">
        <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-600 mb-6">
          <BookOpen className="h-10 w-10" />
        </div>

        <span className="inline-block text-xs font-bold tracking-widest text-emerald-600 uppercase mb-2">
          404 • Halaman Tidak Ditemukan
        </span>

        <h1 className="text-2xl font-bold font-display mb-2 text-foreground">
          Tersesat di Luar Lembaran
        </h1>

        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Halaman atau Surah yang Anda tuju tidak ditemukan atau telah dipindahkan.
          Mari kembali ke panduan Al-Qur'an dan ibadah harian.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="w-full sm:w-auto">
            <Button
              className="w-full gap-2 rounded-xl"
            >
              <Home className="h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </Link>

          <Link href="/search" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full gap-2 rounded-xl"
            >
              <Search className="h-4 w-4" />
              Cari Ayat
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
