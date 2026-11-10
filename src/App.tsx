/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import {
  Participant,
  TableItem,
  IndividualWinnerRecord,
  TableWinnerRecord,
  DrawMode,
} from './types';
import { DEFAULT_PARTICIPANTS, DEFAULT_TABLE_NAMES } from './data/defaultData';
import { AtmosphereCanvas } from './components/AtmosphereCanvas';
import { BackdropHeader } from './components/BackdropHeader';
import { SuspenseStage } from './components/SuspenseStage';
import { TableSuspenseStage } from './components/TableSuspenseStage';
import { RosterManagerModal } from './components/RosterManagerModal';
import { WinnersHistoryModal } from './components/WinnersHistoryModal';

const STORAGE_KEYS = {
  PARTICIPANTS: 'bbq_lottery_2026_participants',
  TABLE_TEXT: 'bbq_lottery_2026_table_text',
  INDIVIDUAL_WINNERS: 'bbq_lottery_2026_individual_winners',
  TABLE_WINNERS: 'bbq_lottery_2026_table_winners',
  EXCLUDE_WINNERS: 'bbq_lottery_2026_exclude_winners',
  EXCLUDE_TABLE_WINNERS: 'bbq_lottery_2026_exclude_table_winners',
  MODE: 'bbq_lottery_2026_mode',
};

