"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, SkipBack, SkipForward, ChevronDown, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sfx } from "@/lib/sfx";
import { getVerseAudioUrl } from "@/lib/api";

interface SurahAudioPlayerProps {
  surahId: number;
  surahName: string;
  totalVerses: number;
  initialAyah?: number;
  onAyahChange?: (ayahNumber: number) => void;
  onClose?: () => void;
}

export function SurahAudioPlayer({
  surahId,
  surahName,
  totalVerses,
  initialAyah = 1,
  onAyahChange,
  onClose,
}: SurahAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentAyah, setCurrentAyah] = useState(initialAyah);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  // Dapatkan MP3 link untuk ayat aktif
  const audioUrl = getVerseAudioUrl(surahId, currentAyah);

  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.src = "";
        audio.load();
      }
    };
  }, []);

  useEffect(() => {
    if (initialAyah !== currentAyah) {
      setCurrentAyah(initialAyah);
      setIsPlaying(true);
    }
  }, [initialAyah]);

  // Efek memutar audio saat track dirubah secara internal
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const playAudio = async () => {
      try {
        audio.load();
        if (isPlaying) {
          await audio.play();
        }
      } catch (err) {
        console.error("Playback error:", err);
      }
    };
    playAudio();
  }, [currentAyah]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      // Pindah ke ayat selanjutnya secara sekuensial
      if (currentAyah < totalVerses) {
        const nextAyah = currentAyah + 1;
        setCurrentAyah(nextAyah);
        onAyahChange?.(nextAyah);
      } else {
        setIsPlaying(false);
        sfx.playSuccess();
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentAyah, totalVerses, onAyahChange]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
        sfx.playTap();
      }).catch(() => {});
    }
  };

  const handleNext = () => {
    if (currentAyah < totalVerses) {
      const nextAyah = currentAyah + 1;
      setCurrentAyah(nextAyah);
      onAyahChange?.(nextAyah);
      sfx.playWoosh();
    }
  };

  const handlePrev = () => {
    if (currentAyah > 1) {
      const prevAyah = currentAyah - 1;
      setCurrentAyah(prevAyah);
      onAyahChange?.(prevAyah);
      sfx.playWoosh();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const seekRatio = Math.max(0, Math.min(1, clickX / rect.width));
    audio.currentTime = seekRatio * duration;
    setCurrentTime(audio.currentTime);
    setProgress(seekRatio * 100);
    sfx.playTap();
  };

  const handleClose = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setIsPlaying(false);
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className={`fixed z-50 transition-all duration-500 ease-in-out ${
          isMinimized 
            ? "top-6 left-1/2 -translate-x-1/2 w-[280px]" 
            : "bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[400px]"
        }`}
      >
        <div className={`bg-card/95 backdrop-blur-xl border shadow-2xl transition-all duration-500 overflow-hidden ${
          isMinimized ? "rounded-full p-2" : "rounded-3xl p-5"
        }`}>
          <audio ref={audioRef} src={audioUrl} preload="metadata" />

          {isMinimized ? (
            <div className="flex items-center justify-between px-2 cursor-pointer" onClick={() => setIsMinimized(false)}>
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                  {isPlaying ? <Activity className="h-4 w-4 text-primary" /> : <Play className="h-4 w-4 text-primary ml-0.5" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold leading-none">{surahName}</span>
                  <span className="text-[10px] text-muted-foreground">Ayat {currentAyah}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); handleClose(); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-display font-bold text-sm bg-primary/10 text-primary inline-flex px-2 py-0.5 rounded-md mb-1">Murottal Mode</p>
                  <p className="text-sm font-medium">{surahName} &middot; <span className="text-muted-foreground">Ayat {currentAyah}/{totalVerses}</span></p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 animate-pulse text-amber-500 hover:text-amber-600 bg-amber-500/10 rounded-full mr-2 pointer-events-none text-[10px] font-bold px-2.5 h-6 w-auto">
                    LIVE
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMinimized(true)}>
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={handleClose}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="mb-6 group">
                <div 
                  onClick={handleSeek}
                  className="h-2.5 bg-muted rounded-full overflow-hidden cursor-pointer relative py-0.5 hover:h-3 transition-all"
                >
                  <motion.div
                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-primary to-teal rounded-full"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.05 }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs font-medium text-muted-foreground">{formatTime(currentTime)}</span>
                  <span className="text-xs font-medium text-muted-foreground">{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full border-muted-foreground/20 hover:bg-accent"
                  disabled={currentAyah <= 1}
                  onClick={handlePrev}
                >
                  <SkipBack className="h-5 w-5" />
                </Button>

                <Button
                  onClick={togglePlay}
                  className={`h-16 w-16 rounded-full shadow-lg hover:scale-105 transition-transform ${
                    isPlaying 
                      ? "bg-gradient-to-br from-amber-500 to-orange-500" 
                      : "bg-gradient-to-br from-primary to-teal"
                  }`}
                >
                  {isPlaying ? (
                    <Pause className="h-7 w-7 text-white" />
                  ) : (
                    <Play className="h-7 w-7 text-white ml-1" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full border-muted-foreground/20 hover:bg-accent"
                  disabled={currentAyah >= totalVerses}
                  onClick={handleNext}
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
