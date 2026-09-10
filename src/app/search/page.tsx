"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Sparkles, Loader2, ArrowRight, Volume2, Copy, Check, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { searchQuran, getVerseAudioUrl } from "@/lib/api";
import { BackButton } from "@/components/layout/back-button";
import { sfx } from "@/lib/sfx";
import { extractTargetArabicStems, isArabicWordMatched } from "@/lib/arabic-matcher";

interface SearchResultItem {
  verse_key: string;
  text: string;
  translations: Array<{ text: string; name?: string }>;
}

const POPULAR_SEARCHES = [
  "Sungguh Allah",
  "Sabar",
  "Rezeki",
  "Orang Tua",
  "Surga",
  "Ampunan",
  "Kiamat",
  "Sholat",
  "Taqwa"
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const executeSearch = async (searchQuery: string, page = 1) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    sfx.playTap();

    try {
      const data = await searchQuran(searchQuery.trim(), "id", page);
      const searchData = data.search;

      if (page === 1) {
        setResults(searchData?.results || []);
      } else {
        setResults(prev => [...prev, ...(searchData?.results || [])]);
      }

      setTotalResults(searchData?.total_results || 0);
      setCurrentPage(searchData?.current_page || 1);
      setTotalPages(searchData?.total_pages || 1);
      setHasSearched(true);
      sfx.playSuccess();
    } catch (error) {
      console.error("Search error:", error);
      if (page === 1) setResults([]);
      setTotalResults(0);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query, 1);
  };

  const handleQuickSearch = (keyword: string) => {
    setQuery(keyword);
    executeSearch(keyword, 1);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !isLoading) {
      executeSearch(query, currentPage + 1);
    }
  };

  const handleCopyAyah = (result: SearchResultItem, surahId: string, ayahNum: string) => {
    const translationText = result.translations?.[0]?.text?.replace(/<[^>]*>/g, "") || "";
    navigator.clipboard.writeText(`${result.text.replace(/<[^>]*>/g, "")}\n\n"${translationText}"\n\n[QS. Surah ${surahId}: ${ayahNum}]\nZadify: The Comprehensive Digital Al-Qur'an Provision for Muslims`);
    setCopiedKey(result.verse_key);
    sfx.playSuccess();
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePlayAyahAudio = (surahId: number, ayahNum: number) => {
    sfx.playTap();
    const audioUrl = getVerseAudioUrl(surahId, ayahNum);
    const audio = new Audio(audioUrl);
    audio.play().catch(err => console.error("Audio error:", err));
  };

  // Helper untuk membersihkan dan meng-highlight teks pencarian secara presisi murni
  const renderHighlightedText = (htmlText: string, searchQuery: string) => {
    // 1. Bersihkan seluruh tag <em>/</em> bawaan API agar tidak salah sorot kata lain
    const cleanText = htmlText.replace(/<\/?em>/gi, "");

    if (!searchQuery.trim()) {
      return <span>{cleanText}</span>;
    }

    // 2. Ekstrak kata kunci pencarian murni dari input pengguna
    const qWords = searchQuery
      .trim()
      .split(/\s+/)
      .map((w) => w.replace(/[^a-zA-Z0-9]/g, ""))
      .filter((w) => w.length >= 2);

    if (qWords.length === 0) {
      return <span>{cleanText}</span>;
    }

    // 3. Bangun regex eksklusif hanya untuk kata yang dicari user
    const pattern = new RegExp(
      `(${qWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
      "gi"
    );
    const formatted = cleanText.replace(
      pattern,
      '<mark class="bg-amber-500/25 text-amber-900 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/30">$1</mark>'
    );

    return (
      <span
        dangerouslySetInnerHTML={{
          __html: formatted,
        }}
      />
    );
  };

  // Helper untuk meng-highlight kata Arab yang berkesinambungan dengan kata kunci terjemahan
  const renderHighlightedArabic = (arabicText: string, searchQuery: string) => {
    const rawClean = arabicText.replace(/<[^>]*>/g, "");
    if (!searchQuery.trim()) return rawClean;

    const stems = extractTargetArabicStems(searchQuery);
    const words = rawClean.split(" ");

    return (
      <span>
        {words.map((word, wIdx) => {
          const isMatch = isArabicWordMatched(word, stems, searchQuery);

          if (isMatch) {
            return (
              <span
                key={wIdx}
                className="inline-block bg-amber-500/25 text-amber-500 font-bold px-1.5 py-0.5 mx-0.5 rounded-lg border border-amber-500/40 shadow-sm transition-all duration-300"
              >
                {word}{" "}
              </span>
            );
          }

          return <span key={wIdx}>{word} </span>;
        })}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 pb-32 min-h-screen">
      <BackButton />

      <div className="mb-8 text-center md:text-left">
        <div className="inline-flex p-3 bg-primary/10 rounded-2xl text-primary mb-3">
          <Search className="h-6 w-6" />
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Pencarian Al-Qur&apos;an & Arti</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Cari ayat berdasarkan terjemahan bahasa Indonesia, teks Arab, atau kalimat apa pun secara komprehensif.
        </p>
      </div>

      {/* Form Search Bar */}
      <form onSubmit={handleSearchSubmit} className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Ketik kalimat atau arti (contoh: Sungguh Allah, Sabar, Rezeki)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 h-14 rounded-2xl text-sm md:text-base font-medium bg-card shadow-sm"
          />
        </div>
        <Button type="submit" disabled={isLoading || !query.trim()} className="h-14 px-8 rounded-2xl font-bold shadow-md text-base">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Cari Ayat"}
        </Button>
      </form>

      {/* Quick Search Chips */}
      <div className="mb-10 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
          <Sparkles className="h-3.5 w-3.5 text-gold" /> Populer:
        </span>
        {POPULAR_SEARCHES.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => handleQuickSearch(chip)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-muted/60 hover:bg-primary/10 hover:text-primary border border-border/60 hover:border-primary/30 whitespace-nowrap transition-all"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && results.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Mencari ayat di seluruh 30 Juz...</p>
        </div>
      )}

      {/* Search Results */}
      {hasSearched && !isLoading && results.length === 0 && (
        <div className="py-20 text-center bg-card border rounded-3xl p-8">
          <BookOpen className="h-14 w-14 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-bold text-lg mb-1">Ayat tidak ditemukan</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Tidak ada ayat atau terjemahan yang cocok dengan &ldquo;{query}&rdquo;. Coba gunakan kata kunci dasar lainnya.
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Ditemukan <span className="text-primary font-extrabold">{totalResults} Ayat</span> untuk &ldquo;{query}&rdquo;
            </p>
            <span className="text-xs text-muted-foreground">
              Halaman {currentPage} dari {totalPages}
            </span>
          </div>

          <div className="space-y-4">
            {results.map((result, idx) => {
              const [surahId, ayahNum] = result.verse_key.split(":");
              const translationItem = result.translations?.[0];
              const isCopied = copiedKey === result.verse_key;

              return (
                <motion.div
                  key={`${result.verse_key}-${idx}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                  className="rounded-3xl border bg-card p-6 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <Link
                      href={`/surah/${surahId}?highlight=${encodeURIComponent(query)}#verse-${ayahNum}`}
                      onClick={() => sfx.playWoosh()}
                      className="flex items-center gap-2 font-display font-bold text-base text-primary hover:underline"
                    >
                      <BookOpen className="h-4 w-4 shrink-0" />
                      <span>QS. Surah {surahId} : Ayat {ayahNum}</span>
                    </Link>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                        title="Putar Audio Ayat"
                        onClick={() => handlePlayAyahAudio(Number(surahId), Number(ayahNum))}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
                        title="Salin Teks Ayat & Terjemahan"
                        onClick={() => handleCopyAyah(result, surahId, ayahNum)}
                      >
                        {isCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </Button>

                      <Link href={`/surah/${surahId}?highlight=${encodeURIComponent(query)}#verse-${ayahNum}`} onClick={() => sfx.playWoosh()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-xl text-xs font-bold text-primary hover:bg-primary/10 gap-1 ml-1"
                        >
                          <span>Buka</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Teks Arab dengan Highlighting Sinkron */}
                  <p className="font-arabic text-2xl md:text-3xl text-right leading-loose text-primary mb-4" dir="rtl">
                    {renderHighlightedArabic(result.text, query)}
                  </p>

                  {/* Teks Terjemahan dengan Highlighting */}
                  {translationItem && (
                    <div className="pt-3 border-t text-xs md:text-sm text-foreground/90 leading-relaxed font-medium">
                      {renderHighlightedText(translationItem.text, query)}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Tombol Muat Lebih Banyak */}
          {currentPage < totalPages && (
            <div className="pt-6 text-center">
              <Button
                onClick={handleLoadMore}
                disabled={isLoading}
                variant="outline"
                className="h-12 px-8 rounded-2xl font-bold border-2 hover:bg-muted gap-2"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                <span>Muat Lebih Banyak Hasil</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
