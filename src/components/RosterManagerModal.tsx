/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, Trash2, RotateCcw, Users, Search, RefreshCw, Upload, Download, Grid } from 'lucide-react';
import { Participant, TableItem } from '../types';
import { DEFAULT_PARTICIPANTS, DEFAULT_TABLE_NAMES } from '../data/defaultData';

interface RosterManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  tables: TableItem[];
  setTables: React.Dispatch<React.SetStateAction<TableItem[]>>;
  tableText: string;
  setTableText: (text: string) => void;
  excludeWinners: boolean;
  setExcludeWinners: (checked: boolean) => void;
  excludeTableWinners: boolean;
  setExcludeTableWinners: (checked: boolean) => void;
  onResetWinners: () => void;
}

export const RosterManagerModal: React.FC<RosterManagerModalProps> = ({
  isOpen,
  onClose,
  participants,
  setParticipants,
  tables,
  setTables,
  tableText,
  setTableText,
  excludeWinners,
  setExcludeWinners,
  excludeTableWinners,
  setExcludeTableWinners,
  onResetWinners,
}) => {
  const [activeTab, setActiveTab] = useState<'participants' | 'bulk_add' | 'tables'>('participants');
  const [searchQuery, setSearchQuery] = useState('');

  // Single add states - NO TABLE NUMBER REQUIRED
  const [newName, setNewName] = useState('');
  const [newDept, setNewDept] = useState('');

  // Bulk add text
  const [bulkText, setBulkText] = useState('');

  if (!isOpen) return null;

  // Filter participants
  const filteredParticipants = participants.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.department && p.department.toLowerCase().includes(q))
    );
  });

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newPerson: Participant = {
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newName.trim(),
      department: newDept.trim() || '營運盛會同仁',
      isWinner: false,
    };

    setParticipants((prev) => [newPerson, ...prev]);
    setNewName('');
    setNewDept('');
  };

  const handleBulkAdd = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n');
    const addedList: Participant[] = [];

    lines.forEach((line) => {
      const clean = line.trim();
      if (!clean) return;

      // Format can be: "姓名" or "姓名, 部門"
      const parts = clean.split(/[,，\t]+/).map((s) => s.trim());
      const name = parts[0];
      const dept = parts[1] || '營運盛會同仁';

      if (name) {
        addedList.push({
          id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          name,
          department: dept,
          isWinner: false,
        });
      }
    });

    if (addedList.length > 0) {
      setParticipants((prev) => [...addedList, ...prev]);
      setBulkText('');
      setActiveTab('participants');
    }
  };

  const handleDeleteParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const handleToggleWinnerStatus = (id: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isWinner: !p.isWinner } : p))
    );
  };

  const handleTableTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setTableText(newText);

    // Sync to table items
    const lines = newText.split('\n');
    const newTables: TableItem[] = [];
    lines.forEach((l, idx) => {
      const trimmed = l.trim();
      if (trimmed) {
        newTables.push({
          id: `tbl-${idx + 1}-${trimmed}`,
          tableName: trimmed,
          isWinner: false,
        });
      }
    });
    setTables(newTables);
  };

  const handleResetToDefault = () => {
    if (confirm('確定要載入預設盛會名單嗎？目前的個人名單修改將會被覆蓋。')) {
      setParticipants(DEFAULT_PARTICIPANTS);
    }
  };

  const handleResetDefaultTables = () => {
    const defaultText = DEFAULT_TABLE_NAMES.join('\n');
    setTableText(defaultText);
    const newTables: TableItem[] = DEFAULT_TABLE_NAMES.map((name, idx) => ({
      id: `tbl-${idx + 1}-${name}`,
      tableName: name,
      isWinner: false,
    }));
    setTables(newTables);
  };

  const handleClearAll = () => {
    if (confirm('確定要清空所有人員名單嗎？此操作不可逆。')) {
      setParticipants([]);
    }
  };

  const exportToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify({ participants, tables, excludeWinners, excludeTableWinners }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `2026_operations_lottery_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-neutral-950 border-2 border-amber-500/50 shadow-[0_0_50px_rgba(245,197,66,0.3)] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/30 bg-black/60">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-serif-tc text-lg sm:text-xl font-bold text-amber-200">
                抽獎名單與桌次設定
              </h2>
              <p className="text-xs text-amber-400/70">
                編輯個人抽獎名單、直接分行貼入桌次名稱，以及設定得獎者自動移除機制
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Key Settings: The Requested Checkboxes */}
        <div className="px-6 py-3 bg-amber-950/40 border-b border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* Individual Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={excludeWinners}
                onChange={(e) => setExcludeWinners(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
              />
              <span className="text-amber-100 font-semibold">
                抽中後自動從待抽名單中移除得獎者
              </span>
            </label>

            {/* Table Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={excludeTableWinners}
                onChange={(e) => setExcludeTableWinners(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-500 cursor-pointer"
              />
              <span className="text-amber-100 font-semibold">
                抽中後自動移除該桌 (全桌不再重複中獎)
              </span>
            </label>
          </div>

          <button
            onClick={onResetWinners}
            className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-amber-300 rounded border border-amber-500/30 text-xs transition-colors"
            title="將所有中獎狀態重置，全員重新回到抽獎池"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>全體回歸抽獎池</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center px-6 pt-3 border-b border-neutral-800 gap-2 bg-neutral-900/60 text-xs sm:text-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('participants')}
            className={`px-4 py-2 font-bold rounded-t-lg transition-colors border-b-2 ${
              activeTab === 'participants'
                ? 'text-amber-300 border-amber-400 bg-black/40'
                : 'text-neutral-400 border-transparent hover:text-white'
            }`}
          >
            名單檢視與單筆新增 ({participants.length})
          </button>
          <button
            onClick={() => setActiveTab('bulk_add')}
            className={`px-4 py-2 font-bold rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'bulk_add'
                ? 'text-amber-300 border-amber-400 bg-black/40'
                : 'text-neutral-400 border-transparent hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>批量貼入名單</span>
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-4 py-2 font-bold rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'tables'
                ? 'text-amber-300 border-amber-400 bg-black/40'
                : 'text-neutral-400 border-transparent hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>桌次檢視與分行寫入 ({tables.length} 桌)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: Participants List & Single Add (NO TABLE NUMBER) */}
          {activeTab === 'participants' && (
            <div className="space-y-4">
              {/* Single Add Form: Only Name & Department */}
              <form
                onSubmit={handleAddSingle}
                className="p-4 rounded-xl bg-neutral-900/80 border border-amber-500/30 flex flex-wrap items-center gap-3 text-xs sm:text-sm"
              >
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>單筆快速加設:</span>
                </div>
                <input
                  type="text"
                  placeholder="姓名 (例: 王大明)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 flex-1 min-w-[140px]"
                />
                <input
                  type="text"
                  placeholder="部門/職稱 (選填，例: 營運管理處)"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-black border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 flex-1 min-w-[140px]"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors cursor-pointer"
                >
                  新增至抽獎名單
                </button>
              </form>

              {/* Search & Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="搜尋同仁姓名或部門..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg bg-black/60 border border-neutral-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={handleResetToDefault}
                    className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-amber-200 border border-neutral-700 flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>載入預設名單</span>
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="px-3 py-1.5 rounded bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-700/50 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>清空名單</span>
                  </button>
                  <button
                    onClick={exportToJson}
                    className="px-3 py-1.5 rounded bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-500/30 flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>備份名單</span>
                  </button>
                </div>
              </div>

              {/* Participants Table Grid - NO TABLE NUMBER COLUMN */}
              <div className="rounded-xl border border-neutral-800 overflow-hidden bg-black/40">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-neutral-900 text-amber-300 uppercase tracking-wider text-[11px] border-b border-neutral-800">
                    <tr>
                      <th className="px-4 py-2.5">狀態</th>
                      <th className="px-4 py-2.5">姓名</th>
                      <th className="px-4 py-2.5">所屬部門 / 職稱</th>
                      <th className="px-4 py-2.5 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    {filteredParticipants.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                          尚無符合的人員名單
                        </td>
                      </tr>
                    ) : (
                      filteredParticipants.map((p) => (
                        <tr
                          key={p.id}
                          className={`hover:bg-neutral-900/50 transition-colors ${
                            p.isWinner ? 'bg-amber-950/20' : ''
                          }`}
                        >
                          <td className="px-4 py-2.5">
                            {p.isWinner ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                                已中獎
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                                待抽中
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 font-bold text-white">{p.name}</td>
                          <td className="px-4 py-2.5 text-neutral-300">{p.department || '---'}</td>
                          <td className="px-4 py-2.5 text-right space-x-2">
                            <button
                              onClick={() => handleToggleWinnerStatus(p.id)}
                              className="text-xs text-amber-400 hover:text-amber-200 underline"
                            >
                              {p.isWinner ? '移回待抽' : '標記中獎'}
                            </button>
                            <button
                              onClick={() => handleDeleteParticipant(p.id)}
                              className="text-xs text-red-400 hover:text-red-300 p-1"
                              title="刪除此同仁"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Bulk Add Text Area */}
          {activeTab === 'bulk_add' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-900/80 border border-amber-500/30 text-xs sm:text-sm text-neutral-300">
                <h4 className="font-bold text-amber-300 text-sm mb-1">
                  批量貼入同仁抽獎名單說明：
                </h4>
                <p className="mb-2">
                  每行一人，可使用逗號或空格分隔「姓名、部門」，例如：
                </p>
                <div className="p-3 bg-black rounded-lg font-mono text-amber-200 text-xs space-y-1 border border-neutral-800">
                  <div>陳冠宇, 營運策略處</div>
                  <div>林雅婷, 營運策略處</div>
                  <div>楊承翰, 品質工程處</div>
                  <div>周宗翰 (若只填名字也可以)</div>
                </div>
              </div>

              <textarea
                rows={10}
                placeholder="請在此直接貼上大量同仁名單..."
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="w-full p-4 rounded-xl bg-black border border-neutral-700 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">
                  約辨識出 {bulkText.split('\n').filter((l) => l.trim()).length} 筆同仁名單
                </span>
                <button
                  onClick={handleBulkAdd}
                  disabled={!bulkText.trim()}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold transition-all disabled:opacity-40"
                >
                  確認批量匯入
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Tables View - THE REQUESTED SINGLE TEXT BOX WITH ENTER/RETURN */}
          {activeTab === 'tables' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-900/80 border border-amber-500/30 text-xs sm:text-sm text-neutral-300 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-amber-300 text-sm mb-1">
                    桌次名稱分行寫入（支援 Enter / Return 換行）：
                  </h4>
                  <p className="text-xs text-neutral-400">
                    直接在下方文字框輸入或貼入桌子名稱，以 Enter 換行即可，系統將自動以此清單進行「全桌同慶大贏家」抽獎。
                  </p>
                </div>
                <button
                  onClick={handleResetDefaultTables}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 text-xs flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>恢復預設 8 桌名稱</span>
                </button>
              </div>

              {/* The Single Text Box */}
              <div className="relative">
                <textarea
                  rows={12}
                  value={tableText}
                  onChange={handleTableTextChange}
                  placeholder={`第 1 桌 · 榮耀啟航桌\n第 2 桌 · 營運卓越桌\n第 3 桌 · 攜手同行桌\n第 4 桌 · 共創佳績桌\n（請以 Enter / Return 換行輸入各桌名稱）`}
                  className="w-full p-4 rounded-2xl bg-black/90 border-2 border-amber-500/40 text-amber-100 font-mono text-sm leading-relaxed focus:outline-none focus:border-amber-400 shadow-inner"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-amber-400/80 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
                <span>目前已成功解析：<strong className="text-amber-200 text-sm">{tables.length}</strong> 個有效桌次席位</span>
                <span>即時自動保存，無需點擊其他按鈕</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-amber-500/30 bg-black/60 flex items-center justify-between text-xs text-neutral-400">
          <span>所有名單與桌次設定皆會即時保存於瀏覽器</span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-colors cursor-pointer"
          >
            完成並返回抽獎殿堂
          </button>
        </div>
      </div>
    </div>
  );
};
