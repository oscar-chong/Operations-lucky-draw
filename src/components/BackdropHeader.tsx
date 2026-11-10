/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles } from 'lucide-react';

interface BackdropHeaderProps {
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  winnerCount: number;
  remainingCount: number;
  mode: 'individual' | 'table';
  onChangeMode: (mode: 'individual' | 'table') => void;
}

export const BackdropHeader: React.FC<BackdropHeaderProps> = ({
  onOpenSettings,
  onOpenHistory,
  winnerCount,
  remainingCount,
  mode,
  onChangeMode,
}) => {
  return (
    <header className="relative z-20 w-full pt-3 pb-2 px-4 flex flex-col items-center">
      {/* Top status bar & quick controls */}
      <div className="w-full max-w-7xl flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
        {/* Mode Selector Tabs (Individual vs Table) */}
        <div className="flex items-center p-1 bg-black/60 backdrop-blur-md rounded-full border border-amber-500/30 shadow-lg">
          <button
            onClick={() => onChangeMode('individual')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold transition-all duration-300 ${
              mode === 'individual'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md shadow-amber-500/40 scale-105'
                : 'text-amber-200/80 hover:text-white'
            }`}
          >
            <span className="text-base">🎰</span>
            <span>個人幸運大抽獎</span>
          </button>
          <button
            onClick={() => onChangeMode('table')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-bold transition-all duration-300 ${
              mode === 'table'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md shadow-amber-500/40 scale-105'
                : 'text-amber-200/80 hover:text-white'
            }`}
          >
            <span className="text-base">🥂</span>
            <span>全桌同慶大贏家</span>
          </button>
        </div>

        {/* Stats and Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg border border-amber-500/20 text-amber-300">
            <span className="text-amber-400/80">待抽池:</span>
            <span className="font-bold text-amber-200">{remainingCount}</span>
            <span className="text-amber-500/40">|</span>
            <span className="text-amber-400/80">已中獎:</span>
            <span className="font-bold text-emerald-400">{winnerCount}</span>
          </div>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/70 hover:bg-amber-900/80 text-amber-200 rounded-lg border border-amber-500/40 transition-colors shadow-sm"
            title="查看所有中獎名單與紀錄"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-medium">中獎名錄 ({winnerCount})</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-bold rounded-lg border border-amber-300 shadow-md transition-all active:scale-95"
            title="更換/加設抽獎名單、移除得獎者設定、獎項設置"
          >
            <span className="text-sm">⚙️</span>
            <span>名單與獎項管理</span>
          </button>
        </div>
      </div>

      {/* Royal Celebration Emblem Header - Faithfully Styled after the Backdrop */}
      <div className="mt-2 text-center select-none flex flex-col items-center">
        {/* Ribbon Pill: 2026 二零二六年 */}
        <div className="relative inline-flex items-center justify-center px-8 py-1 rounded-full bg-gradient-to-r from-amber-950/80 via-black/80 to-amber-950/80 border border-amber-400/50 shadow-lg backdrop-blur-sm">
          <span className="font-cinzel text-xl md:text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-300 to-yellow-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            2 0 2 6
          </span>
          <span className="mx-3 text-amber-400/60 font-light">•</span>
          <span className="font-serif-tc text-sm md:text-base tracking-[0.25em] text-amber-200 font-bold">
            二零二六年
          </span>
        </div>

        {/* Grand Title: 營 運 盛 會 with Golden Laurel Wings */}
        <div className="relative mt-1 flex items-center justify-center gap-3 md:gap-6">
          {/* Left Laurel Wing */}
          <div className="hidden sm:flex items-center text-amber-400/80 drop-shadow-[0_0_8px_rgba(245,197,66,0.5)]">
            <svg width="42" height="42" viewBox="0 0 48 48" fill="none" className="rotate-12">
              <path
                d="M38 10C34 16 28 22 18 26C12 28 6 30 2 34C8 35 18 34 26 30C34 26 42 18 46 8"
                stroke="url(#goldGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M24 18C20 14 16 12 10 12C12 18 16 22 22 24"
                fill="url(#goldGrad)"
                opacity="0.8"
              />
              <path
                d="M32 24C28 22 24 22 18 24C20 29 25 31 31 30"
                fill="url(#goldGrad)"
                opacity="0.8"
              />
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFF2B2" />
                  <stop offset="0.5" stopColor="#F5C542" />
                  <stop offset="1" stopColor="#D48806" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h1 className="font-serif-tc text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDF0] via-[#FCE38A] to-[#D49419] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            營運盛會
          </h1>

          {/* Right Laurel Wing */}
          <div className="hidden sm:flex items-center text-amber-400/80 drop-shadow-[0_0_8px_rgba(245,197,66,0.5)]">
            <svg width="42" height="42" viewBox="0 0 48 48" fill="none" className="-scale-x-100 rotate-12">
              <path
                d="M38 10C34 16 28 22 18 26C12 28 6 30 2 34C8 35 18 34 26 30C34 26 42 18 46 8"
                stroke="url(#goldGrad2)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M24 18C20 14 16 12 10 12C12 18 16 22 22 24"
                fill="url(#goldGrad2)"
                opacity="0.8"
              />
              <path
                d="M32 24C28 22 24 22 18 24C20 29 25 31 31 30"
                fill="url(#goldGrad2)"
                opacity="0.8"
              />
              <defs>
                <linearGradient id="goldGrad2" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFF2B2" />
                  <stop offset="0.5" stopColor="#F5C542" />
                  <stop offset="1" stopColor="#D48806" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Subtitle: 攜手同行 · 共創佳績 OPERATIONS CELEBRATION */}
        <div className="mt-1 flex flex-col items-center">
          <div className="flex items-center gap-3 text-sm md:text-lg font-serif-tc text-amber-200 tracking-[0.3em] font-semibold drop-shadow-md">
            <span className="text-amber-500/80 text-xs">◆</span>
            <span>攜手同行 · 共創佳績</span>
            <span className="text-amber-500/80 text-xs">◆</span>
          </div>
          <div className="text-[10px] md:text-xs font-cinzel tracking-[0.35em] text-amber-400/90 font-bold uppercase mt-0.5">
            OPERATIONS CELEBRATION
          </div>
        </div>
      </div>
    </header>
  );
};
