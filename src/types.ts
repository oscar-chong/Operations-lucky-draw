/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Participant {
  id: string;
  name: string;
  department?: string;
  tableNumber?: number;
  badge?: string;
  isWinner?: boolean;
}

export interface TableItem {
  id: string;
  tableName: string;
  isWinner?: boolean;
}

export interface Prize {
  id: string;
  name: string;
  subtitle: string;
  count: number;
  color: string;
  category: 'individual' | 'table' | 'both';
}

export interface IndividualWinnerRecord {
  id: string;
  participantId: string;
  name: string;
  department?: string;
  timestamp: string;
}

export interface TableWinnerRecord {
  id: string;
  tableId: string;
  tableName: string;
  timestamp: string;
}

export type DrawMode = 'individual' | 'table';

export type SuspensePhase =
  | 'idle'
  | 'charging'      // Lights dim, heartbeat begins
  | 'fast_spinning'  // Blurring vortex of candidate names, high speed
  | 'decelerating'   // Dramatic near-miss slowdown with heavy bass thuds
  | 'climax_pause'   // 0.8s heart-stopping silent tension pause
  | 'revealed';      // Grand explosion of gold, fireworks, banner & sound
