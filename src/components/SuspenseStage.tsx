/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Volume2, VolumeX, Shuffle, Flame, Award, UserCheck } from 'lucide-react';
import { Participant, SuspensePhase } from '../types';
import { soundEngine } from '../services/soundEngine';

interface SuspenseStageProps {
  candidates: Participant[];
  excludeWinners: boolean;
  onToggleExcludeWinners: (checked: boolean) => void;
  onWinnerDrawn: (winner: Participant) => void;
  onOpenSettings: () => void;
}

export const SuspenseStage: React.FC<SuspenseStageProps> = ({
  candidates,
  excludeWinners,
  onToggleExcludeWinners,
  onWinnerDrawn,
  onOpenSettings,
}) => {
  const [phase, setPhase] = useState<SuspensePhase>('idle');
  const [displayedCandidate, setDisplayedCandidate] = useState<Participant | null>(null);
  const [finalWinner, setFinalWinner] = useState<Participant | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [tensionPercent, setTensionPercent] = useState<number>(0);

  const spinTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const hasCandidates = candidates.length > 0;

  useEffect(() => {
    if (candidates.length > 0 && !displayedCandidate) {
      setDisplayedCandidate(candidates[0]);
    }
  }, [candidates, displayedCandidate]);

  // Clean up any running timers on unmount
  useEffect(() => {
    return () => {
      if (spinTimerRef.current) clearInterval(spinTimerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      soundEngine.stopSuspenseRiser();
    };
  }, []);

  const triggerScreenShake = () => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 280);
  };

  const fireGrandConfetti = () => {
    const end = Date.now() + 3.5 * 1000;
    const colors = ['#f5c542', '#ffd700', '#ff4d4f', '#ffffff', '#e6a23c'];

    (function frame() {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 70,
        origin: { x: 0.1, y: 0.7 },
        colors: colors,
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 70,
        origin: { x: 0.9, y: 0.7 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    confetti({
      particleCount: 90,
      spread: 110,
      origin: { y: 0.58 },
      colors: colors,
    });
  };

  const startDraw = () => {
    if (!hasCandidates || phase !== 'idle') return;

    soundEngine.playButtonPress();

    // 1. Pick the true winner directly
    const winnerIndex = Math.floor(Math.random() * candidates.length);
    const chosenWinner = candidates[winnerIndex];

    // Begin fast spin immediately with heavy blur: NO stopping on partial names!
    setPhase('fast_spinning');
    setTensionPercent(10);
    soundEngine.startSuspenseRiser();
    soundEngine.playHeartbeat(1.0);

    const startTime = Date.now();
    const totalSpinDuration = 3200; // 3.2s exciting vortex, then straight to result!

    // High speed blur stream: changes candidate every 35ms, strictly kept blurred
    let tickCount = 0;
    spinTimerRef.current = setInterval(() => {
      tickCount++;
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalSpinDuration, 1);

      // Random candidate display during blur stream
      const randCandidate = candidates[Math.floor(Math.random() * candidates.length)];
      setDisplayedCandidate(randCandidate);
      setTensionPercent(Math.floor(10 + progress * 90));

      // Sound ticks accelerating with progress
      if (tickCount % 2 === 0) {
        soundEngine.playSlotTick(1.0 + progress * 0.4);
      }
      if (tickCount % 6 === 0) {
        soundEngine.playHeartbeat(1.0 + progress * 0.6);
      }

      // Once duration reaches totalSpinDuration -> 一出就要出結果！
      if (elapsed >= totalSpinDuration) {
        if (spinTimerRef.current) {
          clearInterval(spinTimerRef.current);
          spinTimerRef.current = null;
        }
        soundEngine.stopSuspenseRiser();

        // Reveal directly with ZERO intermediate pauses!
        setPhase('revealed');
        setTensionPercent(100);
        setDisplayedCandidate(chosenWinner);
        setFinalWinner(chosenWinner);
        setShowWinnerModal(true);
        soundEngine.playGrandFanfare();
        fireGrandConfetti();
        triggerScreenShake();

        onWinnerDrawn(chosenWinner);
      }
    }, 35);
  };

  const handleToggleSound = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundEngine.setMuted(nextMute);
  };

  const closeWinnerModal = () => {
    setShowWinnerModal(false);
    setPhase('idle');
    setTensionPercent(0);
  };

  const isSpinning = phase === 'fast_spinning';

  return (
    <div
      className={`relative z-20 w-full max-w-5xl mx-auto flex flex-col items-center px-4 py-2 transition-transform duration-150 ${
        screenShake ? 'animate-dramatic-shake' : ''
      }`}
    >
      {/* Top Controls Strip */}
      <div className="w-full mb-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-amber-500/30 shadow-xl">
        <div className="flex items-center gap-2 text-amber-200">
          <UserCheck className="w-4 h-4 text-amber-400" />
          <span className="font-serif-tc text-sm font-bold tracking-wider text-amber-300">
            個人幸運大抽獎 · 命運之輪
          </span>
          <span className="text-xs text-amber-400/60 ml-1">
            (共 {candidates.length} 位待抽同仁)
          </span>
        </div>

        {/* The Requested Checkbox: "設有一個checkbox已移除得獎者" */}
        <div className="flex items-center gap-4 text-xs md:text-sm">
          <label className="flex items-center gap-2 cursor-pointer select-none group">
            <input
              type="checkbox"
              disabled={isSpinning}
              checked={excludeWinners}
              onChange={(e) => onToggleExcludeWinners(e.target.checked)}
              className="w-4 h-4 rounded border-amber-400 text-amber-500 focus:ring-amber-400 bg-black/70 cursor-pointer accent-amber-500"
            />
            <span
              className={`font-medium transition-colors ${
                excludeWinners
                  ? 'text-amber-300 font-semibold drop-shadow-sm'
                  : 'text-neutral-400 group-hover:text-amber-200'
              }`}
            >
              抽中後自動從待抽名單中移除得獎者
            </span>
          </label>

          <button
            onClick={handleToggleSound}
            className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-amber-500/30 text-amber-300 transition-colors"
            title={isMuted ? '開啟刺激音效' : '靜音'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />}
          </button>
        </div>
      </div>

      {/* Tension Meter during active draw */}
      {isSpinning && (
        <div className="w-full max-w-md mb-2 flex flex-col items-center animate-fade-in">
          <div className="w-full flex justify-between text-xs font-bold text-amber-400 mb-1">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-500 animate-bounce" />
              <span>時空漩渦極速輪轉中</span>
            </span>
            <span className="font-mono text-amber-300">{tensionPercent}%</span>
          </div>
          <div className="w-full h-2 bg-black/80 rounded-full border border-amber-500/40 overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full transition-all duration-100 shadow-[0_0_12px_rgba(245,197,66,0.8)]"
              style={{ width: `${tensionPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Mysterious Draw Stage Frame */}
      <div className="relative w-full max-w-2xl aspect-[16/9] sm:aspect-[16/8] flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-to-b from-black/80 via-neutral-950/85 to-black/90 border-2 border-amber-400/60 shadow-[0_0_50px_rgba(245,197,66,0.35),inset_0_0_30px_rgba(0,0,0,0.9)] backdrop-blur-md overflow-hidden">
        {/* Golden Corner Accents */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-400/80 pointer-events-none" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-400/80 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-400/80 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-400/80 pointer-events-none" />

        {/* Ambient Glow Aura */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
            isSpinning
              ? 'opacity-85 bg-[radial-gradient(ellipse_at_center,_rgba(245,197,66,0.35)_0%,_transparent_70%)]'
              : 'opacity-30 bg-[radial-gradient(ellipse_at_center,_rgba(245,197,66,0.15)_0%,_transparent_70%)]'
          }`}
        />

        {/* Central Cylinder: 過程的名字保持模糊，一出就要出結果 */}
        <div className="relative z-10 w-full max-w-lg h-32 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-neutral-900/95 via-black/95 to-neutral-900/95 border-2 border-amber-400/70 shadow-[inset_0_0_25px_rgba(245,197,66,0.35),0_0_20px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Aim Crosshair Guide */}
          <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent top-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-400/70 text-xs">▶</div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-400/70 text-xs">◀</div>

          {hasCandidates ? (
            <div className="text-center px-4 flex flex-col items-center justify-center">
              {/* Candidate Name - Heavily blurred during the process, instant clear result upon finish */}
              <div
                className={`font-serif-tc font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400 transition-all select-none ${
                  isSpinning
                    ? 'scale-110 text-4xl sm:text-5xl opacity-60'
                    : 'scale-100 text-3xl sm:text-4xl opacity-100 drop-shadow-[0_0_20px_rgba(245,197,66,0.8)]'
                }`}
                style={{
                  filter: isSpinning ? 'blur(12px)' : 'none',
                  textShadow: isSpinning ? '0 0 15px rgba(245,197,66,0.9)' : undefined,
                }}
              >
                {displayedCandidate?.name || '---'}
              </div>

              {/* Department - Also blurred during spin */}
              {displayedCandidate?.department && (
                <div
                  className={`mt-1 text-xs sm:text-sm font-medium text-amber-300/80 transition-all ${
                    isSpinning ? 'opacity-30' : 'opacity-100'
                  }`}
                  style={{
                    filter: isSpinning ? 'blur(8px)' : 'none',
                  }}
                >
                  {displayedCandidate.department}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-amber-400/90 text-sm font-bold mb-2">待抽名單已全部抽完！</p>
              <button
                onClick={onOpenSettings}
                className="text-xs px-3 py-1 bg-amber-500 text-black font-bold rounded hover:bg-amber-400"
              >
                前往名單管理重置或加設
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Status Message */}
        <div className="relative z-10 mt-3 h-6 flex items-center justify-center">
          {isSpinning && (
            <div className="flex items-center gap-2 text-amber-200 text-xs sm:text-sm font-bold animate-pulse">
              <Shuffle className="w-4 h-4 animate-spin text-amber-400" />
              <span>命運極速凝聚中 · 即刻揭曉唯一幸運兒！</span>
            </div>
          )}
          {phase === 'revealed' && (
            <div className="text-amber-300 text-xs sm:text-sm font-black tracking-[0.2em] animate-bounce">
              ✨ 榮耀大獎得主誕生！ ✨
            </div>
          )}
          {phase === 'idle' && (
            <div className="text-amber-400/60 text-xs font-serif-tc tracking-wider">
              共有 {candidates.length} 位同仁蓄勢待發
            </div>
          )}
        </div>

        {/* Trigger Button: 啟動神祕抽獎 */}
        <div className="relative z-10 mt-4 flex items-center justify-center">
          <button
            onClick={startDraw}
            disabled={!hasCandidates || isSpinning}
            className={`group relative px-8 sm:px-12 py-3 sm:py-3.5 rounded-full font-serif-tc text-base sm:text-lg font-black tracking-[0.2em] transition-all duration-300 shadow-2xl active:scale-95 ${
              !hasCandidates || isSpinning
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black border-2 border-yellow-100 shadow-[0_0_35px_rgba(245,197,66,0.6)] cursor-pointer hover:scale-105'
            }`}
          >
            <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </span>

            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-900 group-hover:rotate-180 transition-transform duration-700" />
              <span>
                {isSpinning ? '緊張抽取中...' : hasCandidates ? '啟動神祕大抽獎' : '抽獎池已空'}
              </span>
              <Sparkles className="w-5 h-5 text-amber-900 group-hover:-rotate-180 transition-transform duration-700" />
            </span>
          </button>
        </div>
      </div>

      {/* Grand Winner Reveal Popup Modal */}
      {showWinnerModal && finalWinner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
          <div className="absolute w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,_rgba(245,197,66,0.35)_0%,_transparent_70%)] animate-rotate-beam pointer-events-none" />

          <div className="relative z-10 w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-neutral-900 via-black to-neutral-950 border-2 border-amber-300 shadow-[0_0_80px_rgba(245,197,66,0.5),inset_0_0_40px_rgba(245,197,66,0.2)] text-center flex flex-col items-center">
            {/* Ribbon Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-1.5 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-white font-bold text-xs sm:text-sm tracking-widest shadow-lg uppercase mb-4">
              <Award className="w-4 h-4 text-yellow-200" />
              <span>CONGRATULATIONS · 幸運得獎者</span>
            </div>

            {/* Winner Golden Box - Crystal clear, glorious finish */}
            <div className="w-full py-8 px-4 rounded-2xl bg-gradient-to-b from-amber-950/60 via-black/80 to-amber-950/60 border border-amber-400/50 shadow-inner flex flex-col items-center justify-center mb-5">
              <div className="text-xs text-amber-400/80 uppercase tracking-widest font-bold mb-2">
                榮耀誕生
              </div>
              <div className="font-serif-tc text-4xl sm:text-5xl font-black tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-300 to-yellow-200 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                {finalWinner.name}
              </div>
              {finalWinner.department && (
                <div className="mt-3 text-sm text-amber-200 font-medium px-4 py-1 rounded-full bg-amber-950/80 border border-amber-500/30">
                  {finalWinner.department}
                </div>
              )}
            </div>

            {/* Status notice about removal */}
            {excludeWinners ? (
              <div className="text-xs text-emerald-400/90 font-medium mb-5 flex items-center gap-1.5">
                <span>✓ 已依設定將該得獎者自動從待抽名單移除</span>
              </div>
            ) : (
              <div className="text-xs text-neutral-400 font-medium mb-5">
                (目前設定保留在待抽池中，可重複參與後續抽獎)
              </div>
            )}

            {/* Modal Actions */}
            <div className="w-full flex items-center justify-center">
              <button
                onClick={closeWinnerModal}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-base tracking-wider shadow-lg shadow-amber-500/40 transition-transform active:scale-95 cursor-pointer"
              >
                領取榮耀 · 繼續下一抽
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