export default function App() {
  // Mode: individual or table
  const [mode, setMode] = useState<DrawMode>(() => {
    return (localStorage.getItem(STORAGE_KEYS.MODE) as DrawMode) || 'individual';
  });

  // Checkboxes: "設有一個checkbox已移除得獎者"
  const [excludeWinners, setExcludeWinners] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXCLUDE_WINNERS);
    return saved !== null ? saved === 'true' : true;
  });

  const [excludeTableWinners, setExcludeTableWinners] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXCLUDE_TABLE_WINNERS);
    return saved !== null ? saved === 'true' : true;
  });

  // Participants
  const [participants, setParticipants] = useState<Participant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_PARTICIPANTS;
  });

  // Table Text (Enter / Return separated)
  const [tableText, setTableText] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TABLE_TEXT);
    return saved !== null ? saved : DEFAULT_TABLE_NAMES.join('\n');
  });

  // Tables array parsed from tableText
  const [tables, setTables] = useState<TableItem[]>(() => {
    const initialText = localStorage.getItem(STORAGE_KEYS.TABLE_TEXT) || DEFAULT_TABLE_NAMES.join('\n');
    return initialText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((name, idx) => ({
        id: `tbl-${idx + 1}-${name}`,
        tableName: name,
        isWinner: false,
      }));
  });

  // Winner Records
  const [individualWinners, setIndividualWinners] = useState<IndividualWinnerRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INDIVIDUAL_WINNERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [tableWinners, setTableWinners] = useState<TableWinnerRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TABLE_WINNERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TABLE_TEXT, tableText);
  }, [tableText]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INDIVIDUAL_WINNERS, JSON.stringify(individualWinners));
  }, [individualWinners]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TABLE_WINNERS, JSON.stringify(tableWinners));
  }, [tableWinners]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXCLUDE_WINNERS, String(excludeWinners));
  }, [excludeWinners]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXCLUDE_TABLE_WINNERS, String(excludeTableWinners));
  }, [excludeTableWinners]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MODE, mode);
  }, [mode]);

  // Active candidates for Individual Draw
  const activeCandidates = useMemo(() => {
    if (excludeWinners) {
      return participants.filter((p) => !p.isWinner);
    }
    return participants;
  }, [participants, excludeWinners]);

  // Active tables for Table Draw
  const activeTables = useMemo(() => {
    if (excludeTableWinners) {
      return tables.filter((t) => !t.isWinner);
    }
    return tables;
  }, [tables, excludeTableWinners]);

  // Handler when individual winner is drawn (NO PRIZE REQUIRED)
  const handleIndividualWinnerDrawn = (winner: Participant) => {
    const record: IndividualWinnerRecord = {
      id: `iw-${Date.now()}`,
      participantId: winner.id,
      name: winner.name,
      department: winner.department || '',
      timestamp: new Date().toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setIndividualWinners((prev) => [record, ...prev]);

    if (excludeWinners) {
      setParticipants((prev) =>
        prev.map((p) => (p.id === winner.id ? { ...p, isWinner: true } : p))
      );
    }
  };

  // Handler when table winner is drawn
  const handleTableWinnerDrawn = (winningTable: TableItem) => {
    const record: TableWinnerRecord = {
      id: `tw-${Date.now()}`,
      tableId: winningTable.id,
      tableName: winningTable.tableName,
      timestamp: new Date().toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setTableWinners((prev) => [record, ...prev]);

    if (excludeTableWinners) {
      setTables((prev) =>
        prev.map((t) => (t.id === winningTable.id ? { ...t, isWinner: true } : t))
      );
    }
  };

  // Restore individual winner
  const handleRestoreIndividualWinner = (recordId: string, participantId: string) => {
    setIndividualWinners((prev) => prev.filter((r) => r.id !== recordId));
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, isWinner: false } : p))
    );
  };

  // Restore table winner
  const handleRestoreTableWinner = (recordId: string, tableId: string) => {
    setTableWinners((prev) => prev.filter((r) => r.id !== recordId));
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, isWinner: false } : t))
    );
  };

  // Reset all winners
  const handleResetAllWinners = () => {
    if (confirm('確定要將所有人與桌次重置回待抽池嗎？')) {
      setParticipants((prev) => prev.map((p) => ({ ...p, isWinner: false })));
      setTables((prev) => prev.map((t) => ({ ...t, isWinner: false })));
      setIndividualWinners([]);
      setTableWinners([]);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-amber-50 flex flex-col justify-between overflow-x-hidden select-none">
      {/* BBQ Gala High-Res Backdrop Image from Attachment */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 pointer-events-none"
        style={{
          backgroundImage: "url('/assets/aistudio/BBQ_Backdrop_fce88b2a.jfif')",
        }}
      />

      {/* Atmospheric Overlays: Dark gradient, fairy bulb glow enhancement */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/80 via-black/40 to-black/85 pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.75)_100%)] pointer-events-none" />

      {/* Dynamic Golden Embers & Rotating Spotlight Canvas */}
      <AtmosphereCanvas phase="idle" />

      {/* Top Header & Navigation */}
      <BackdropHeader
        mode={mode}
        onChangeMode={(m) => setMode(m)}
        winnerCount={mode === 'individual' ? individualWinners.length : tableWinners.length}
        remainingCount={mode === 'individual' ? activeCandidates.length : activeTables.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Lottery Stage */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center w-full px-2 py-2">
        {mode === 'individual' ? (
          <SuspenseStage
            key="individual-stage"
            candidates={activeCandidates}
            excludeWinners={excludeWinners}
            onToggleExcludeWinners={(val) => setExcludeWinners(val)}
            onWinnerDrawn={handleIndividualWinnerDrawn}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        ) : (
          <TableSuspenseStage
            key="table-stage"
            tables={activeTables}
            excludeTableWinners={excludeTableWinners}
            onToggleExcludeTableWinners={(val) => setExcludeTableWinners(val)}
            onTableWinnerDrawn={handleTableWinnerDrawn}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}
      </main>

      {/* Footer bar with full screen and status */}
      <footer className="relative z-20 w-full px-6 py-2.5 flex items-center justify-between text-xs text-amber-300/80 bg-black/60 backdrop-blur-md border-t border-amber-500/20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>2026 營運盛會抽獎系統 · 準備就緒</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="hover:text-amber-200 underline font-medium cursor-pointer"
          >
            更換/加設抽獎名單與桌次
          </button>
          <span className="text-amber-500/30">|</span>
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            title="切換全螢幕盛典模式 (適合投影布幕)"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? '退出全螢幕' : '全螢幕放映'}</span>
          </button>
        </div>
      </footer>

      {/* Settings & Roster Management Modal */}
      <RosterManagerModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        participants={participants}
        setParticipants={setParticipants}
        tables={tables}
        setTables={setTables}
        tableText={tableText}
        setTableText={setTableText}
        excludeWinners={excludeWinners}
        setExcludeWinners={setExcludeWinners}
        excludeTableWinners={excludeTableWinners}
        setExcludeTableWinners={setExcludeTableWinners}
        onResetWinners={handleResetAllWinners}
      />

      {/* Winner History Records Modal */}
      <WinnersHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        individualWinners={individualWinners}
        tableWinners={tableWinners}
        onRestoreIndividualWinner={handleRestoreIndividualWinner}
        onRestoreTableWinner={handleRestoreTableWinner}
        onClearHistory={() => {
          setIndividualWinners([]);
          setTableWinners([]);
        }}
      />
    </div>
  );
}
