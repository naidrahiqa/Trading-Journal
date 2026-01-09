/**
 * Psychology Tags Configuration
 * @description Tag options for trading psychology tracking
 * @version 3.0.0
 */

import { PsychologyTag, PsychologyTagOption } from '@/types/trading';

// ==================== PSYCHOLOGY TAG DEFINITIONS ====================

export const PSYCHOLOGY_TAGS: PsychologyTagOption[] = [
  // Positive Tags
  {
    id: 'disciplined',
    label: 'Disciplined',
    emoji: '🎯',
    category: 'positive',
    color: '#10b981' // emerald-500
  },
  {
    id: 'planned',
    label: 'Planned',
    emoji: '📋',
    category: 'positive',
    color: '#3b82f6' // blue-500
  },
  {
    id: 'patience',
    label: 'Patient',
    emoji: '⏳',
    category: 'positive',
    color: '#8b5cf6' // purple-500
  },
  {
    id: 'analytical',
    label: 'Analytical',
    emoji: '📊',
    category: 'positive',
    color: '#06b6d4' // cyan-500
  },

  // Negative Tags (Mistakes)
  {
    id: 'fomo',
    label: 'FOMO',
    emoji: '😱',
    category: 'negative',
    color: '#f43f5e' // rose-500
  },
  {
    id: 'revenge_trade',
    label: 'Revenge Trade',
    emoji: '😤',
    category: 'negative',
    color: '#ef4444' // red-500
  },
  {
    id: 'greed',
    label: 'Greedy',
    emoji: '🤑',
    category: 'negative',
    color: '#f59e0b' // amber-500
  },
  {
    id: 'fear',
    label: 'Fearful',
    emoji: '😨',
    category: 'negative',
    color: '#ec4899' // pink-500
  },
  {
    id: 'overconfident',
    label: 'Overconfident',
    emoji: '😎',
    category: 'negative',
    color: '#f97316' // orange-500
  },
  {
    id: 'impulsive',
    label: 'Impulsive',
    emoji: '⚡',
    category: 'negative',
    color: '#dc2626' // red-600
  },
  {
    id: 'emotional',
    label: 'Emotional',
    emoji: '😢',
    category: 'negative',
    color: '#db2777' // pink-600
  },

  // Neutral Tags
  {
    id: 'fearful',
    label: 'Cautious',
    emoji: '🤔',
    category: 'neutral',
    color: '#64748b' // slate-500
  },
];

// ==================== TAG CATEGORIES ====================

export const POSITIVE_TAGS = PSYCHOLOGY_TAGS.filter(t => t.category === 'positive');
export const NEGATIVE_TAGS = PSYCHOLOGY_TAGS.filter(t => t.category === 'negative');
export const NEUTRAL_TAGS = PSYCHOLOGY_TAGS.filter(t => t.category === 'neutral');

// Mistake tags (FOMO + Revenge Trade)
export const MISTAKE_TAGS: PsychologyTag[] = ['fomo', 'revenge_trade'];

// ==================== HELPER FUNCTIONS ====================

/**
 * Get tag configuration by ID
 */
export const getTagById = (tagId: string): PsychologyTagOption | undefined => {
  return PSYCHOLOGY_TAGS.find(t => t.id === tagId);
};

/**
 * Get tags by category
 */
export const getTagsByCategory = (category: 'positive' | 'negative' | 'neutral'): PsychologyTagOption[] => {
  return PSYCHOLOGY_TAGS.filter(t => t.category === category);
};

/**
 * Check if tag is a mistake tag
 */
export const isMistakeTag = (tagId: string): boolean => {
  return MISTAKE_TAGS.includes(tagId as PsychologyTag);
};

/**
 * Get tag color class for Tailwind
 */
export const getTagColorClass = (tagId: string): string => {
  const tag = getTagById(tagId);
  if (!tag) return 'text-slate-400';
  
  switch (tag.category) {
    case 'positive':
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    case 'negative':
      return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    default:
      return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
  }
};

// ==================== EXPORT DEFAULT ====================

export default {
  PSYCHOLOGY_TAGS,
  POSITIVE_TAGS,
  NEGATIVE_TAGS,
  NEUTRAL_TAGS,
  MISTAKE_TAGS,
  getTagById,
  getTagsByCategory,
  isMistakeTag,
  getTagColorClass,
};
