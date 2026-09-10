import { BookOpen } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute h-16 w-16 rounded-full bg-emerald-500/20 animate-ping" />
        <div className="relative p-4 bg-emerald-500/10 text-emerald-600 rounded-2xl shadow-sm border border-emerald-500/20">
          <BookOpen className="h-8 w-8 animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        Memuat Zadify...
      </p>
    </div>
  );
}
