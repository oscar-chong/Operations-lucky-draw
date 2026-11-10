/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Trophy, RotateCcw, Copy, Check, Download, Trash2, Wine } from 'lucide-react';
import { IndividualWinnerRecord, TableWinnerRecord } from '../types';

interface WinnersHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  individualWinners: IndividualWinnerRecord[];
  tableWinners: TableWinnerRecord[];
  onRestoreIndividualWinner: (id: string, participantId: string) => void;
  onRestoreTableWinner: (id: string, tableId: string) => void;
  onClearHistory: () => void;
}

export const WinnersHistoryModal: React.FC<WinnersHistoryModalProps> = ({
  isOpen,
  onClose,
  individualWinners,
  tableWinners,
  onRestoreIndividualWinner,
  onRestoreTableWinner,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'individual' | 'table'>('individual');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyClipboard = () => {
    let text = '=== 2026 營運盛會 · 中獎榮耀名錄 ===\n\n';
    if (activeTab === 'individual') {
      text += '【個人幸運大獎得主】\n';
      individualWinners.forEach((w, i) => {
        text += `${i + 1}. ${w.name} ${w.department ? `(${w.department})` : ''} - ${w.timestamp}\n`;
      });
    } else {
      text += '【全桌同慶大贏家席位】\n';
      tableWinners.forEach((w, i) => {
        text += `${i + 1}. ${w.tableName} - ${w.timestamp}\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    if (activeTab === 'individual') {
      csvContent += '中獎時間,得獎同仁姓名,部門/職稱\n';
      individualWinners.forEach((w) => {
        csvContent += `"${w.timestamp}","${w.name}","${w.department || ''}"\n`;
      });
    } else {
      csvContent += '中獎時間,得獎桌次名稱\n';
      tableWinners.forEach((w) => {
        csvContent += `"${w.timestamp}","${w.tableName}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `2026_營運盛會_${activeTab === 'individual' ? '個人中獎名單' : '全桌中獎席位'}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const totalCount = activeTab === 'individual' ? individualWinners.length : tableWinners.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[88vh] flex flex-col rounded-3xl bg-neutral-950 border-2 border-amber-500/50 shadow-[0_0_50px_rgba(245,197,66,0.3)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/30 bg-black/60">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Trophy className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-serif-tc text-lg sm:text-xl font-bold text-amber-200">
                2026 盛會中獎榮耀名錄
              </h2>
              <p className="text-xs text-amber-400/70">
                即時查閱所有得獎紀錄、放回抽獎池、匯出名冊至 Excel
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

        {/* Tab & Action Toolbar */}
        <div className="px-6 py-3 bg-neutral-900/60 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('individual')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'individual'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-neutral-400 hover:text-white bg-black/40'
              }`}
            >
              個人得獎名錄 ({individualWinners.length})
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'table'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-neutral-400 hover:text-white bg-black/40'
              }`}
            >
              全桌得獎席位 ({tableWinners.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyClipboard}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-200 border border-neutral-700 transition-colors"
              title="複製中獎名單到剪貼簿"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已複製' : '複製名冊'}</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900/80 text-amber-300 border border-amber-500/30 transition-colors"
              title="下載 Excel / CSV 格式"
            >
              <Download className="w-3.5 h-3.5" />
              <span>匯出 CSV</span>
            </button>
            {totalCount > 0 && (
              <button
                onClick={() => {
                  if (confirm('確定要清空所有中獎歷史紀錄嗎？')) onClearHistory();
                }}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                title="清空中獎紀錄"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {activeTab === 'individual' ? (
            individualWinners.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-sm">
                尚未產生個人中獎名單，點擊「啟動神祕大抽獎」誕生第一位幸運兒！
              </div>
            ) : (
              individualWinners.map((w, idx) => (
                <div
                  key={w.id}
                  className="p-4 rounded-2xl bg-gradient-to-r from-neutral-900/90 via-black to-neutral-900/90 border border-amber-500/30 flex items-center justify-between gap-4 shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold text-xs">
                      {individualWinners.length - idx}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif-tc text-lg font-black text-amber-100">
                          {w.name}
                        </span>
                        {w.department && (
                          <span className="text-xs text-neutral-300 bg-black/60 px-2 py-0.5 rounded border border-neutral-800">
                            {w.department}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-400 mt-1 font-mono">
                        {w.timestamp}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRestoreIndividualWinner(w.id, w.participantId)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-amber-300 border border-neutral-700 hover:border-amber-500/40 transition-colors"
                    title="放回抽獎池重新抽獎"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>放回待抽池</span>
                  </button>
                </div>
              ))
            )
          ) : tableWinners.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-sm">
              尚未產生全桌大獎席位，切換至「全桌同慶大贏家」模式抽取！
            </div>
          ) : (
            tableWinners.map((tw, idx) => (
              <div
                key={tw.id}
                className="p-4 rounded-2xl bg-gradient-to-r from-neutral-900/90 via-black to-neutral-900/90 border border-amber-500/30 flex items-center justify-between gap-4 shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold text-xs">
                    {tableWinners.length - idx}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif-tc text-lg font-black text-amber-100">
                        {tw.tableName}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-400 mt-1 font-mono">
                      {tw.timestamp}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onRestoreTableWinner(tw.id, tw.tableId)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-amber-300 border border-neutral-700 hover:border-amber-500/40 transition-colors"
                  title="放回抽獎池重新抽取"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>放回待抽池</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-amber-500/30 bg-black/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            關閉名錄
          </button>
        </div>
      </div>
    </div>
  );
};
