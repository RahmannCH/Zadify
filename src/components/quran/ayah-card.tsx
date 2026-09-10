"use client";

import dynamic from "next/dynamic";
import { useBookmarkStore } from "@/store/bookmark-store";
import { useSettingsStore } from "@/store/settings-store";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Bookmark, Copy, BookOpenText, Languages, Play, FileText, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import type { Verse, Chapter } from "@/types/quran";
import { TajweedText } from "@/components/quran/tajweed-text";
import { extractTargetArabicStems, isArabicWordMatched, isWordMatchingQuery } from "@/lib/arabic-matcher";

// --- DYNAMIC IMPORTS ---
const ShareAyatModal = dynamic(
  () => import("@/components/quran/share-ayat-modal").then((mod) => mod.ShareAyatModal),
  {
    ssr: false,
    loading: () => (
      <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors text-muted-foreground opacity-50">
        <Share2 className="h-4 w-4" />
      </button>
    ),
  }
);

interface AyahCardProps {
  verse: Verse;
  chapter: Chapter;
  fontSize: number;
  showTranslation: boolean;
  isPlayable?: boolean;
  onPlay?: () => void;
  searchQuery?: string;
}

export function AyahCard({ verse, chapter, fontSize, showTranslation, isPlayable = false, onPlay, searchQuery = "" }: AyahCardProps) {
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarkStore();
  const globalShowLatin = useSettingsStore((s) => s.showLatin);
  const [localShowLatin, setLocalShowLatin] = useState(true);
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [tafsirText, setTafsirText] = useState("");
  const [showWordByWord, setShowWordByWord] = useState(false);
  const verseKey = verse.verse_key;
  const bookmarked = isBookmarked(verseKey);

  const toggleBookmark = () => {
    if (bookmarked) removeBookmark(verseKey);
    else addBookmark({ verseKey, surahName: chapter.name_simple, text: verse.text_uthmani, timestamp: Date.now() });
  };

  const loadTafsir = async () => {
    if (tafsirText) return;
    setTafsirLoading(true);
    try {
      // Menggunakan Tafsir Kemenag (ID: 16)
      const res = await fetch(`https://api.quran.com/api/v4/tafsirs/16/by_ayah/${verseKey}`);
      const data = await res.json();
      setTafsirText(data.tafsir?.text || "Tafsir tidak ditemukan.");
    } catch {
      setTafsirText("Gagal memuat tafsir. Coba lagi nanti.");
    } finally {
      setTafsirLoading(false);
    }
  };

  // Terjemahan Bahasa Indonesia (Resource ID 33 atau fallback translation pertama)
  const translationObj = verse.translations?.find((t) => t.resource_id === 33 || (t.resource_id !== 57 && !t.text.includes("Bismi Allahi")));
  const rawTranslation = translationObj?.text || verse.translations?.[0]?.text || "";
  const cleanTranslation = rawTranslation.replace(/<[^>]*>/g, "");

  // Transliterasi Latin (Resource ID 57 atau fallback dari word-by-word)
  const transliterationObj = verse.translations?.find((t) => t.resource_id === 57);
  let latinText = transliterationObj?.text?.replace(/<[^>]*>/g, "") || "";
  if (!latinText && verse.words) {
    latinText = verse.words
      .map((w) => w.transliteration?.text)
      .filter(Boolean)
      .join(" ");
  }

  const isLatinActive = globalShowLatin && localShowLatin;

  return (
    <div
      id={`verse-${verse.verse_number}`}
      data-verse={verse.verse_number}
      className="rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:shadow-primary/5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-xs font-bold text-primary-foreground shadow-sm">
            {verse.verse_number}
          </div>
          {isPlayable && (
            <Tooltip>
              <TooltipTrigger
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                onClick={onPlay}
              >
                <Play className="h-3.5 w-3.5 fill-current" />
              </TooltipTrigger>
              <TooltipContent>Putar ayat ini</TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Dialog>
            <DialogTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-accent text-muted-foreground hover:text-foreground outline-none" onClick={loadTafsir}>
              <BookOpenText className="h-4 w-4" />
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-xl mb-4">
                  Tafsir Kemenag - QS. {chapter.name_simple}: {verse.verse_number}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="font-arabic text-2xl text-right leading-loose text-primary" dir="rtl">{verse.text_uthmani}</p>
                {cleanTranslation && (
                  <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                    <p className="text-[11px] font-bold text-primary mb-1 uppercase tracking-wider">Terjemahan Ayat</p>
                    <p className="text-sm leading-relaxed text-foreground/90 font-medium">{cleanTranslation}</p>
                  </div>
                )}
                <Separator />
                {tafsirLoading ? (
                  <div className="animate-pulse space-y-3 pt-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                  </div>
                ) : (
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none pt-2 leading-relaxed text-foreground space-y-2" 
                    dangerouslySetInnerHTML={{ 
                      __html: tafsirText
                        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
                        .replace(/\s+on\w+="[^"]*"/gi, "")
                        .replace(/\s+on\w+='[^']*'/gi, "")
                        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
                        .replace(/javascript:/gi, "")
                        .replace(/style="[^"]*"/gi, "")
                    }} 
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Tooltip>
            <TooltipTrigger
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-accent"
              onClick={toggleBookmark}
            >
              <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-gold text-gold" : ""}`} />
            </TooltipTrigger>
            <TooltipContent>{bookmarked ? "Hapus bookmark" : "Bookmark"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-accent"
              onClick={() => {
                navigator.clipboard.writeText(`${verse.text_uthmani}\n\n${cleanTranslation}\n\n— QS. ${chapter.name_simple}: ${verse.verse_number}`);
              }}
            >
              <Copy className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>Salin ayat</TooltipContent>
          </Tooltip>

          <ShareAyatModal verse={verse} chapter={chapter} translation={cleanTranslation} />
        </div>
      </div>

      <div className="mb-4 flex items-center justify-end gap-2">
        {latinText && (
          <button
            onClick={() => setLocalShowLatin(!localShowLatin)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
              isLatinActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-semibold" : "bg-muted hover:bg-accent text-muted-foreground"
            }`}
          >
            <FileText className="h-3 w-3 inline mr-1" />
            Latin
          </button>
        )}
        {verse.words && verse.words.length > 0 && (
          <button
            onClick={() => setShowWordByWord(!showWordByWord)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
              showWordByWord ? "bg-primary text-primary-foreground border-primary" : "bg-muted hover:bg-accent text-muted-foreground"
            }`}
          >
            <Languages className="h-3 w-3 inline mr-1" />
            {showWordByWord ? "Tampilan Biasa" : "Per Kata"}
          </button>
        )}
      </div>

      {showWordByWord && verse.words ? (
        <div className="mb-4 flex flex-wrap gap-x-4 gap-y-6 justify-end leading-[2.2] font-arabic" dir="rtl" style={{ fontSize: `${fontSize}px` }}>
          {verse.words.map((word) => {
            const stems = extractTargetArabicStems(searchQuery);
            const isMatch = searchQuery.trim() ? isWordMatchingQuery(word, searchQuery, stems) : false;
            return (
              <span key={word.id} className={`inline-flex flex-col items-center group cursor-default p-1 rounded-xl transition-all ${
                isMatch ? "bg-amber-500/25 border border-amber-500/40 ring-2 ring-amber-500/30" : ""
              }`}>
                <span className={`${isMatch ? "text-amber-500 font-bold" : "text-primary group-hover:text-gold"} transition-colors`}>{word.text_uthmani}</span>
                <span className={`text-[10px] font-sans mt-1 text-center max-w-[85px] leading-tight ${
                  isMatch ? "text-amber-700 dark:text-amber-300 font-bold" : "text-muted-foreground"
                }`}>
                  {word.translation?.text || ""}
                </span>
              </span>
            );
          })}
        </div>
      ) : verse.text_uthmani_tajweed ? (
        <div className="mb-4 text-right" dir="rtl">
          <TajweedText html={verse.text_uthmani_tajweed} fontSize={fontSize} />
        </div>
      ) : (
        <p
          className="mb-4 text-right leading-[2.2] font-arabic"
          dir="rtl"
          style={{ fontSize: `${fontSize}px` }}
        >
          {verse.text_uthmani}
        </p>
      )}

      {/* --- LATIN & TRANSLATION --- */}
      {isLatinActive && latinText && (
        <p className="my-2.5 text-xs md:text-sm font-medium leading-relaxed italic text-emerald-600/90 dark:text-emerald-400/90">
          {latinText}
        </p>
      )}

      {showTranslation && cleanTranslation && (
        <>
          <Separator className="my-3 opacity-60" />
          <p className="text-xs md:text-sm leading-relaxed text-muted-foreground">
            {searchQuery.trim() ? (
              <span
                dangerouslySetInnerHTML={{
                  __html: cleanTranslation.replace(
                    new RegExp(`(${searchQuery.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
                    '<mark class="bg-amber-500/25 text-amber-900 dark:text-amber-300 font-bold px-1 rounded border border-amber-500/30">$1</mark>'
                  ),
                }}
              />
            ) : (
              cleanTranslation
            )}
          </p>
        </>
      )}
    </div>
  );
}
