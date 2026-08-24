/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  TaterAvatarConfig, 
  configToDataUrl 
} from '../components/TaterzAvatarBuilderModal';

// Deterministic hash helper for consistent seed-based procedural tater avatar generation
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const SKIN_TONES = ['russet', 'golden', 'sweet', 'purple', 'baked'] as const;
const HAIR_STYLES = ['short', 'curly', 'long', 'spiky', 'buzzcut', 'sidepart', 'wavy', 'bob'] as const;
const HAIR_COLORS = ['brown', 'black', 'blonde', 'ginger'] as const;
const EYE_STYLES = ['chill', 'excited', 'glasses', 'sunglasses'] as const;
const MOUTH_STYLES = ['smile', 'grin', 'smirk', 'mustache', 'chevron_stache', 'beard'] as const;
const HAT_STYLES = ['none', 'none', 'none', 'beanie', 'cap', 'headphones'] as const;
const OUTFIT_STYLES = ['hoodie', 'tee', 'short_sleeve_tie', 'tracksuit', 'hawaiian', 'tuxedo'] as const;
const ITEM_STYLES = ['remote', 'popcorn', 'soda', 'gamepad', 'pizza', 'coffee'] as const;
const BG_STYLES = ['pastel_blue', 'pastel_pink', 'pastel_purple', 'dark'] as const;

export const JULIO_OFFICIAL_AVATAR = "https://api.dicebear.com/9.x/pixel-art/svg?seed=LazyPotato_3661&backgroundColor=1e293b&hairColor%5B%5D=261308&glassesProbability=0&mouth%5B%5D=happy04&eyes%5B%5D=variant08&eyesColor%5B%5D=48210a&clothing%5B%5D=variant03&clothingColor%5B%5D=141414&hatProbability=0&beardProbability=100&beard%5B%5D=variant01&accessoriesProbability=0";

/**
 * Creates a unique, deterministic DiceBear Pixel-Art Avatar URL based on a user identifier or name.
 */
export function getTaterCreatorAvatarUrl(seed: string): string {
  const cleanSeed = (seed || 'Julio').trim();
  const lower = cleanSeed.toLowerCase();

  if (lower === 'julio' || lower === 'juliozaldivar@gmail.com' || lower === 'julio@couchtaterz.com' || lower === 'julio@taterz.com' || lower === 'default' || lower === 'user-julio' || lower === 'jlz') {
    return JULIO_OFFICIAL_AVATAR;
  }
  if (lower.includes('doug')) {
    return 'https://api.dicebear.com/7.x/pixel-art/svg?seed=DougBriskie';
  }
  if (lower.includes('rafael')) {
    return 'https://api.dicebear.com/7.x/pixel-art/svg?seed=RafaelGomez';
  }
  if (lower.includes('annadee') || lower.includes('lily')) {
    return 'https://api.dicebear.com/7.x/pixel-art/svg?seed=AnnaDee';
  }
  if (lower.includes('kris')) {
    return 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Kris';
  }
  if (lower.includes('ejc')) {
    return 'https://api.dicebear.com/7.x/pixel-art/svg?seed=EJC';
  }
  if (lower.includes('stef')) {
    return 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Stef';
  }
  if (lower.includes('julian')) {
    return 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Cat';
  }
  if (lower.includes('greg')) {
    return 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Greg';
  }
  if (lower.includes('hyunjin')) {
    return 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Hyunjin';
  }
  if (lower.includes('marcus')) {
    return 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Marcus';
  }
  if (lower.includes('sarah')) {
    return 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Sarah';
  }

  return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(cleanSeed)}`;
}
