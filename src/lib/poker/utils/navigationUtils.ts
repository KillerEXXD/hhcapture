/**
 * Navigation Utilities
 * Functions for managing stage/level navigation and transitions
 */

import { Stage, ActionLevel, ActionSuffix, SectionKey } from '../../../types/poker';

/**
 * Convert action level to suffix format
 */
export function getLevelSuffix(level: ActionLevel): ActionSuffix {
  switch (level) {
    case 'base':
      return '';
    case 'more':
      return '_moreAction';
    case 'more2':
      return '_moreAction2';
    default:
      return '';
  }
}

/**
 * Convert suffix to action level
 */
export function getSuffixLevel(suffix: ActionSuffix): ActionLevel {
  switch (suffix) {
    case '':
      return 'base';
    case '_moreAction':
      return 'more';
    case '_moreAction2':
      return 'more2';
    default:
      return 'base';
  }
}

/**
 * Create section key from stage and level
 */
export function createSectionKey(stage: Stage, level: ActionLevel): SectionKey {
  return `${stage}_${level}` as SectionKey;
}

/**
 * Parse section key into stage and level
 */
export function parseSectionKey(sectionKey: string): { stage: Stage; level: ActionLevel } {
  const [stage, level] = sectionKey.split('_') as [Stage, ActionLevel];
  return { stage, level };
}

/**
 * Get all sections in order up to a target stage/level
 */
export function getSectionsInOrder(
  targetStage: Stage,
  targetLevel: ActionLevel
): SectionKey[] {
  const stageOrder: Stage[] = ['preflop', 'flop', 'turn', 'river'];
  const levelOrder: ActionLevel[] = ['base', 'more', 'more2'];

  const targetStageIndex = stageOrder.indexOf(targetStage);
  const targetLevelIndex = levelOrder.indexOf(targetLevel);

  const sections: SectionKey[] = [];

  for (let s = 0; s <= targetStageIndex; s++) {
    const stage = stageOrder[s];
    const maxLevel = s === targetStageIndex ? targetLevelIndex : levelOrder.length - 1;

    for (let l = 0; l <= maxLevel; l++) {
      const level = levelOrder[l];
      sections.push(createSectionKey(stage, level));
    }
  }

  return sections;
}

/**
 * Get the next stage in sequence
 */
export function getNextStage(currentStage: Stage): Stage | null {
  const stageOrder: Stage[] = ['stack', 'preflop', 'flop', 'turn', 'river'];
  const currentIndex = stageOrder.indexOf(currentStage);

  if (currentIndex === -1 || currentIndex === stageOrder.length - 1) {
    return null;
  }

  return stageOrder[currentIndex + 1];
}

/**
 * Get the previous stage in sequence
 */
export function getPreviousStage(currentStage: Stage): Stage | null {
  const stageOrder: Stage[] = ['stack', 'preflop', 'flop', 'turn', 'river'];
  const currentIndex = stageOrder.indexOf(currentStage);

  if (currentIndex <= 0) {
    return null;
  }

  return stageOrder[currentIndex - 1];
}

/**
 * Get the next level within a stage, or null if at max
 */
export function getNextLevel(currentLevel: ActionLevel): ActionLevel | null {
  switch (currentLevel) {
    case 'base':
      return 'more';
    case 'more':
      return 'more2';
    case 'more2':
      return null;
    default:
      return null;
  }
}

/**
 * Get the previous level within a stage, or null if at base
 */
export function getPreviousLevel(currentLevel: ActionLevel): ActionLevel | null {
  switch (currentLevel) {
    case 'more2':
      return 'more';
    case 'more':
      return 'base';
    case 'base':
      return null;
    default:
      return null;
  }
}

/**
 * Get stage display name
 */
export function getStageDisplayName(stage: Stage): string {
  const displayNames: Record<Stage, string> = {
    stack: 'Stack Setup',
    preflop: 'Pre-Flop',
    flop: 'Flop',
    turn: 'Turn',
    river: 'River',
  };

  return displayNames[stage] || stage;
}

/**
 * Get level display name
 */
export function getLevelDisplayName(level: ActionLevel): string {
  const displayNames: Record<ActionLevel, string> = {
    base: 'Base Action',
    more: 'More Action 1',
    more2: 'More Action 2',
  };

  return displayNames[level] || level;
}

/**
 * Check if a stage requires community cards
 */
export function requiresCommunityCards(stage: Stage): boolean {
  return stage === 'flop' || stage === 'turn' || stage === 'river';
}

/**
 * Get required community card count for a stage
 */
export function getRequiredCardCount(stage: Stage): number {
  switch (stage) {
    case 'flop':
      return 3;
    case 'turn':
      return 4;
    case 'river':
      return 5;
    default:
      return 0;
  }
}
