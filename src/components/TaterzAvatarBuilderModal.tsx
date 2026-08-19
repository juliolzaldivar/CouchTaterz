import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, Sparkles, Lock, Check, Crown, Tv, Shirt, Smile, Eye, 
  Palette, Wand2, RotateCcw, ShieldCheck, ShoppingBag, Award, Zap, Flame, UserCheck, Scissors,
  Trash2, Edit2, Save, Plus, Copy, ExternalLink, RefreshCw, Sliders, Pipette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface TaterAvatarConfig {
  body: string;       // Skin tone: 'russet' (fair) | 'golden' (tan) | 'sweet' (bronze) | 'purple' (ebony) | 'baked' (olive) | 'cyber' (pale) | 'galaxy' (zombie)
  hair?: string;      // 'short' | 'curly' | 'long' | 'spiky' | 'bald' | 'ponytail' | 'dreadlocks' | 'afro' | 'buzzcut' | 'mohawk' | 'pigtails' | 'sidepart' | 'wavy' | 'bob' | 'bowlcut'
  hairColor?: string; // 'brown' | 'black' | 'blonde' | 'ginger' | 'silver' | 'neon'
  eyes: string;       // 'chill' | 'excited' | 'sunglasses' | 'glasses' | 'monocle' | 'sleepy' | 'laser' | 'stars'
  mouth: string;      // 'smile' | 'grin' | 'popcorn' | 'tongue' | 'beard' | 'smirk' | 'pipe' | 'mustache' | 'chevron_stache'
  hat: string;        // 'none' | 'beanie' | 'cap' | 'chef' | 'cowboy' | 'crown' | 'tvhead' | 'wizard' | 'headphones' | 'porkpie' | 'visor'
  outfit: string;     // 'none' | 'hoodie' | 'tee' | 'tuxedo' | 'hawaiian' | 'hazmat' | 'green_jumpsuit' | 'apron' | 'tracksuit' | 'pink_dress' | 'short_sleeve_tie' | 'hero_cape' | 'hooded_parka'
  item: string;       // 'none' | 'remote' | 'popcorn' | 'soda' | 'gamepad' | 'pizza' | 'golden_remote' | 'vip_badge' | 'trophy' | 'waffle' | 'coffee'
  bg: string;         // 'dark' | 'gold' | 'neon' | 'sunset' | 'red_curtain' | 'pastel_blue' | 'pastel_pink' | 'pastel_purple'
  customOutfitColor?: string; // VIP custom hex color for attire
  customHatColor?: string;    // VIP custom hex color for hats/headwear
  customHairColor?: string;   // VIP custom hex color for hair/mustache/beard
  customSkinColor?: string;   // VIP custom hex color for skin tone
  customEyeColor?: string;    // Custom hex color for eye iris/pupils
  customBgColor?: string;     // VIP custom hex color for background
}

export const DEFAULT_TATER_CONFIG: TaterAvatarConfig = {
  body: 'russet',
  hair: 'short',
  hairColor: 'brown',
  eyes: 'chill',
  mouth: 'smile',
  hat: 'none',
  outfit: 'hoodie',
  item: 'remote',
  bg: 'dark',
};

export interface OptionItem {
  id: string;
  name: string;
  isVip?: boolean;
  icon?: string;
  presetConfig?: TaterAvatarConfig;
  imageUrl?: string;
}

export const CHARACTER_PRESETS: OptionItem[] = [];

export const BODY_OPTIONS: OptionItem[] = [
  { id: 'russet', name: 'Fair Skin' },
  { id: 'golden', name: 'Warm Tan' },
  { id: 'sweet', name: 'Bronze Skin' },
  { id: 'purple', name: 'Deep Ebony' },
  { id: 'baked', name: 'Olive Tone' },
  { id: 'cyber', name: 'Cyber Pale', isVip: true },
  { id: 'galaxy', name: 'Zombie Green', isVip: true },
];

export const HAIR_OPTIONS: OptionItem[] = [
  { id: 'short', name: 'Short Crop' },
  { id: 'curly', name: 'Curly Afro' },
  { id: 'long', name: 'Long Flowing' },
  { id: 'spiky', name: 'Spiky Anime' },
  { id: 'bald', name: 'Shaved / Bald' },
  { id: 'ponytail', name: 'Ponytail' },
  { id: 'dreadlocks', name: 'Dreadlocks' },
  { id: 'afro', name: 'Big Pixel Afro 💇‍♂️' },
  { id: 'buzzcut', name: 'Clean Buzz Cut 💈' },
  { id: 'mohawk', name: 'Punk Mohawk ⚡' },
  { id: 'pigtails', name: 'Cute Twin Pigtails 👧' },
  { id: 'sidepart', name: 'Slick Side-Part 👨‍💼' },
  { id: 'wavy', name: 'Wavy Shoulder Length 🌊' },
  { id: 'bob', name: 'Classic Bob Cut 💇‍♀️' },
  { id: 'bowlcut', name: 'Retro Bowl Cut 🥣' },
];

export const HAIR_COLOR_OPTIONS: OptionItem[] = [
  { id: 'brown', name: 'Chestnut Brown' },
  { id: 'black', name: 'Charcoal Black' },
  { id: 'blonde', name: 'Golden Blonde' },
  { id: 'ginger', name: 'Crimson Red' },
  { id: 'silver', name: 'Platinum Silver' },
  { id: 'neon', name: 'Cyber Blue', isVip: true },
];

export const EYES_OPTIONS: OptionItem[] = [
  { id: 'chill', name: 'Classic Pixel Eyes' },
  { id: 'excited', name: 'Sparkle Eyes' },
  { id: 'glasses', name: 'Reading Specs' },
  { id: 'sunglasses', name: '8-Bit Shades' },
  { id: 'monocle', name: 'Monocle' },
  { id: 'sleepy', name: 'Late Night Binge' },
  { id: 'laser', name: 'Laser Beam ⚡', isVip: true },
  { id: 'stars', name: 'Star-struck ✨', isVip: true },
];

export const MOUTH_OPTIONS: OptionItem[] = [
  { id: 'smile', name: 'Pixel Smile' },
  { id: 'grin', name: 'Big Teeth Grin' },
  { id: 'smirk', name: 'Snarky Smirk' },
  { id: 'mustache', name: 'Handlebar Mustache 🥸' },
  { id: 'chevron_stache', name: 'Chevron Mustache 👨' },
  { id: 'beard', name: 'Goatee & Beard' },
  { id: 'popcorn', name: 'Munching Popcorn' },
  { id: 'tongue', name: 'Tongue Out 😛' },
  { id: 'pipe', name: 'Retro Pipe', isVip: true },
];

export const HAT_OPTIONS: OptionItem[] = [
  { id: 'none', name: 'No Hat' },
  { id: 'beanie', name: 'Cozy Beanie' },
  { id: 'cap', name: 'Backward Cap' },
  { id: 'headphones', name: 'Gaming Headset' },
  { id: 'chef', name: 'Chef Toque' },
  { id: 'cowboy', name: 'Western Hat' },
  { id: 'porkpie', name: 'Heisenberg Porkpie', isVip: true },
  { id: 'visor', name: 'Coach Visor', isVip: true },
  { id: 'crown', name: 'Royal Crown 👑', isVip: true },
  { id: 'dragon_crown', name: 'Valyrian Crown 🐉', isVip: true },
  { id: 'bat_cowl', name: 'Bat Cowl 🦇', isVip: true },
  { id: 'tvhead', name: 'Retro TV Helmet 📺', isVip: true },
  { id: 'wizard', name: 'Wizard Hat 🧙', isVip: true },
];

export const OUTFIT_OPTIONS: OptionItem[] = [
  { id: 'none', name: 'Plain Tank Top' },
  { id: 'short_sleeve_tie', name: 'Short Sleeve Shirt & Tie 👔' },
  { id: 'hero_cape', name: 'Hero Suit & Cape 🦸' },
  { id: 'hooded_parka', name: 'Hooded Parka 🧥' },
  { id: 'hoodie', name: 'Cozy Couch Hoodie' },
  { id: 'tee', name: 'Binge Watch Tee' },
  { id: 'tuxedo', name: 'Red Carpet Tux' },
  { id: 'hawaiian', name: 'Hawaiian Shirt' },
  { id: 'hazmat', name: 'Hazmat Suit ☣️', isVip: true },
  { id: 'green_jumpsuit', name: 'Green Suit', isVip: true },
  { id: 'apron', name: 'Chef Apron 👨‍🍳', isVip: true },
  { id: 'tracksuit', name: 'Coach Tracksuit ⚽', isVip: true },
  { id: 'pink_dress', name: 'Eggo Pink Dress 🧇', isVip: true },
];

export const ITEM_OPTIONS: OptionItem[] = [
  { id: 'none', name: 'No Accessory' },
  { id: 'remote', name: 'TV Remote' },
  { id: 'popcorn', name: 'Popcorn Bucket' },
  { id: 'soda', name: 'Big Soda Cup' },
  { id: 'gamepad', name: 'Game Controller' },
  { id: 'pizza', name: 'Slice of Pizza' },
  { id: 'coffee', name: 'Coffee Mug' },
  { id: 'golden_remote', name: 'Golden Remote 🌟', isVip: true },
  { id: 'vip_badge', name: 'VIP Gold Badge 🏅', isVip: true },
  { id: 'trophy', name: 'Couch Potato Trophy 🏆', isVip: true },
  { id: 'dundie', name: 'Dundie Trophy 🏆', isVip: true },
  { id: 'grogu', name: 'Grogu Pod 🍼', isVip: true },
  { id: 'lightsaber', name: 'Lightsaber ⚔️', isVip: true },
  { id: 'dragon_egg', name: 'Dragon Egg 🥚', isVip: true },
  { id: 'yellow_umbrella', name: 'Yellow Umbrella ☂️', isVip: true },
  { id: 'chef_knife', name: 'Chef Knife 🔪', isVip: true },
  { id: 'green_ring', name: 'Power Ring 🟢', isVip: true },
  { id: 'waffle', name: 'Eggo Waffle 🧇', isVip: true },
];

export const BG_OPTIONS: OptionItem[] = [
  { id: 'dark', name: 'Midnight Slate' },
  { id: 'pastel_blue', name: 'Pastel Sky Blue' },
  { id: 'pastel_pink', name: 'Pastel Blush Pink' },
  { id: 'pastel_purple', name: 'Pastel Lavender' },
  { id: 'gold', name: 'Gold VIP Aura', isVip: true },
  { id: 'neon', name: 'Cyber Grid', isVip: true },
  { id: 'sunset', name: 'Retro 80s Sunset', isVip: true },
  { id: 'vhs_static', name: 'VHS Tape Static 📺', isVip: true },
  { id: 'matrix', name: 'Digital Rain 🟢', isVip: true },
  { id: 'red_curtain', name: 'Cinema Red', isVip: true },
];

export function hueToHex(h: number, s: number = 85, l: number = 50): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function hexToHue(hex: string): number {
  if (!hex || !hex.startsWith('#') || hex.length !== 7) return 210;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  if (max !== min) {
    const d = max - min;
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return Math.round(h * 360);
}

// 8-Bit Pixel Art SVG Generator for Human Character Avatars (High Resolution 32x32 TV Character Portrait Style)
export function renderTaterSVG(config: TaterAvatarConfig, size: number = 200): string {
  const hair = config.hair || 'short';
  const hairColorKey = config.hairColor || 'brown';

  // Skin tone color map (base skin + 3D contour shadow tone + dark outline tone)
  let skinColor = config.customSkinColor || '#E2B383';
  let skinShadow = '#C18F5C';

  if (!config.customSkinColor) {
    if (config.body === 'russet') {
      skinColor = '#F3CBA8';
      skinShadow = '#D4A27B';
    } else if (config.body === 'golden') {
      skinColor = '#E2B383';
      skinShadow = '#C18F5C';
    } else if (config.body === 'sweet') {
      skinColor = '#C88D54';
      skinShadow = '#9B632E';
    } else if (config.body === 'purple') {
      skinColor = '#5A3822';
      skinShadow = '#3A2010';
    } else if (config.body === 'baked') {
      skinColor = '#9A6838';
      skinShadow = '#734820';
    } else if (config.body === 'cyber') {
      skinColor = '#A5F3FC';
      skinShadow = '#5EEAD4';
    } else if (config.body === 'galaxy') {
      skinColor = '#86EFAC';
      skinShadow = '#34D399';
    }
  } else {
    skinShadow = config.customSkinColor;
  }

  // Eye iris/pupil color
  const eColor = config.customEyeColor || '#18181B';

  // Hair & Facial Hair colors
  let hColor = config.customHairColor || '#78350F';
  if (!config.customHairColor) {
    if (hairColorKey === 'black') hColor = '#18181B';
    if (hairColorKey === 'blonde') hColor = '#F59E0B';
    if (hairColorKey === 'ginger') hColor = '#DC2626';
    if (hairColorKey === 'silver') hColor = '#E2E8F0';
    if (hairColorKey === 'neon') hColor = '#06B6D4';
  }

  // Outfit base colors
  let outfitBg = config.customOutfitColor || '#1E3A8A';
  if (!config.customOutfitColor) {
    if (config.outfit === 'mustard_shirt_tie') outfitBg = '#D97706';
    if (config.outfit === 'suit_open_collar') outfitBg = '#1E293B';
    if (config.outfit === 'white_apron') outfitBg = '#F8FAFC';
    if (config.outfit === 'blue_shirt') outfitBg = '#60A5FA';
    if (config.outfit === 'leopard_top') outfitBg = '#F59E0B';
    if (config.outfit === 'army_jacket') outfitBg = '#3F6212';
    if (config.outfit === 'sweater_vest') outfitBg = '#065F46';
    if (config.outfit === 'brown_jacket_plaid') outfitBg = '#78350F';
    if (config.outfit === 'grey_armor') outfitBg = '#475569';
    if (config.outfit === 'orange_harness') outfitBg = '#EA580C';
    if (config.outfit === 'thermal_grey') outfitBg = '#334155';
    if (config.outfit === 'chef_coat') outfitBg = '#FFFFFF';
    if (config.outfit === 'tee') outfitBg = '#DC2626';
    if (config.outfit === 'tuxedo') outfitBg = '#18181B';
    if (config.outfit === 'hawaiian') outfitBg = '#0284C7';
    if (config.outfit === 'hazmat') outfitBg = '#EAB308';
    if (config.outfit === 'green_jumpsuit') outfitBg = '#16A34A';
    if (config.outfit === 'apron') outfitBg = '#1E3A8A';
    if (config.outfit === 'tracksuit') outfitBg = '#1D4ED8';
    if (config.outfit === 'pink_dress') outfitBg = '#F472B6';
    if (config.outfit === 'short_sleeve_tie') outfitBg = '#EAB308';
    if (config.outfit === 'none') outfitBg = skinColor;
  }

  // Background color - Default Retro Sky Blue matching user image
  let bgFill = config.customBgColor || '#92C5F9';
  if (!config.customBgColor) {
    if (config.bg === 'pastel_blue') bgFill = '#92C5F9';
    if (config.bg === 'pastel_pink') bgFill = '#FFD5DC';
    if (config.bg === 'pastel_purple') bgFill = '#C0AEDE';
    if (config.bg === 'gold') bgFill = '#FEF08A';
    if (config.bg === 'neon') bgFill = '#051221';
    if (config.bg === 'sunset') bgFill = '#831843';
    if (config.bg === 'vhs_static') bgFill = '#111827';
    if (config.bg === 'matrix') bgFill = '#022C22';
    if (config.bg === 'red_curtain') bgFill = '#450A0A';
    if (config.bg === 'dark') bgFill = '#1E293B';
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}" shape-rendering="crispEdges">
  <!-- 32x32 Canvas Background -->
  <rect width="32" height="32" fill="${bgFill}" />
  <rect x="0" y="0" width="32" height="32" fill="none" stroke="#000000" stroke-width="0.5" opacity="0.3" />

  <!-- NECK (x=14..17, y=20..22) -->
  <rect x="14" y="20" width="4" height="2" fill="${skinShadow}" />

  <!-- TORSO / OUTFIT (x=5..26, y=21..32) -->
  <rect x="6" y="21" width="20" height="11" fill="${outfitBg}" />
  <rect x="5" y="22" width="22" height="10" fill="${outfitBg}" />

  ${config.outfit === 'mustard_shirt_tie' || config.outfit === 'short_sleeve_tie' ? `
    <rect x="6" y="21" width="20" height="11" fill="#EAB308" />
    <rect x="14" y="21" width="4" height="2" fill="#FFFFFF" />
    <rect x="15" y="21" width="2" height="11" fill="#78350F" />
  ` : ''}

  ${config.outfit === 'suit_open_collar' || config.outfit === 'tuxedo' ? `
    <rect x="6" y="21" width="20" height="11" fill="#1E293B" />
    <polygon points="14,21 18,21 16,27" fill="#FFFFFF" />
    <rect x="12" y="21" width="2" height="11" fill="#1E293B" />
    <rect x="18" y="21" width="2" height="11" fill="#1E293B" />
  ` : ''}

  ${config.outfit === 'white_apron' ? `
    <rect x="6" y="21" width="20" height="11" fill="#64748B" />
    <rect x="9" y="21" width="14" height="11" fill="#F8FAFC" />
    <rect x="12" y="21" width="1" height="2" fill="#18181B" />
    <rect x="19" y="21" width="1" height="2" fill="#18181B" />
  ` : ''}

  ${config.outfit === 'blue_shirt' ? `
    <rect x="6" y="21" width="20" height="11" fill="#60A5FA" />
    <rect x="14" y="21" width="4" height="1" fill="#93C5FD" />
  ` : ''}

  ${config.outfit === 'leopard_top' ? `
    <rect x="6" y="21" width="20" height="11" fill="#F59E0B" />
    <polygon points="12,21 20,21 16,25" fill="${skinColor}" />
    <rect x="8" y="23" width="1" height="1" fill="#18181B" />
    <rect x="11" y="25" width="2" height="1" fill="#18181B" />
    <rect x="19" y="24" width="1" height="2" fill="#18181B" />
    <rect x="22" y="22" width="2" height="1" fill="#18181B" />
  ` : ''}

  ${config.outfit === 'army_jacket' ? `
    <rect x="6" y="21" width="20" height="11" fill="#3F6212" />
    <polygon points="14,21 18,21 16,26" fill="#18181B" />
    <rect x="8" y="24" width="3" height="3" fill="#1E3A8A" opacity="0.3" />
    <rect x="21" y="24" width="3" height="3" fill="#1E3A8A" opacity="0.3" />
  ` : ''}

  ${config.outfit === 'sweater_vest' ? `
    <rect x="6" y="21" width="20" height="11" fill="#FFFFFF" />
    <rect x="9" y="21" width="14" height="11" fill="#065F46" />
    <rect x="13" y="23" width="2" height="2" fill="#F59E0B" />
    <rect x="17" y="23" width="2" height="2" fill="#F59E0B" />
  ` : ''}

  ${config.outfit === 'brown_jacket_plaid' ? `
    <rect x="6" y="21" width="20" height="11" fill="#78350F" />
    <rect x="13" y="21" width="6" height="11" fill="#15803D" />
    <rect x="15" y="21" width="2" height="11" fill="#14532D" />
    <rect x="14" y="21" width="4" height="2" fill="#FFFFFF" />
  ` : ''}

  ${config.outfit === 'grey_armor' ? `
    <rect x="6" y="21" width="20" height="11" fill="#475569" />
    <rect x="8" y="22" width="16" height="2" fill="#94A3B8" />
    <circle cx="16" cy="24" r="1.5" fill="#E2E8F0" />
    <rect x="10" y="25" width="12" height="1" fill="#1E293B" />
  ` : ''}

  ${config.outfit === 'orange_harness' ? `
    <rect x="6" y="21" width="20" height="11" fill="#FFFFFF" />
    <rect x="10" y="21" width="2" height="11" fill="#EA580C" />
    <rect x="20" y="21" width="2" height="11" fill="#EA580C" />
  ` : ''}

  ${config.outfit === 'thermal_grey' ? `
    <rect x="6" y="21" width="20" height="11" fill="#334155" />
    <rect x="14" y="21" width="4" height="1" fill="#1E293B" />
  ` : ''}

  ${config.outfit === 'hazmat' ? `
    <rect x="6" y="21" width="20" height="11" fill="#EAB308" />
    <rect x="15" y="21" width="2" height="11" fill="#18181B" />
  ` : ''}

  <!-- 3D HEAD & JAW STRUCTURE (x=9..22, y=6..20) -->
  <!-- Forehead & Upper Cheeks Base -->
  <rect x="11" y="6" width="10" height="2" fill="${skinColor}" />
  <rect x="10" y="8" width="12" height="3" fill="${skinColor}" />
  <rect x="9" y="11" width="14" height="6" fill="${skinColor}" />

  <!-- Ears (x=8, y=13..16 and x=23, y=13..16) -->
  <rect x="8" y="13" width="1" height="4" fill="${skinColor}" />
  <rect x="8" y="14" width="1" height="2" fill="${skinShadow}" />
  <rect x="23" y="13" width="1" height="4" fill="${skinColor}" />
  <rect x="23" y="14" width="1" height="2" fill="${skinShadow}" />

  <!-- Chiseled 3D Jaw Contour Shadows (Exact shading from reference image) -->
  <rect x="10" y="17" width="12" height="3" fill="${skinColor}" />
  <rect x="9" y="16" width="2" height="4" fill="${skinShadow}" />
  <rect x="21" y="16" width="2" height="4" fill="${skinShadow}" />
  <rect x="12" y="20" width="8" height="1" fill="${skinColor}" />
  <rect x="13" y="20" width="6" height="1" fill="${skinShadow}" />

  <!-- Neck (x=13..18, y=21..23) -->
  <rect x="13" y="21" width="6" height="3" fill="${skinColor}" />
  <rect x="13" y="21" width="1" height="3" fill="${skinShadow}" />
  <rect x="18" y="21" width="1" height="3" fill="${skinShadow}" />

  <!-- HAIR BASE & HEADWEAR -->
  ${hair === 'middle_part' ? `
    <rect x="9" y="7" width="14" height="4" fill="${hColor}" />
    <rect x="8" y="9" width="3" height="6" fill="${hColor}" />
    <rect x="21" y="9" width="3" height="6" fill="${hColor}" />
    <rect x="15" y="8" width="2" height="3" fill="${skinColor}" />
  ` : ''}

  ${hair === 'bob' ? `
    <rect x="9" y="6" width="14" height="5" fill="${hColor}" />
    <rect x="7" y="9" width="4" height="10" fill="${hColor}" />
    <rect x="21" y="9" width="4" height="10" fill="${hColor}" />
    <!-- Red Hair Clip -->
    <rect x="10" y="9" width="2" height="1" fill="#DC2626" />
  ` : ''}

  ${hair === 'bouffant' ? `
    <rect x="6" y="3" width="20" height="8" fill="${hColor}" />
    <rect x="5" y="7" width="22" height="10" fill="${hColor}" />
    <rect x="7" y="17" width="4" height="3" fill="${hColor}" />
    <rect x="21" y="17" width="4" height="3" fill="${hColor}" />
  ` : ''}

  ${hair === 'curly_wild' ? `
    <rect x="8" y="5" width="16" height="5" fill="${hColor}" />
    <rect x="7" y="8" width="4" height="7" fill="${hColor}" />
    <rect x="21" y="8" width="4" height="7" fill="${hColor}" />
    <rect x="9" y="4" width="2" height="1" fill="${hColor}" />
    <rect x="14" y="4" width="2" height="1" fill="${hColor}" />
    <rect x="20" y="4" width="2" height="1" fill="${hColor}" />
  ` : ''}

  ${hair === 'white_long' ? `
    <rect x="8" y="4" width="16" height="5" fill="${hColor}" />
    <rect x="7" y="8" width="3" height="14" fill="${hColor}" />
    <rect x="22" y="8" width="3" height="14" fill="${hColor}" />
    <rect x="15" y="2" width="2" height="3" fill="${hColor}" />
    <!-- Headband / Scar -->
    <rect x="10" y="8" width="12" height="1" fill="#18181B" />
  ` : ''}

  ${hair === 'porkpie_hat' || config.hat === 'porkpie' ? `
    <rect x="5" y="8" width="22" height="2" fill="#18181B" />
    <rect x="9" y="3" width="14" height="5" fill="#18181B" />
    <rect x="9" y="7" width="14" height="1" fill="#374151" />
  ` : ''}

  ${hair === 'curly_blonde' ? `
    <rect x="9" y="5" width="14" height="5" fill="${hColor}" />
    <rect x="8" y="8" width="3" height="5" fill="${hColor}" />
    <rect x="21" y="8" width="3" height="5" fill="${hColor}" />
  ` : ''}

  ${hair === 'thick_mustache_hair' ? `
    <rect x="9" y="5" width="14" height="5" fill="${hColor}" />
    <rect x="8" y="8" width="3" height="5" fill="${hColor}" />
    <rect x="21" y="8" width="3" height="5" fill="${hColor}" />
  ` : ''}

  ${hair === 'short' ? `
    <rect x="10" y="7" width="12" height="3" fill="${hColor}" />
    <rect x="9" y="8" width="14" height="2" fill="${hColor}" />
    <rect x="9" y="9" width="2" height="3" fill="${hColor}" />
    <rect x="21" y="9" width="2" height="3" fill="${hColor}" />
  ` : ''}

  ${hair === 'orange_bob' ? `
    <rect x="9" y="6" width="14" height="5" fill="#EA580C" />
    <rect x="7" y="9" width="4" height="9" fill="#EA580C" />
    <rect x="21" y="9" width="4" height="9" fill="#EA580C" />
  ` : ''}

  ${hair === 'pigtails' ? `
    <rect x="10" y="7" width="12" height="3" fill="${hColor}" />
    <rect x="9" y="8" width="14" height="2" fill="${hColor}" />
    <rect x="6" y="9" width="3" height="12" fill="${hColor}" />
    <rect x="23" y="9" width="3" height="12" fill="${hColor}" />
  ` : ''}

  ${hair === 'bald' ? `
    <rect x="13" y="9" width="2" height="1" fill="#FFFFFF" opacity="0.4" />
  ` : ''}

  <!-- EYES & EYEBROWS (y=10..14) -->
  ${config.eyes === 'frowning_brows' ? `
    <!-- Slanted Angry Eyebrows (Dwight) -->
    <rect x="10" y="10" width="2" height="1" fill="#26160A" />
    <rect x="12" y="11" width="3" height="1" fill="#26160A" />
    <rect x="17" y="11" width="3" height="1" fill="#26160A" />
    <rect x="20" y="10" width="2" height="1" fill="#26160A" />

    <!-- Eye Sclera & Pupils -->
    <rect x="11" y="12" width="3" height="2" fill="#FFFFFF" />
    <rect x="18" y="12" width="3" height="2" fill="#FFFFFF" />
    <rect x="13" y="12" width="1" height="2" fill="${eColor}" />
    <rect x="18" y="12" width="1" height="2" fill="${eColor}" />
  ` : ''}

  ${config.eyes === 'wire_specs' ? `
    <!-- Slanted Eyebrows -->
    <rect x="10" y="10" width="2" height="1" fill="#26160A" />
    <rect x="12" y="11" width="3" height="1" fill="#26160A" />
    <rect x="17" y="11" width="3" height="1" fill="#26160A" />
    <rect x="20" y="10" width="2" height="1" fill="#26160A" />

    <!-- Eyes -->
    <rect x="11" y="12" width="3" height="2" fill="#FFFFFF" />
    <rect x="18" y="12" width="3" height="2" fill="#FFFFFF" />
    <rect x="13" y="12" width="1" height="2" fill="${eColor}" />
    <rect x="18" y="12" width="1" height="2" fill="${eColor}" />

    <!-- Silver/Grey Wire Specs Frames -->
    <rect x="10" y="11" width="5" height="4" fill="none" stroke="#717D8A" stroke-width="1" />
    <rect x="17" y="11" width="5" height="4" fill="none" stroke="#717D8A" stroke-width="1" />
    <rect x="14" y="12" width="3" height="1" fill="#717D8A" />
    <rect x="8" y="12" width="2" height="1" fill="#717D8A" />
    <rect x="22" y="12" width="2" height="1" fill="#717D8A" />
  ` : ''}

  ${config.eyes === 'thick_black' || config.eyes === 'glasses' ? `
    <!-- Thick Black Frames (Tina Belcher) -->
    <rect x="9" y="11" width="6" height="4" fill="#18181B" />
    <rect x="17" y="11" width="6" height="4" fill="#18181B" />
    <rect x="10" y="12" width="4" height="2" fill="#FFFFFF" />
    <rect x="18" y="12" width="4" height="2" fill="#FFFFFF" />
    <rect x="12" y="12" width="1" height="2" fill="${eColor}" />
    <rect x="19" y="12" width="1" height="2" fill="${eColor}" />
  ` : ''}

  ${config.eyes === 'dark_shades' || config.eyes === 'sunglasses' ? `
    <rect x="9" y="11" width="14" height="4" fill="#0B0F19" />
    <rect x="11" y="11" width="4" height="1" fill="#64748B" />
  ` : ''}

  ${config.eyes === 'tired_eyes' ? `
    <rect x="11" y="11" width="3" height="1" fill="#18181B" />
    <rect x="18" y="11" width="3" height="1" fill="#18181B" />
    <rect x="11" y="12" width="3" height="2" fill="#FFFFFF" />
    <rect x="18" y="12" width="3" height="2" fill="#FFFFFF" />
    <rect x="12" y="12" width="1" height="2" fill="${eColor}" />
    <rect x="19" y="12" width="1" height="2" fill="${eColor}" />
    <rect x="11" y="14" width="3" height="1" fill="#71717A" opacity="0.6" />
    <rect x="18" y="14" width="3" height="1" fill="#71717A" opacity="0.6" />
  ` : ''}

  ${config.eyes === 'chill' ? `
    <!-- Dexter Heavy Eyebrows -->
    <rect x="10" y="11" width="4" height="2" fill="#18181B" />
    <rect x="18" y="11" width="4" height="2" fill="#18181B" />
    <!-- Sclera & Pupil -->
    <rect x="11" y="13" width="3" height="2" fill="#FFFFFF" />
    <rect x="18" y="13" width="3" height="2" fill="#FFFFFF" />
    <rect x="12" y="13" width="1" height="2" fill="${eColor}" />
    <rect x="19" y="13" width="1" height="2" fill="${eColor}" />
  ` : ''}

  <!-- NOSE (y=14..15, x=15..16) -->
  <rect x="15" y="14" width="2" height="1" fill="${skinShadow}" />

  <!-- SCAR (Geralt scar through left eye) -->
  ${config.hair === 'white_long' || config.mouth === 'scar' ? `
    <rect x="12" y="9" width="1" height="6" fill="#DC2626" opacity="0.7" />
  ` : ''}

  <!-- MOUTH / FACIAL HAIR (y=16..20) -->
  ${config.mouth === 'goatee' ? `
    <rect x="13" y="16" width="6" height="4" fill="${hColor}" />
    <rect x="14" y="17" width="4" height="1" fill="#18181B" />
  ` : ''}

  ${config.mouth === 'thick_stache' || config.mouth === 'mustache' ? `
    <rect x="11" y="15" width="10" height="3" fill="${hColor}" />
    <rect x="14" y="17" width="4" height="1" fill="#18181B" />
  ` : ''}

  ${config.mouth === 'full_beard' || config.mouth === 'beard' ? `
    <rect x="10" y="16" width="12" height="5" fill="${hColor}" />
    <rect x="14" y="17" width="4" height="1" fill="#18181B" />
  ` : ''}

  ${config.mouth === 'frown' ? `
    <polygon points="13,18 16,17 19,18" stroke="#18181B" stroke-width="1" fill="none" />
  ` : ''}

  ${config.mouth === 'red_lips' ? `
    <rect x="14" y="17" width="4" height="2" fill="#DC2626" />
  ` : ''}

  ${config.mouth === 'smile' || config.mouth === 'smirk' ? `
    <rect x="13" y="17" width="6" height="1" fill="#18181B" />
  ` : ''}
</svg>`;
}

export function configToDataUrl(config: TaterAvatarConfig): string {
  const svg = renderTaterSVG(config, 200);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

interface TaterzAvatarBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string;
  onSaveAvatar: (newAvatarUrl: string) => void;
  isPro?: boolean;
  onOpenUpgradeModal?: () => void;
  theme?: 'dark' | 'light';
}

const renderDicebearPropOverlay = (propId: string) => {
  if (!propId || propId === 'none') return null;
  switch (propId) {
    case 'dundie':
      return (
        <svg viewBox="0 0 16 16" className="w-full h-full" shapeRendering="crispEdges">
          <rect x="10" y="12" width="5" height="3" fill="#78350F" />
          <rect x="11" y="8" width="3" height="4" fill="#F59E0B" />
          <circle cx="12.5" cy="6.5" r="1.5" fill="#F59E0B" />
        </svg>
      );
    case 'grogu':
      return (
        <svg viewBox="0 0 16 16" className="w-full h-full" shapeRendering="crispEdges">
          <rect x="8" y="10" width="7" height="5" rx="1" fill="#D1D5DB" />
          <rect x="10" y="8" width="4" height="3" fill="#15803D" />
          <rect x="7" y="8" width="3" height="1.5" fill="#15803D" />
          <rect x="14" y="8" width="3" height="1.5" fill="#15803D" />
          <rect x="11" y="8" width="1.5" height="1.5" fill="#000000" />
        </svg>
      );
    case 'lightsaber':
      return (
        <svg viewBox="0 0 16 16" className="w-full h-full" shapeRendering="crispEdges">
          <rect x="11" y="11" width="2" height="4" fill="#9CA3AF" />
          <rect x="11" y="3" width="2" height="8" fill="#0284C7" />
          <rect x="11" y="1" width="2" height="2" fill="#38BDF8" opacity="0.8" />
        </svg>
      );
    case 'dragon_egg':
      return (
        <svg viewBox="0 0 16 16" className="w-full h-full" shapeRendering="crispEdges">
          <ellipse cx="12" cy="12" rx="2.5" ry="3.5" fill="#7C2D12" />
          <rect x="10.5" y="10.5" width="3" height="3" fill="#F59E0B" opacity="0.7" />
        </svg>
      );
    case 'yellow_umbrella':
      return (
        <svg viewBox="0 0 16 16" className="w-full h-full" shapeRendering="crispEdges">
          <polygon points="8,8 15,8 11.5,4" fill="#FACC15" />
          <rect x="11" y="8" width="1.5" height="7" fill="#78350F" />
        </svg>
      );
    case 'chef_knife':
      return (
        <svg viewBox="0 0 16 16" className="w-full h-full" shapeRendering="crispEdges">
          <rect x="11" y="12" width="2" height="3" fill="#78350F" />
          <polygon points="11,5 14,5 11,12" fill="#E5E7EB" />
        </svg>
      );
    case 'green_ring':
      return (
        <svg viewBox="0 0 16 16" className="w-full h-full" shapeRendering="crispEdges">
          <circle cx="12" cy="12" r="3.5" fill="#22C55E" opacity="0.8" />
          <circle cx="12" cy="12" r="2" fill="#86EFAC" />
        </svg>
      );
    case 'gold_remote':
      return (
        <svg viewBox="0 0 16 16" className="w-full h-full" shapeRendering="crispEdges">
          <rect x="11" y="10" width="3" height="5" fill="#D97706" rx="0.5" />
          <rect x="12" y="11" width="1" height="1" fill="#FEF08A" />
        </svg>
      );
    case 'vip_badge':
      return (
        <svg viewBox="0 0 16 16" className="w-full h-full" shapeRendering="crispEdges">
          <circle cx="12" cy="11" r="2.5" fill="#F59E0B" />
          <polygon points="12,13.5 10.5,16 13.5,16" fill="#DC2626" />
        </svg>
      );
    default:
      return null;
  }
};

interface ColorPickerControlProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  allowDefault?: boolean;
  allowTransparent?: boolean;
  defaultHex?: string;
  presets?: { hex: string; name: string }[];
}

const ColorPickerControl: React.FC<ColorPickerControlProps> = ({
  label,
  value,
  onChange,
  allowDefault = true,
  allowTransparent = false,
  defaultHex = '#3b82f6',
  presets = []
}) => {
  const displayHex = useMemo(() => {
    if (!value || value === 'transparent' || value === 'default') {
      return defaultHex.startsWith('#') ? defaultHex : `#${defaultHex}`;
    }
    const clean = value.replace('#', '');
    if (/^[0-9A-Fa-f]{6}$/.test(clean)) {
      return `#${clean}`;
    }
    if (/^[0-9A-Fa-f]{3}$/.test(clean)) {
      return `#${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`;
    }
    return defaultHex.startsWith('#') ? defaultHex : `#${defaultHex}`;
  }, [value, defaultHex]);

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value.replace('#', '');
    onChange(hex);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim().replace('#', '');
    onChange(raw || (allowDefault ? 'default' : defaultHex.replace('#', '')));
  };

  return (
    <div className="space-y-2 p-2.5 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 transition">
      <div className="flex items-center justify-between gap-1.5">
        <label className="text-[11px] font-bold text-slate-200 uppercase tracking-wider block">
          {label}
        </label>
        <div className="flex items-center gap-1">
          {allowDefault && (
            <button
              type="button"
              onClick={() => onChange('default')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                value === 'default'
                  ? 'bg-amber-500 text-black shadow font-black'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400'
              }`}
            >
              Auto
            </button>
          )}
          {allowTransparent && (
            <button
              type="button"
              onClick={() => onChange('transparent')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                value === 'transparent'
                  ? 'bg-amber-500 text-black shadow font-black'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400'
              }`}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Color Wheel Swatch Trigger */}
        <div className="relative group shrink-0">
          <input
            type="color"
            value={displayHex}
            onChange={handlePickerChange}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
            title="Click to open color picker"
          />
          <div
            className="w-8 h-8 rounded-lg border-2 border-white/30 shadow-sm flex items-center justify-center transition group-hover:scale-105 group-hover:border-amber-400 cursor-pointer"
            style={{
              backgroundColor: value === 'transparent' ? '#000000' : displayHex,
              backgroundImage: value === 'transparent' ? 'repeating-conic-gradient(#333 0% 25%, #222 0% 50%) 50% / 8px 8px' : 'none'
            }}
          >
            <Pipette className="w-3.5 h-3.5 text-white drop-shadow group-hover:text-amber-300" />
          </div>
        </div>

        {/* Text Field for Hex Input */}
        <div className="relative flex-1">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-500">#</span>
          <input
            type="text"
            value={value === 'default' || value === 'transparent' ? '' : value.replace('#', '')}
            placeholder={value === 'default' ? 'Auto' : value === 'transparent' ? 'Clear' : 'Hex'}
            onChange={handleHexInputChange}
            className="w-full py-1.5 pl-6 pr-2 rounded-lg bg-black/60 border border-white/15 focus:border-amber-500 text-xs font-mono font-semibold text-amber-300 placeholder-slate-500 uppercase focus:outline-none transition"
          />
        </div>
      </div>

      {/* Preset Swatches */}
      {presets.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {presets.map((preset) => {
            const presetClean = preset.hex.replace('#', '');
            const isSelected = value.toLowerCase() === presetClean.toLowerCase();
            return (
              <button
                key={preset.hex}
                type="button"
                onClick={() => onChange(presetClean)}
                title={preset.name}
                className={`w-5 h-5 rounded-md border transition transform hover:scale-110 cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 ring-2 ring-amber-400/50 scale-110 z-10'
                    : 'border-white/20 hover:border-white/50 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: preset.hex.startsWith('#') ? preset.hex : `#${preset.hex}` }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export const TaterzAvatarBuilderModal: React.FC<TaterzAvatarBuilderModalProps> = ({
  isOpen,
  onClose,
  currentAvatarUrl,
  onSaveAvatar,
  isPro = false,
  onOpenUpgradeModal,
  theme = 'dark'
}) => {
  const [config, setConfig] = useState<TaterAvatarConfig>(DEFAULT_TATER_CONFIG);
  const [activeCategory, setActiveCategory] = useState<'colors' | 'body' | 'hair' | 'eyes' | 'mouth' | 'hat' | 'outfit' | 'item' | 'bg'>('body');
  const [showVipGateModal, setShowVipGateModal] = useState(false);

  // AI Character Generator State & Custom Preset Management
  const [characterQuery, setCharacterQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedInfo, setGeneratedInfo] = useState<{
    title: string;
    series: string;
    description: string;
  } | null>(null);
  const [customPresets, setCustomPresets] = useState<OptionItem[]>([]);

  // Mode Selection State: 'dicebear_10' vs 'taterz_studio'
  const [builderMode, setBuilderMode] = useState<'dicebear_10' | 'taterz_studio'>('dicebear_10');

  // Official DiceBear Pixel Art Playground State
  const [dicebearSeed, setDicebearSeed] = useState('z86uu5tt');
  const [dicebearFlip, setDicebearFlip] = useState(false);
  const [dicebearRotate, setDicebearRotate] = useState<number>(0);
  const [dicebearScale, setDicebearScale] = useState<number>(100);
  const [dicebearRadius, setDicebearRadius] = useState<number>(0);
  const [dicebearBgColor, setDicebearBgColor] = useState<string>('b6e3f4');
  const [dicebearSkinColor, setDicebearSkinColor] = useState<string>('default');
  const [dicebearHair, setDicebearHair] = useState<string>('all');
  const [dicebearHairColor, setDicebearHairColor] = useState<string>('default');
  const [dicebearGlasses, setDicebearGlasses] = useState<string>('none');
  const [dicebearGlassesColor, setDicebearGlassesColor] = useState<string>('default');
  const [dicebearMouth, setDicebearMouth] = useState<string>('all');
  const [dicebearEyes, setDicebearEyes] = useState<string>('all');
  const [dicebearEyesColor, setDicebearEyesColor] = useState<string>('default');
  const [dicebearClothing, setDicebearClothing] = useState<string>('all');
  const [dicebearClothingColor, setDicebearClothingColor] = useState<string>('default');
  const [dicebearHat, setDicebearHat] = useState<string>('none');
  const [dicebearHatColor, setDicebearHatColor] = useState<string>('default');
  const [dicebearBeard, setDicebearBeard] = useState<string>('none');
  const [dicebearAccessories, setDicebearAccessories] = useState<string>('none');
  const [dicebearProp, setDicebearProp] = useState<string>('none');
  const [dicebearBgOverlay, setDicebearBgOverlay] = useState<string>('none');
  const [dicebearCopied, setDicebearCopied] = useState(false);

  // Computed DiceBear API URL
  const dicebear10Url = useMemo(() => {
    const url = new URL('https://api.dicebear.com/9.x/pixel-art/svg');
    url.searchParams.set('seed', dicebearSeed.trim() || 'z86uu5tt');
    if (dicebearFlip) url.searchParams.set('flip', 'true');
    if (dicebearRotate !== 0) url.searchParams.set('rotate', dicebearRotate.toString());
    if (dicebearScale !== 100) url.searchParams.set('scale', dicebearScale.toString());
    if (dicebearRadius > 0) url.searchParams.set('radius', dicebearRadius.toString());
    if (dicebearBgColor && dicebearBgColor !== 'transparent') {
      url.searchParams.set('backgroundColor', dicebearBgColor.replace('#', ''));
    }
    if (dicebearSkinColor && dicebearSkinColor !== 'default') {
      url.searchParams.set('skinColor', dicebearSkinColor.replace('#', ''));
    }

    // Hair Style & Color
    if (dicebearHair === 'none') {
      url.searchParams.set('hairProbability', '0');
    } else if (dicebearHair && dicebearHair !== 'all') {
      url.searchParams.set('hairProbability', '100');
      url.searchParams.append('hair[]', dicebearHair);
    }
    if (dicebearHairColor && dicebearHairColor !== 'default') {
      url.searchParams.append('hairColor[]', dicebearHairColor.replace('#', ''));
    }

    // Eyewear / Glasses
    if (dicebearGlasses === 'none') {
      url.searchParams.set('glassesProbability', '0');
    } else {
      url.searchParams.set('glassesProbability', '100');
      url.searchParams.append('glasses[]', dicebearGlasses);
    }
    if (dicebearGlassesColor && dicebearGlassesColor !== 'default') {
      url.searchParams.append('glassesColor[]', dicebearGlassesColor.replace('#', ''));
    }

    // Mouth Expression
    if (dicebearMouth && dicebearMouth !== 'all') {
      url.searchParams.append('mouth[]', dicebearMouth);
    }

    // Eyes Style & Color
    if (dicebearEyes && dicebearEyes !== 'all') {
      url.searchParams.append('eyes[]', dicebearEyes);
    }
    if (dicebearEyesColor && dicebearEyesColor !== 'default') {
      url.searchParams.append('eyesColor[]', dicebearEyesColor.replace('#', ''));
    }

    // Clothing / Outfits
    if (dicebearClothing && dicebearClothing !== 'all') {
      url.searchParams.append('clothing[]', dicebearClothing);
    }
    if (dicebearClothingColor && dicebearClothingColor !== 'default') {
      url.searchParams.append('clothingColor[]', dicebearClothingColor.replace('#', ''));
    }

    // Hat / Headwear
    if (dicebearHat === 'none') {
      url.searchParams.set('hatProbability', '0');
    } else {
      url.searchParams.set('hatProbability', '100');
      url.searchParams.append('hat[]', dicebearHat);
    }
    if (dicebearHatColor && dicebearHatColor !== 'default') {
      url.searchParams.append('hatColor[]', dicebearHatColor.replace('#', ''));
    }

    // Beard / Facial Hair
    if (dicebearBeard === 'none') {
      url.searchParams.set('beardProbability', '0');
    } else {
      url.searchParams.set('beardProbability', '100');
      url.searchParams.append('beard[]', dicebearBeard);
    }

    // Accessories
    if (dicebearAccessories === 'none') {
      url.searchParams.set('accessoriesProbability', '0');
    } else {
      url.searchParams.set('accessoriesProbability', '100');
      url.searchParams.append('accessories[]', dicebearAccessories);
    }

    return url.toString();
  }, [
    dicebearSeed, dicebearFlip, dicebearRotate, dicebearScale, dicebearRadius,
    dicebearBgColor, dicebearSkinColor, dicebearHair, dicebearHairColor, dicebearGlasses,
    dicebearGlassesColor, dicebearMouth, dicebearEyes, dicebearEyesColor, dicebearClothing,
    dicebearClothingColor, dicebearHat, dicebearHatColor, dicebearBeard,
    dicebearAccessories
  ]);

  // Save / Edit / Rename / Delete Custom Characters State
  const [saveCharacterName, setSaveCharacterName] = useState('');
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingPresetName, setEditingPresetName] = useState('');
  const [saveFeedbackMsg, setSaveFeedbackMsg] = useState<string | null>(null);

  // Load custom presets from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('taterz_custom_user_presets');
      if (saved) {
        setCustomPresets(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load custom presets', e);
    }
  }, []);

  // Sync avatar generator initial state with currentAvatarUrl when modal opens
  useEffect(() => {
    if (!isOpen || !currentAvatarUrl) return;

    try {
      let searchParams: URLSearchParams | null = null;
      if (currentAvatarUrl.includes('?')) {
        const queryString = currentAvatarUrl.split('?')[1];
        searchParams = new URLSearchParams(queryString);
      }

      if (searchParams) {
        const seedParam = searchParams.get('seed');
        if (seedParam) {
          setDicebearSeed(seedParam);
        }

        if (searchParams.has('flip')) {
          setDicebearFlip(searchParams.get('flip') === 'true');
        }

        if (searchParams.has('rotate')) {
          setDicebearRotate(parseInt(searchParams.get('rotate') || '0', 10) || 0);
        }

        if (searchParams.has('scale')) {
          setDicebearScale(parseInt(searchParams.get('scale') || '100', 10) || 100);
        }

        if (searchParams.has('radius')) {
          setDicebearRadius(parseInt(searchParams.get('radius') || '0', 10) || 0);
        }

        const bg = searchParams.get('backgroundColor');
        if (bg) {
          setDicebearBgColor(bg);
        }

        const skin = searchParams.get('skinColor');
        if (skin) {
          setDicebearSkinColor(skin);
        }

        const hairProb = searchParams.get('hairProbability');
        const hair = searchParams.get('hair[]') || searchParams.get('hair');
        if (hairProb === '0') {
          setDicebearHair('none');
        } else if (hair) {
          setDicebearHair(hair);
        }

        const hairColor = searchParams.get('hairColor[]') || searchParams.get('hairColor');
        if (hairColor) {
          setDicebearHairColor(hairColor);
        }

        const glassesProb = searchParams.get('glassesProbability');
        const glasses = searchParams.get('glasses[]') || searchParams.get('glasses');
        if (glassesProb === '0') {
          setDicebearGlasses('none');
        } else if (glasses) {
          setDicebearGlasses(glasses);
        }

        const glassesColor = searchParams.get('glassesColor[]') || searchParams.get('glassesColor');
        if (glassesColor) {
          setDicebearGlassesColor(glassesColor);
        }

        const mouth = searchParams.get('mouth[]') || searchParams.get('mouth');
        if (mouth) {
          setDicebearMouth(mouth);
        }

        const eyes = searchParams.get('eyes[]') || searchParams.get('eyes');
        if (eyes) {
          setDicebearEyes(eyes);
        }

        const eyesColor = searchParams.get('eyesColor[]') || searchParams.get('eyesColor');
        if (eyesColor) {
          setDicebearEyesColor(eyesColor);
        }

        const clothing = searchParams.get('clothing[]') || searchParams.get('clothing');
        if (clothing) {
          setDicebearClothing(clothing);
        }

        const clothingColor = searchParams.get('clothingColor[]') || searchParams.get('clothingColor');
        if (clothingColor) {
          setDicebearClothingColor(clothingColor);
        }

        const hatProb = searchParams.get('hatProbability');
        const hat = searchParams.get('hat[]') || searchParams.get('hat');
        if (hatProb === '0') {
          setDicebearHat('none');
        } else if (hat) {
          setDicebearHat(hat);
        }

        const hatColor = searchParams.get('hatColor[]') || searchParams.get('hatColor');
        if (hatColor) {
          setDicebearHatColor(hatColor);
        }

        const beardProb = searchParams.get('beardProbability');
        const beard = searchParams.get('beard[]') || searchParams.get('beard');
        if (beardProb === '0') {
          setDicebearBeard('none');
        } else if (beard) {
          setDicebearBeard(beard);
        }

        const accProb = searchParams.get('accessoriesProbability');
        const acc = searchParams.get('accessories[]') || searchParams.get('accessories');
        if (accProb === '0') {
          setDicebearAccessories('none');
        } else if (acc) {
          setDicebearAccessories(acc);
        }
      } else {
        if (currentAvatarUrl && !currentAvatarUrl.startsWith('data:') && !currentAvatarUrl.startsWith('http')) {
          setDicebearSeed(currentAvatarUrl);
        }
      }
    } catch (err) {
      console.error('Error parsing currentAvatarUrl for avatar builder default:', err);
    }
  }, [isOpen, currentAvatarUrl]);

  const handleShuffleTater = () => {
    const seeds = [
      'z86uu5tt', 'Julio', 'CouchPotato', 'BingeWatcher', 'MovieGeek', 'Popcorn',
      'Cat', 'SuperFan', 'TaterTot', 'Dwight', 'Michael', 'Heisenberg', 'Carmy',
      'Spud', 'Tater', 'Spudnik', 'LazyPotato', 'ChillTater', 'StreamKing'
    ];
    const bgColors = [
      'b6e3f4', 'ffd5dc', 'c0aede', 'ffdfbf', 'd1d4f9', 
      '1e293b', '0f172a', '16a34a', '0284c7', '7c3aed', 
      'd97706', 'dc2626', '334155', '0d9488', 'e11d48', 
      '84cc16', 'f59e0b', '6366f1', 'ec4899', '14b8a6'
    ];
    const eyeColors = ['default', '18181b', '2563eb', '16a34a', '9333ea', 'd97706', 'dc2626', '0891b2', '78350f'];
    const nextSeed = seeds[Math.floor(Math.random() * seeds.length)] + '_' + Math.floor(Math.random() * 10000);
    const nextBg = bgColors[Math.floor(Math.random() * bgColors.length)];
    const nextEyeColor = eyeColors[Math.floor(Math.random() * eyeColors.length)];
    setDicebearSeed(nextSeed);
    setDicebearBgColor(nextBg);
    setDicebearEyesColor(nextEyeColor);
  };

  // Helper to sync custom presets array to storage
  const syncCustomPresetsStorage = (newPresets: OptionItem[]) => {
    setCustomPresets(newPresets);
    try {
      localStorage.setItem('taterz_custom_user_presets', JSON.stringify(newPresets));
    } catch (e) {
      console.error('Failed to save custom presets', e);
    }
  };

  // Handler to save current config as a new custom character
  const handleSaveCurrentAsPreset = () => {
    const nameToSave = saveCharacterName.trim() || `Custom Character #${customPresets.length + 1}`;
    const newId = `custom_user_${Date.now()}`;
    const newPreset: OptionItem = {
      id: newId,
      name: nameToSave,
      isVip: false,
      presetConfig: { ...config }
    };
    const updatedList = [newPreset, ...customPresets];
    syncCustomPresetsStorage(updatedList);
    setSaveCharacterName('');
    setSaveFeedbackMsg(`Saved "${nameToSave}" to your custom characters!`);
    setTimeout(() => setSaveFeedbackMsg(null), 3500);
  };

  // Handler to update an existing preset's config with the current design
  const handleUpdatePresetConfig = (presetId: string) => {
    const updatedList = customPresets.map(p => {
      if (p.id === presetId) {
        return { ...p, presetConfig: { ...config } };
      }
      return p;
    });
    syncCustomPresetsStorage(updatedList);
    const updatedItem = updatedList.find(p => p.id === presetId);
    setSaveFeedbackMsg(`Updated design for "${updatedItem?.name || 'character'}"!`);
    setTimeout(() => setSaveFeedbackMsg(null), 3500);
  };

  // Handler to rename a preset
  const handleRenamePreset = (presetId: string) => {
    if (!editingPresetName.trim()) return;
    const updatedList = customPresets.map(p => {
      if (p.id === presetId) {
        return { ...p, name: editingPresetName.trim() };
      }
      return p;
    });
    syncCustomPresetsStorage(updatedList);
    setEditingPresetId(null);
    setEditingPresetName('');
  };

  // Handler to delete a custom character
  const handleDeletePreset = (presetId: string) => {
    const updatedList = customPresets.filter(p => p.id !== presetId);
    syncCustomPresetsStorage(updatedList);
  };

  const handleGenerateCharacter = async (nameToGenerate?: string) => {
    const targetName = (nameToGenerate || characterQuery).trim();
    if (!targetName) return;

    setIsGenerating(true);
    setGeneratedInfo(null);

    try {
      const response = await fetch('/api/generate-pixel-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterName: targetName })
      });

      if (!response.ok) {
        throw new Error('Failed to generate character');
      }

      const data = await response.json();
      if (data && data.config) {
        setConfig(data.config);
        setGeneratedInfo({
          title: data.characterTitle || targetName,
          series: data.seriesName || 'TV Show Character',
          description: data.characterDescription || '8-bit pixel custom design'
        });

        const presetId = `custom_${targetName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
        const newPreset: OptionItem = {
          id: presetId,
          name: data.characterTitle || targetName,
          isVip: true,
          presetConfig: data.config
        };

        const updatedList = [newPreset, ...customPresets.filter(p => p.name.toLowerCase() !== (data.characterTitle || targetName).toLowerCase())];
        syncCustomPresetsStorage(updatedList);
      }
    } catch (err) {
      console.error('Error generating character:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const activeVipItems = useMemo(() => {
    const vipList: string[] = [];
    if (BODY_OPTIONS.find(b => b.id === config.body)?.isVip) vipList.push(`Skin (${BODY_OPTIONS.find(b => b.id === config.body)?.name})`);
    if (HAIR_COLOR_OPTIONS.find(hc => hc.id === config.hairColor)?.isVip) vipList.push(`Hair Color (${HAIR_COLOR_OPTIONS.find(hc => hc.id === config.hairColor)?.name})`);
    if (EYES_OPTIONS.find(e => e.id === config.eyes)?.isVip) vipList.push(`Eyes (${EYES_OPTIONS.find(e => e.id === config.eyes)?.name})`);
    if (MOUTH_OPTIONS.find(m => m.id === config.mouth)?.isVip) vipList.push(`Mouth (${MOUTH_OPTIONS.find(m => m.id === config.mouth)?.name})`);
    if (HAT_OPTIONS.find(h => h.id === config.hat)?.isVip) vipList.push(`Headwear (${HAT_OPTIONS.find(h => h.id === config.hat)?.name})`);
    if (OUTFIT_OPTIONS.find(o => o.id === config.outfit)?.isVip) vipList.push(`Outfit (${OUTFIT_OPTIONS.find(o => o.id === config.outfit)?.name})`);
    if (ITEM_OPTIONS.find(i => i.id === config.item)?.isVip) vipList.push(`Accessory (${ITEM_OPTIONS.find(i => i.id === config.item)?.name})`);
    if (BG_OPTIONS.find(bg => bg.id === config.bg)?.isVip) vipList.push(`Background (${BG_OPTIONS.find(bg => bg.id === config.bg)?.name})`);
    if (config.customOutfitColor) vipList.push(`VIP Custom Attire Color (${config.customOutfitColor})`);
    if (config.customHatColor) vipList.push(`VIP Custom Hat Color (${config.customHatColor})`);
    if (config.customHairColor) vipList.push(`VIP Custom Hair Color (${config.customHairColor})`);
    if (config.customSkinColor) vipList.push(`VIP Custom Skin Color (${config.customSkinColor})`);
    if (config.customBgColor) vipList.push(`VIP Custom Background Color (${config.customBgColor})`);
    return vipList;
  }, [config]);

  const hasVipItemsEquipped = activeVipItems.length > 0;

  // Saved Variations limit: VIP = 10, Free = 1
  const maxVariations = isPro ? 10 : 1;
  const [variationName, setVariationName] = useState('');
  const [savedVariations, setSavedVariations] = useState<{ id: string; name: string; url: string; createdAt: number }[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('couchtaterz_saved_avatar_variations');
      if (raw) {
        setSavedVariations(JSON.parse(raw));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  if (!isOpen) return null;

  const saveAvatarToVariations = (urlToSave: string, customName?: string) => {
    try {
      const raw = localStorage.getItem('couchtaterz_saved_avatar_variations');
      let currentList: { id: string; name: string; url: string; createdAt: number }[] = raw ? JSON.parse(raw) : [];

      const name = customName?.trim() || variationName.trim() || `Tater Look #${currentList.length + 1}`;
      const newVariation = {
        id: 'var_' + Date.now(),
        name,
        url: urlToSave,
        createdAt: Date.now()
      };

      if (!isPro) {
        // Free tier: strictly 1 variation slot
        currentList = [newVariation];
      } else {
        // VIP tier: up to 10 variation slots
        const existingIdx = currentList.findIndex(v => v.url === urlToSave);
        if (existingIdx >= 0) {
          currentList[existingIdx] = newVariation;
        } else if (currentList.length >= 10) {
          currentList = [...currentList.slice(1), newVariation];
        } else {
          currentList.push(newVariation);
        }
      }

      setSavedVariations(currentList);
      localStorage.setItem('couchtaterz_saved_avatar_variations', JSON.stringify(currentList));
      setVariationName('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteVariation = (idToDelete: string) => {
    const updated = savedVariations.filter(v => v.id !== idToDelete);
    setSavedVariations(updated);
    localStorage.setItem('couchtaterz_saved_avatar_variations', JSON.stringify(updated));
  };

  const currentDataUrl = configToDataUrl(config);

  const handleSave = () => {
    const finalUrl = builderMode === 'dicebear_10' ? dicebear10Url : currentDataUrl;
    if (builderMode !== 'dicebear_10' && hasVipItemsEquipped && !isPro) {
      setShowVipGateModal(true);
      return;
    }
    saveAvatarToVariations(finalUrl);
    onSaveAvatar(finalUrl);
    onClose();
  };

  const handleStripVipAndSave = () => {
    const strippedConfig: TaterAvatarConfig = {
      body: BODY_OPTIONS.find(b => b.id === config.body)?.isVip ? 'russet' : config.body,
      hair: config.hair,
      hairColor: HAIR_COLOR_OPTIONS.find(hc => hc.id === config.hairColor)?.isVip ? 'brown' : config.hairColor,
      eyes: EYES_OPTIONS.find(e => e.id === config.eyes)?.isVip ? 'chill' : config.eyes,
      mouth: MOUTH_OPTIONS.find(m => m.id === config.mouth)?.isVip ? 'smile' : config.mouth,
      hat: HAT_OPTIONS.find(h => h.id === config.hat)?.isVip ? 'none' : config.hat,
      outfit: OUTFIT_OPTIONS.find(o => o.id === config.outfit)?.isVip ? 'hoodie' : config.outfit,
      item: ITEM_OPTIONS.find(i => i.id === config.item)?.isVip ? 'remote' : config.item,
      bg: BG_OPTIONS.find(bg => bg.id === config.bg)?.isVip ? 'dark' : config.bg,
      customOutfitColor: undefined,
      customHatColor: undefined,
      customHairColor: undefined,
      customSkinColor: undefined,
      customBgColor: undefined,
    };
    const strippedUrl = configToDataUrl(strippedConfig);
    onSaveAvatar(strippedUrl);
    setShowVipGateModal(false);
    onClose();
  };

  const categories = [
    { id: 'colors', label: 'VIP Color Sliders 🎨', icon: Palette, isVip: true },
    { id: 'body', label: 'Skin Tone', icon: Palette },
    { id: 'hair', label: 'Hairstyle & Color', icon: Scissors },
    { id: 'eyes', label: 'Eyes & Glasses', icon: Eye },
    { id: 'mouth', label: 'Mouth & Beard', icon: Smile },
    { id: 'hat', label: 'Hats & TV Heads', icon: Crown },
    { id: 'outfit', label: 'Outfits & Clothes', icon: Shirt },
    { id: 'item', label: 'Handheld Props', icon: ShoppingBag },
    { id: 'bg', label: 'Background Grid', icon: Wand2 },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-4xl bg-[#0F1117] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#161822]/90 gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
                  TATERCREATOR
                </h2>
                {isPro && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <Crown className="w-3 h-3 text-amber-400" /> VIP UNLOCKED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Couchtaterz Pixel Art Avatar Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Preview Panel */}
          <div className="md:col-span-5 bg-gradient-to-b from-[#141722] to-[#0A0C10] p-5 sm:p-6 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-white/10 overflow-y-auto">
            {builderMode === 'dicebear_10' ? (
              /* DiceBear 10.x Mode Preview */
              <div className="w-full flex flex-col items-center space-y-4 my-auto">
                <div className="relative group">
                  <div 
                    className="relative p-2 rounded-3xl bg-[#0B0D13] border-2 border-amber-500/30 shadow-2xl transition-all"
                    style={{ borderRadius: `${dicebearRadius}px` }}
                  >
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden flex items-center justify-center bg-black/40 p-2">
                      {/* Background Atmosphere Overlay */}
                      {dicebearBgOverlay === 'vhs_static' && (
                        <div className="absolute inset-0 pointer-events-none z-10 opacity-30 bg-[linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.15)_1px,transparent_1px)] bg-[size:8px_8px] animate-pulse" />
                      )}
                      {dicebearBgOverlay === 'matrix' && (
                        <div className="absolute inset-0 pointer-events-none z-10 opacity-40 bg-[radial-gradient(#22c55e_1.5px,transparent_1px)] bg-[size:10px_10px]" />
                      )}
                      {dicebearBgOverlay === 'gold_glow' && (
                        <div className="absolute inset-0 pointer-events-none z-10 ring-2 ring-amber-400/80 ring-inset shadow-[inset_0_0_24px_rgba(245,158,11,0.4)]" />
                      )}

                      <img 
                        src={dicebear10Url} 
                        alt="Couchtaterz Pixel Art Avatar" 
                        className="w-full h-full object-contain relative z-0"
                        style={{
                          transform: `rotate(${dicebearRotate}deg) scale(${dicebearScale / 100}) ${dicebearFlip ? 'scaleX(-1)' : ''}`,
                          transition: 'transform 0.2s ease'
                        }}
                      />

                      {/* Handheld Props Overlay */}
                      {dicebearProp !== 'none' && (
                        <div className="absolute bottom-1 right-1 w-16 h-16 sm:w-20 sm:h-20 pointer-events-none z-20 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                          {renderDicebearPropOverlay(dicebearProp)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-1.5 max-w-xs">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center justify-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Couchtaterz Avatar Engine
                  </span>
                  <div className="bg-black/50 p-2 rounded-xl border border-white/10 space-y-1 text-left">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>Seed / Style:</span>
                      <span className="font-mono font-bold text-amber-300">{dicebearSeed}</span>
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 break-all truncate">
                      {dicebear10Url}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Couch Taterz Studio Mode Preview */
              <div className="w-full flex flex-col items-center space-y-4 my-auto">
                <div className="relative group">
                  <div className="relative p-2 rounded-3xl bg-[#0B0D13] border-2 border-amber-500/30 shadow-2xl">
                    <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden flex items-center justify-center bg-black/40">
                      <div 
                        className="w-full h-full"
                        dangerouslySetInnerHTML={{ __html: renderTaterSVG(config, 220) }}
                      />
                    </div>
                  </div>

                  {hasVipItemsEquipped && (
                    <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-[11px] uppercase tracking-wider shadow-lg border border-amber-300 flex items-center gap-1 animate-bounce">
                      <Crown className="w-3.5 h-3.5" /> VIP Equipped
                    </div>
                  )}
                </div>

                <div className="text-center space-y-1">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center justify-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> 8-Bit Pixel Grid Engine
                  </span>
                  <p className="text-xs text-slate-400">
                    {hasVipItemsEquipped 
                      ? `${activeVipItems.length} VIP Item${activeVipItems.length > 1 ? 's' : ''} Equipped`
                      : '100% Free Pixel Character Options'}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Actions & Variation Manager */}
            <div className="w-full space-y-3 pt-4 border-t border-white/10">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Variation Name (Optional)</span>
                  <span className="text-amber-400 font-mono">({savedVariations.length}/{maxVariations} Saved)</span>
                </label>
                <input
                  type="text"
                  value={variationName}
                  onChange={(e) => setVariationName(e.target.value)}
                  placeholder="e.g. Binge Mode Spud, Friday Chill"
                  className="w-full py-2 px-3 rounded-xl bg-black/60 border border-white/15 focus:border-amber-500 text-xs text-amber-300 placeholder-slate-500 focus:outline-none transition"
                />
              </div>

              {builderMode === 'dicebear_10' ? (
                <>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleShuffleTater}
                      className="flex-1 py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Shuffle Tater
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(dicebear10Url);
                        setDicebearCopied(true);
                        setTimeout(() => setDicebearCopied(false), 2500);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {dicebearCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{dicebearCopied ? 'Link Copied!' : 'Copy Avatar Link'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-extrabold text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" /> Save Tater Avatar
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfig(DEFAULT_TATER_CONFIG)}
                      className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset Default
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
                        setConfig({
                          body: randomItem(BODY_OPTIONS).id,
                          hair: randomItem(HAIR_OPTIONS).id,
                          hairColor: randomItem(HAIR_COLOR_OPTIONS).id,
                          eyes: randomItem(EYES_OPTIONS).id,
                          mouth: randomItem(MOUTH_OPTIONS).id,
                          hat: randomItem(HAT_OPTIONS).id,
                          outfit: randomItem(OUTFIT_OPTIONS).id,
                          item: randomItem(ITEM_OPTIONS).id,
                          bg: randomItem(BG_OPTIONS).id,
                        });
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Wand2 className="w-3.5 h-3.5" /> Randomize
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-extrabold text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" /> Save Pixel Art Avatar
                  </button>
                </>
              )}

              {/* Saved Variations Quick Grid */}
              {savedVariations.length > 0 && (
                <div className="pt-2 border-t border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span className="font-bold text-amber-400 uppercase tracking-wider">Saved Variations (Click to Equip)</span>
                    <span>{isPro ? 'VIP 10 Limit' : 'Free 1 Limit'}</span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin pt-1">
                    {savedVariations.map((varItem) => (
                      <div
                        key={varItem.id}
                        className="relative group shrink-0 p-1 rounded-xl bg-black/60 border border-white/10 hover:border-amber-400/80 hover:bg-amber-500/10 transition flex flex-col items-center cursor-pointer"
                        onClick={() => {
                          onSaveAvatar(varItem.url);
                          onClose();
                        }}
                        title={`Equip "${varItem.name}"`}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-black/40">
                          <img
                            src={varItem.url}
                            alt={varItem.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-[9px] font-bold text-slate-300 max-w-[54px] truncate text-center mt-0.5">
                          {varItem.name}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVariation(varItem.id);
                          }}
                          className="absolute -top-1 -right-1 p-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition shadow-md z-20 cursor-pointer"
                          title={`Delete "${varItem.name}"`}
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Editor Controls Panel */}
          <div className="md:col-span-7 flex flex-col bg-[#0F1117] overflow-hidden">
            {builderMode === 'dicebear_10' ? (
              /* Couchtaterz Studio Controls */
              <div className="flex-1 p-5 overflow-y-auto space-y-5 scrollbar-thin">
                {/* Shuffle Avatar Button Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#161824] to-[#12141F] border border-amber-500/30 flex items-center justify-between gap-4 shadow-lg">
                  <div>
                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Shuffle Tater</span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Click Shuffle Tater to instantly generate a unique new avatar and background color
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleShuffleTater}
                    className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition shadow flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>Shuffle Tater</span>
                  </button>
                </div>

                {/* Color Customizer Section */}
                <div className="p-4 rounded-2xl bg-[#141622] border border-white/10 space-y-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-amber-400" />
                    <span>2. Background & Skin Tone Color Pickers</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ColorPickerControl
                      label="Background Fill:"
                      value={dicebearBgColor}
                      onChange={setDicebearBgColor}
                      allowTransparent={true}
                      allowDefault={false}
                      defaultHex="#b6e3f4"
                      presets={[
                        { hex: '#b6e3f4', name: 'Pastel Blue' },
                        { hex: '#ffd5dc', name: 'Pastel Pink' },
                        { hex: '#c0aede', name: 'Lavender' },
                        { hex: '#ffdfbf', name: 'Peach' },
                        { hex: '#d1d4f9', name: 'Soft Iris' },
                        { hex: '#1e293b', name: 'Slate Dark' },
                        { hex: '#0f172a', name: 'Midnight' },
                        { hex: '#16a34a', name: 'Emerald' },
                      ]}
                    />

                    <ColorPickerControl
                      label="Skin Tone Color:"
                      value={dicebearSkinColor}
                      onChange={setDicebearSkinColor}
                      allowDefault={true}
                      defaultHex="#ffdbac"
                      presets={[
                        { hex: '#ffdbac', name: 'Porcelain' },
                        { hex: '#f1c27d', name: 'Peach' },
                        { hex: '#e0ac69', name: 'Fair Tan' },
                        { hex: '#8d5524', name: 'Bronze' },
                        { hex: '#523318', name: 'Chestnut' },
                        { hex: '#3b2310', name: 'Deep Tan' },
                      ]}
                    />
                  </div>
                </div>

                {/* Hair, Facial Features & Customization Section */}
                <div className="p-4 rounded-2xl bg-[#141622] border border-white/10 space-y-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>3. Hair, Eyewear, Facial Features & Outfits</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Hair Style */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Hair Style:</label>
                      <select
                        value={dicebearHair}
                        onChange={(e) => setDicebearHair(e.target.value)}
                        className="w-full py-2 px-3 rounded-xl bg-black/60 border border-white/15 focus:border-amber-500 text-xs font-semibold text-white focus:outline-none transition cursor-pointer"
                      >
                        <option value="all">All Styles (Seed-Based)</option>
                        <option value="none">None (Bald / No Hair)</option>
                        <optgroup label="Short Haircuts">
                          <option value="short01">Short Style 01</option>
                          <option value="short02">Short Style 02</option>
                          <option value="short03">Short Style 03</option>
                          <option value="short04">Short Style 04</option>
                          <option value="short05">Short Style 05</option>
                          <option value="short06">Short Style 06</option>
                          <option value="short07">Short Style 07</option>
                          <option value="short08">Short Style 08</option>
                          <option value="short09">Short Style 09</option>
                          <option value="short10">Short Style 10</option>
                          <option value="short11">Short Style 11</option>
                          <option value="short12">Short Style 12</option>
                          <option value="short13">Short Style 13</option>
                          <option value="short14">Short Style 14</option>
                          <option value="short15">Short Style 15</option>
                          <option value="short16">Short Style 16</option>
                          <option value="short17">Short Style 17</option>
                          <option value="short18">Short Style 18</option>
                          <option value="short19">Short Style 19</option>
                          <option value="short20">Short Style 20</option>
                          <option value="short21">Short Style 21</option>
                          <option value="short22">Short Style 22</option>
                          <option value="short23">Short Style 23</option>
                          <option value="short24">Short Style 24</option>
                        </optgroup>
                        <optgroup label="Long Haircuts">
                          <option value="long01">Long Style 01</option>
                          <option value="long02">Long Style 02</option>
                          <option value="long03">Long Style 03</option>
                          <option value="long04">Long Style 04</option>
                          <option value="long05">Long Style 05</option>
                          <option value="long06">Long Style 06</option>
                          <option value="long07">Long Style 07</option>
                          <option value="long08">Long Style 08</option>
                          <option value="long09">Long Style 09</option>
                          <option value="long10">Long Style 10</option>
                          <option value="long11">Long Style 11</option>
                          <option value="long12">Long Style 12</option>
                          <option value="long13">Long Style 13</option>
                          <option value="long14">Long Style 14</option>
                          <option value="long15">Long Style 15</option>
                          <option value="long16">Long Style 16</option>
                          <option value="long17">Long Style 17</option>
                          <option value="long18">Long Style 18</option>
                          <option value="long19">Long Style 19</option>
                          <option value="long20">Long Style 20</option>
                          <option value="long21">Long Style 21</option>
                        </optgroup>
                      </select>
                    </div>

                    {/* Hair Color */}
                    <ColorPickerControl
                      label="Hair Color:"
                      value={dicebearHairColor}
                      onChange={setDicebearHairColor}
                      allowDefault={true}
                      defaultHex="#28150a"
                      presets={[
                        { hex: '#cab188', name: 'Blonde' },
                        { hex: '#603a14', name: 'Dark Brown' },
                        { hex: '#83623b', name: 'Medium Brown' },
                        { hex: '#611c17', name: 'Auburn' },
                        { hex: '#28150a', name: 'Black' },
                        { hex: '#009bbd', name: 'Teal Blue' },
                        { hex: '#bd1700', name: 'Crimson' },
                        { hex: '#ec4899', name: 'Hot Pink' },
                      ]}
                    />

                    {/* Glasses / Eyewear */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Glasses / Eyewear:</label>
                      <select
                        value={dicebearGlasses}
                        onChange={(e) => setDicebearGlasses(e.target.value)}
                        className="w-full py-2 px-3 rounded-xl bg-black/60 border border-white/15 focus:border-amber-500 text-xs font-semibold text-white focus:outline-none transition cursor-pointer"
                      >
                        <option value="none">None (No Eyewear)</option>
                        <option value="dark01">Dark Frames 01</option>
                        <option value="dark02">Dark Frames 02</option>
                        <option value="dark03">Dark Frames 03</option>
                        <option value="dark04">Dark Frames 04</option>
                        <option value="dark05">Dark Frames 05</option>
                        <option value="dark06">Dark Frames 06</option>
                        <option value="dark07">Dark Frames 07</option>
                        <option value="light01">Light Specs 01</option>
                        <option value="light02">Light Specs 02</option>
                        <option value="light03">Light Specs 03</option>
                        <option value="light04">Light Specs 04</option>
                        <option value="light05">Light Specs 05</option>
                        <option value="light06">Light Specs 06</option>
                        <option value="light07">Light Specs 07</option>
                      </select>
                    </div>

                    {/* Glasses Color */}
                    <ColorPickerControl
                      label="Glasses Frame Color:"
                      value={dicebearGlassesColor}
                      onChange={setDicebearGlassesColor}
                      allowDefault={true}
                      defaultHex="#191919"
                      presets={[
                        { hex: '#191919', name: 'Jet Black' },
                        { hex: '#323232', name: 'Dark Grey' },
                        { hex: '#43677d', name: 'Steel Blue' },
                        { hex: '#5f705c', name: 'Sage Green' },
                        { hex: '#a04b5d', name: 'Crimson Rose' },
                        { hex: '#d97706', name: 'Amber Gold' },
                      ]}
                    />

                    {/* Mouth Expression */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Mouth Expression:</label>
                      <select
                        value={dicebearMouth}
                        onChange={(e) => setDicebearMouth(e.target.value)}
                        className="w-full py-2 px-3 rounded-xl bg-black/60 border border-white/15 focus:border-amber-500 text-xs font-semibold text-white focus:outline-none transition cursor-pointer"
                      >
                        <option value="all">All Expressions (Seed-Based)</option>
                        <option value="happy01">Happy 01 (Classic Smile)</option>
                        <option value="happy02">Happy 02 (Grin)</option>
                        <option value="happy03">Happy 03 (Beam)</option>
                        <option value="happy04">Happy 04 (Smirk)</option>
                        <option value="happy05">Happy 05 (Chuckle)</option>
                        <option value="happy06">Happy 06 (Teeth)</option>
                        <option value="happy07">Happy 07 (Wide Smile)</option>
                        <option value="happy08">Happy 08 (Tongue Out)</option>
                        <option value="happy09">Happy 09 (Cheery)</option>
                        <option value="happy10">Happy 10 (Playful)</option>
                        <option value="happy11">Happy 11 (Joyful)</option>
                        <option value="happy12">Happy 12 (Laughing)</option>
                        <option value="happy13">Happy 13 (Big Grin)</option>
                        <option value="sad01">Sad 01 (Neutral)</option>
                        <option value="sad02">Sad 02 (Frown)</option>
                        <option value="sad03">Sad 03 (Sigh)</option>
                        <option value="sad04">Sad 04 (Pout)</option>
                        <option value="sad05">Sad 05 (Disappointed)</option>
                        <option value="sad06">Sad 06 (Flat)</option>
                        <option value="sad07">Sad 07 (Surprised)</option>
                        <option value="sad08">Sad 08 (Gasp)</option>
                        <option value="sad09">Sad 09 (Worry)</option>
                        <option value="sad10">Sad 10 (Shocked)</option>
                      </select>
                    </div>

                    {/* Eyes Style */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Eyes Style:</label>
                      <select
                        value={dicebearEyes}
                        onChange={(e) => setDicebearEyes(e.target.value)}
                        className="w-full py-2 px-3 rounded-xl bg-black/60 border border-white/15 focus:border-amber-500 text-xs font-semibold text-white focus:outline-none transition cursor-pointer"
                      >
                        <option value="all">All Eye Types (Seed-Based)</option>
                        <option value="variant01">Eye Style 01</option>
                        <option value="variant02">Eye Style 02</option>
                        <option value="variant03">Eye Style 03</option>
                        <option value="variant04">Eye Style 04</option>
                        <option value="variant05">Eye Style 05</option>
                        <option value="variant06">Eye Style 06</option>
                        <option value="variant07">Eye Style 07</option>
                        <option value="variant08">Eye Style 08</option>
                        <option value="variant09">Eye Style 09</option>
                        <option value="variant10">Eye Style 10</option>
                        <option value="variant11">Eye Style 11</option>
                        <option value="variant12">Eye Style 12</option>
                      </select>
                    </div>

                    {/* Eye Iris Color */}
                    <ColorPickerControl
                      label="Eye Iris Color:"
                      value={dicebearEyesColor}
                      onChange={setDicebearEyesColor}
                      allowDefault={true}
                      defaultHex="#18181b"
                      presets={[
                        { hex: '#18181b', name: 'Dark Onyx' },
                        { hex: '#2563eb', name: 'Sapphire Blue' },
                        { hex: '#16a34a', name: 'Emerald Green' },
                        { hex: '#9333ea', name: 'Amethyst Purple' },
                        { hex: '#d97706', name: 'Amber Hazel' },
                        { hex: '#dc2626', name: 'Ruby Red' },
                        { hex: '#0891b2', name: 'Cyan Blue' },
                        { hex: '#78350f', name: 'Warm Brown' },
                        { hex: '#ea580c', name: 'Flame Orange' },
                        { hex: '#db2777', name: 'Neon Pink' },
                      ]}
                    />

                    {/* Clothing / Outfits */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Clothing Attire:</label>
                      <select
                        value={dicebearClothing}
                        onChange={(e) => setDicebearClothing(e.target.value)}
                        className="w-full py-2 px-3 rounded-xl bg-black/60 border border-white/15 focus:border-amber-500 text-xs font-semibold text-white focus:outline-none transition cursor-pointer"
                      >
                        <option value="all">All Outfits (Seed-Based)</option>
                        <option value="variant01">Outfit 01 (Classic Tee)</option>
                        <option value="variant02">Outfit 02 (Sweater)</option>
                        <option value="variant03">Outfit 03 (Jacket)</option>
                        <option value="variant04">Outfit 04 (Hoodie)</option>
                        <option value="variant05">Outfit 05 (Button Shirt)</option>
                        <option value="variant06">Outfit 06 (Coat)</option>
                        <option value="variant07">Outfit 07 (Vest)</option>
                        <option value="variant08">Outfit 08 (Tracksuit)</option>
                        <option value="variant09">Outfit 09 (Polo)</option>
                        <option value="variant10">Outfit 10 (Suit)</option>
                        <option value="variant11">Outfit 11 (Striped Tee)</option>
                        <option value="variant12">Outfit 12 (Tank Top)</option>
                        <option value="variant13">Outfit 13</option>
                        <option value="variant14">Outfit 14</option>
                        <option value="variant15">Outfit 15</option>
                        <option value="variant16">Outfit 16</option>
                        <option value="variant17">Outfit 17</option>
                        <option value="variant18">Outfit 18</option>
                        <option value="variant19">Outfit 19</option>
                        <option value="variant20">Outfit 20</option>
                        <option value="variant21">Outfit 21</option>
                        <option value="variant22">Outfit 22</option>
                        <option value="variant23">Outfit 23</option>
                      </select>
                    </div>

                    {/* Clothing Color */}
                    <ColorPickerControl
                      label="Clothing Color:"
                      value={dicebearClothingColor}
                      onChange={setDicebearClothingColor}
                      allowDefault={true}
                      defaultHex="#5bc0de"
                      presets={[
                        { hex: '#5bc0de', name: 'Cyan Blue' },
                        { hex: '#428bca', name: 'Cobalt' },
                        { hex: '#03396c', name: 'Navy' },
                        { hex: '#44c585', name: 'Emerald' },
                        { hex: '#d11141', name: 'Ruby' },
                        { hex: '#ffeead', name: 'Cream' },
                        { hex: '#ffd969', name: 'Gold' },
                      ]}
                    />

                    {/* Hat / Headwear */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Hat / Headwear:</label>
                      <select
                        value={dicebearHat}
                        onChange={(e) => setDicebearHat(e.target.value)}
                        className="w-full py-2 px-3 rounded-xl bg-black/60 border border-white/15 focus:border-amber-500 text-xs font-semibold text-white focus:outline-none transition cursor-pointer"
                      >
                        <option value="none">None (No Hat)</option>
                        <option value="variant01">Hat Style 01 (Beanie/Cap)</option>
                        <option value="variant02">Hat Style 02</option>
                        <option value="variant03">Hat Style 03</option>
                        <option value="variant04">Hat Style 04</option>
                        <option value="variant05">Hat Style 05</option>
                        <option value="variant06">Hat Style 06</option>
                        <option value="variant07">Hat Style 07</option>
                        <option value="variant08">Hat Style 08</option>
                        <option value="variant09">Hat Style 09</option>
                        <option value="variant10">Hat Style 10</option>
                      </select>
                    </div>

                    {/* Hat Color */}
                    <ColorPickerControl
                      label="Hat Color:"
                      value={dicebearHatColor}
                      onChange={setDicebearHatColor}
                      allowDefault={true}
                      defaultHex="#e11d48"
                      presets={[
                        { hex: '#e11d48', name: 'Rose Red' },
                        { hex: '#2563eb', name: 'Royal Blue' },
                        { hex: '#059669', name: 'Emerald' },
                        { hex: '#d97706', name: 'Amber Gold' },
                        { hex: '#475569', name: 'Slate Grey' },
                        { hex: '#111827', name: 'Jet Black' },
                      ]}
                    />

                    {/* Beard / Facial Hair */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Beard / Facial Hair:</label>
                      <select
                        value={dicebearBeard}
                        onChange={(e) => setDicebearBeard(e.target.value)}
                        className="w-full py-2 px-3 rounded-xl bg-black/60 border border-white/15 focus:border-amber-500 text-xs font-semibold text-white focus:outline-none transition cursor-pointer"
                      >
                        <option value="none">None (Clean Shaven)</option>
                        <option value="variant01">Beard 01 (Stubble)</option>
                        <option value="variant02">Beard 02 (Full Beard)</option>
                        <option value="variant03">Beard 03 (Goatee)</option>
                        <option value="variant04">Beard 04 (Mustache)</option>
                        <option value="variant05">Beard 05 (Handlebar)</option>
                        <option value="variant06">Beard 06</option>
                        <option value="variant07">Beard 07</option>
                        <option value="variant08">Beard 08</option>
                      </select>
                    </div>

                    {/* Accessories */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Accessories:</label>
                      <select
                        value={dicebearAccessories}
                        onChange={(e) => setDicebearAccessories(e.target.value)}
                        className="w-full py-2 px-3 rounded-xl bg-black/60 border border-white/15 focus:border-amber-500 text-xs font-semibold text-white focus:outline-none transition cursor-pointer"
                      >
                        <option value="none">None (No Accessory)</option>
                        <option value="variant01">Accessory 01</option>
                        <option value="variant02">Accessory 02</option>
                        <option value="variant03">Accessory 03</option>
                        <option value="variant04">Accessory 04</option>
                      </select>
                    </div>

                    {/* VIP Handheld Show Props */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-400" /> Handheld Show Prop:
                      </label>
                      <select
                        value={dicebearProp}
                        onChange={(e) => setDicebearProp(e.target.value)}
                        className="w-full py-2 px-3 rounded-xl bg-amber-950/40 border border-amber-500/30 focus:border-amber-400 text-xs font-bold text-amber-200 focus:outline-none transition cursor-pointer"
                      >
                        <option value="none">None (No Prop)</option>
                        <option value="dundie">Dundie Trophy 🏆 (The Office)</option>
                        <option value="grogu">Grogu Pod 🍼 (The Mandalorian)</option>
                        <option value="lightsaber">Lightsaber ⚔️ (Star Wars)</option>
                        <option value="dragon_egg">Dragon Egg 🥚 (House of Dragon)</option>
                        <option value="yellow_umbrella">Yellow Umbrella ☂️ (HIMYM)</option>
                        <option value="chef_knife">Chef Knife 🔪 (The Bear)</option>
                        <option value="green_ring">Power Ring 🟢 (Lanterns)</option>
                        <option value="gold_remote">Golden Remote 🌟</option>
                        <option value="vip_badge">VIP Badge 🏅</option>
                      </select>
                    </div>

                    {/* VIP Background Overlay Effect */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" /> Background Atmosphere Effect:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'none', label: 'Off (Clean)' },
                          { id: 'vhs_static', label: 'VHS Static 📺' },
                          { id: 'matrix', label: 'Matrix Code 🟢' },
                          { id: 'gold_glow', label: 'Gold VIP Glow 🌟' },
                        ].map((fx) => (
                          <button
                            key={fx.id}
                            type="button"
                            onClick={() => setDicebearBgOverlay(fx.id)}
                            className={`py-1.5 px-2 rounded-xl border text-[11px] font-bold transition cursor-pointer text-center ${
                              dicebearBgOverlay === fx.id
                                ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-extrabold ring-1 ring-amber-400/50'
                                : 'border-white/10 bg-black/40 text-slate-300 hover:text-white'
                            }`}
                          >
                            {fx.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transform & Layout Tuning Section */}
                <div className="p-4 rounded-2xl bg-[#141622] border border-white/10 space-y-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>4. Rotation, Flip & Canvas Scale</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Rotation */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Rotation Angle:</span>
                      <div className="flex items-center gap-1">
                        {[0, 90, 180, 270].map((deg) => (
                          <button
                            key={deg}
                            type="button"
                            onClick={() => setDicebearRotate(deg)}
                            className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                              dicebearRotate === deg
                                ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                                : 'border-white/10 bg-black/40 text-slate-400 hover:text-white'
                            }`}
                          >
                            {deg}°
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Flip */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Horizontal Mirror:</span>
                      <button
                        type="button"
                        onClick={() => setDicebearFlip(!dicebearFlip)}
                        className={`w-full py-1.5 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                          dicebearFlip
                            ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                            : 'border-white/10 bg-black/40 text-slate-400 hover:text-white'
                        }`}
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${dicebearFlip ? 'rotate-180' : ''}`} />
                        <span>{dicebearFlip ? 'Flipped (Horizontally)' : 'Normal Orientation'}</span>
                      </button>
                    </div>

                    {/* Scale */}
                    <div className="space-y-1 sm:col-span-2">
                      <div className="flex justify-between items-center text-[11px] font-bold text-slate-300">
                        <span>Avatar Zoom Scale:</span>
                        <span className="font-mono text-amber-400">{dicebearScale}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={dicebearScale}
                        onChange={(e) => setDicebearScale(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Direct Link Info Box */}
                <div className="p-3.5 rounded-xl bg-black/60 border border-amber-500/20 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5 truncate">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">Live SVG Endpoint</span>
                    <p className="font-mono text-slate-300 text-[11px] truncate">{dicebear10Url}</p>
                  </div>

                  <a
                    href={dicebear10Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition shrink-0"
                    title="Open SVG in new browser tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ) : (
              /* Couch Taterz Studio Controls */
              <>
                {/* Category Navigation Bar */}
                <div className="p-3 border-b border-white/10 bg-[#141620] overflow-x-auto scrollbar-thin">
                  <div className="flex items-center gap-1.5 min-w-max">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      const isActive = activeCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.id as any)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            isActive
                              ? 'bg-amber-500 text-black shadow-md font-black'
                              : 'bg-white/5 hover:bg-white/10 text-slate-300'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Options Selector Grid */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {/* CATEGORY: VIP COLOR CUSTOMIZER SLIDERS */}
              {activeCategory === 'colors' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-purple-500/10 border border-amber-500/30 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-400" /> VIP Custom Color Sliders
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Fine-tune custom color hues & hex values for skin tone, attire, hats, facial hair, and background!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfig({
                        ...config,
                        customOutfitColor: undefined,
                        customHatColor: undefined,
                        customHairColor: undefined,
                        customSkinColor: undefined,
                        customBgColor: undefined,
                      })}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset All
                    </button>
                  </div>

                  {/* SKIN TONE CUSTOM COLOR SLIDER */}
                  <div className="p-4 rounded-2xl bg-[#161822] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Skin Tone Complexion Color</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.customSkinColor || '#E5C09B'}
                          onChange={(e) => setConfig({ ...config, customSkinColor: e.target.value })}
                          className="w-7 h-7 rounded-lg border-0 bg-transparent cursor-pointer p-0"
                          title="Choose custom skin tone color"
                        />
                        <span className="text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {config.customSkinColor || 'Default'}
                        </span>
                        {config.customSkinColor && (
                          <button
                            type="button"
                            onClick={() => setConfig({ ...config, customSkinColor: undefined })}
                            className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                        <span>Hue Spectrum Slider</span>
                        <span>{hexToHue(config.customSkinColor || '#E5C09B')}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={hexToHue(config.customSkinColor || '#E5C09B')}
                        onChange={(e) => setConfig({ ...config, customSkinColor: hueToHex(parseInt(e.target.value, 10)) })}
                        className="w-full h-2 rounded-lg cursor-pointer accent-amber-500 bg-gradient-to-r from-red-500 via-green-500 via-blue-500 to-red-500"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-bold text-slate-400 mr-1">Presets:</span>
                      {['#F2D2B6', '#E5C09B', '#D29C6B', '#925C37', '#633B20', '#3D2211', '#5B6E4A', '#7C5295'].map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => setConfig({ ...config, customSkinColor: hex })}
                          className="w-6 h-6 rounded-full border border-white/20 transition hover:scale-110 cursor-pointer shadow"
                          style={{ backgroundColor: hex }}
                          title={`Set skin tone to ${hex}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* ATTIRE / OUTFIT COLOR SLIDER */}
                  <div className="p-4 rounded-2xl bg-[#161822] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shirt className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Attire & Outfit Color</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.customOutfitColor || '#2563eb'}
                          onChange={(e) => setConfig({ ...config, customOutfitColor: e.target.value })}
                          className="w-7 h-7 rounded-lg border-0 bg-transparent cursor-pointer p-0"
                          title="Choose custom attire color"
                        />
                        <span className="text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {config.customOutfitColor || 'Default'}
                        </span>
                        {config.customOutfitColor && (
                          <button
                            type="button"
                            onClick={() => setConfig({ ...config, customOutfitColor: undefined })}
                            className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                        <span>Hue Spectrum Slider</span>
                        <span>{hexToHue(config.customOutfitColor || '#2563eb')}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={hexToHue(config.customOutfitColor || '#2563eb')}
                        onChange={(e) => setConfig({ ...config, customOutfitColor: hueToHex(parseInt(e.target.value, 10)) })}
                        className="w-full h-2 rounded-lg cursor-pointer accent-amber-500 bg-gradient-to-r from-red-500 via-green-500 via-blue-500 to-red-500"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-bold text-slate-400 mr-1">Presets:</span>
                      {['#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#18181B', '#FFFFFF'].map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => setConfig({ ...config, customOutfitColor: hex })}
                          className="w-6 h-6 rounded-full border border-white/20 transition hover:scale-110 cursor-pointer shadow"
                          style={{ backgroundColor: hex }}
                          title={`Set attire color to ${hex}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* HAT & HEADWEAR COLOR SLIDER */}
                  <div className="p-4 rounded-2xl bg-[#161822] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Hat & Headwear Color</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.customHatColor || '#dc2626'}
                          onChange={(e) => setConfig({ ...config, customHatColor: e.target.value })}
                          className="w-7 h-7 rounded-lg border-0 bg-transparent cursor-pointer p-0"
                          title="Choose custom hat color"
                        />
                        <span className="text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {config.customHatColor || 'Default'}
                        </span>
                        {config.customHatColor && (
                          <button
                            type="button"
                            onClick={() => setConfig({ ...config, customHatColor: undefined })}
                            className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                        <span>Hue Spectrum Slider</span>
                        <span>{hexToHue(config.customHatColor || '#dc2626')}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={hexToHue(config.customHatColor || '#dc2626')}
                        onChange={(e) => setConfig({ ...config, customHatColor: hueToHex(parseInt(e.target.value, 10)) })}
                        className="w-full h-2 rounded-lg cursor-pointer accent-amber-500 bg-gradient-to-r from-red-500 via-green-500 via-blue-500 to-red-500"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-bold text-slate-400 mr-1">Presets:</span>
                      {['#DC2626', '#2563EB', '#16A34A', '#F59E0B', '#7C3AED', '#DB2777', '#18181B', '#FFFFFF', '#06B6D4'].map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => setConfig({ ...config, customHatColor: hex })}
                          className="w-6 h-6 rounded-full border border-white/20 transition hover:scale-110 cursor-pointer shadow"
                          style={{ backgroundColor: hex }}
                          title={`Set hat color to ${hex}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* HAIR, MUSTACHE & BEARD COLOR SLIDER */}
                  <div className="p-4 rounded-2xl bg-[#161822] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Scissors className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Hair, Mustache & Beard Color</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.customHairColor || '#78350f'}
                          onChange={(e) => setConfig({ ...config, customHairColor: e.target.value })}
                          className="w-7 h-7 rounded-lg border-0 bg-transparent cursor-pointer p-0"
                          title="Choose custom hair/facial hair color"
                        />
                        <span className="text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {config.customHairColor || 'Default'}
                        </span>
                        {config.customHairColor && (
                          <button
                            type="button"
                            onClick={() => setConfig({ ...config, customHairColor: undefined })}
                            className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                        <span>Hue Spectrum Slider</span>
                        <span>{hexToHue(config.customHairColor || '#78350f')}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={hexToHue(config.customHairColor || '#78350f')}
                        onChange={(e) => setConfig({ ...config, customHairColor: hueToHex(parseInt(e.target.value, 10)) })}
                        className="w-full h-2 rounded-lg cursor-pointer accent-amber-500 bg-gradient-to-r from-red-500 via-green-500 via-blue-500 to-red-500"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-bold text-slate-400 mr-1">Presets:</span>
                      {['#78350F', '#18181B', '#F59E0B', '#DC2626', '#94A3B8', '#06B6D4', '#EC4899', '#84CC16', '#F43F5E'].map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => setConfig({ ...config, customHairColor: hex })}
                          className="w-6 h-6 rounded-full border border-white/20 transition hover:scale-110 cursor-pointer shadow"
                          style={{ backgroundColor: hex }}
                          title={`Set hair/mustache color to ${hex}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* EYE IRIS COLOR SLIDER */}
                  <div className="p-4 rounded-2xl bg-[#161822] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Eye Iris Color</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.customEyeColor || '#18181B'}
                          onChange={(e) => setConfig({ ...config, customEyeColor: e.target.value })}
                          className="w-7 h-7 rounded-lg border-0 bg-transparent cursor-pointer p-0"
                          title="Choose custom eye color"
                        />
                        <span className="text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {config.customEyeColor || 'Default'}
                        </span>
                        {config.customEyeColor && (
                          <button
                            type="button"
                            onClick={() => setConfig({ ...config, customEyeColor: undefined })}
                            className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-bold text-slate-400 mr-1">Presets:</span>
                      {[
                        { hex: '#18181B', name: 'Dark Onyx' },
                        { hex: '#2563EB', name: 'Sapphire Blue' },
                        { hex: '#16A34A', name: 'Emerald Green' },
                        { hex: '#9333EA', name: 'Amethyst Purple' },
                        { hex: '#D97706', name: 'Amber Hazel' },
                        { hex: '#DC2626', name: 'Ruby Red' },
                        { hex: '#0891B2', name: 'Cyan Blue' },
                        { hex: '#78350F', name: 'Warm Brown' },
                        { hex: '#EA580C', name: 'Flame Orange' },
                        { hex: '#DB2777', name: 'Neon Pink' }
                      ].map((item) => (
                        <button
                          key={item.hex}
                          type="button"
                          onClick={() => setConfig({ ...config, customEyeColor: item.hex })}
                          className={`w-6 h-6 rounded-full border transition hover:scale-110 cursor-pointer shadow ${
                            (config.customEyeColor || '#18181B').toLowerCase() === item.hex.toLowerCase()
                              ? 'border-amber-400 ring-2 ring-amber-400/50 scale-110'
                              : 'border-white/20'
                          }`}
                          style={{ backgroundColor: item.hex }}
                          title={`Set eye color to ${item.name}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* BACKGROUND COLOR SLIDER */}
                  <div className="p-4 rounded-2xl bg-[#161822] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wand2 className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Background Grid Color</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.customBgColor || '#1E293B'}
                          onChange={(e) => setConfig({ ...config, customBgColor: e.target.value })}
                          className="w-7 h-7 rounded-lg border-0 bg-transparent cursor-pointer p-0"
                          title="Choose custom background color"
                        />
                        <span className="text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {config.customBgColor || 'Default'}
                        </span>
                        {config.customBgColor && (
                          <button
                            type="button"
                            onClick={() => setConfig({ ...config, customBgColor: undefined })}
                            className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                        <span>Hue Spectrum Slider</span>
                        <span>{hexToHue(config.customBgColor || '#1E293B')}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={hexToHue(config.customBgColor || '#1E293B')}
                        onChange={(e) => setConfig({ ...config, customBgColor: hueToHex(parseInt(e.target.value, 10)) })}
                        className="w-full h-2 rounded-lg cursor-pointer accent-amber-500 bg-gradient-to-r from-red-500 via-green-500 via-blue-500 to-red-500"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-bold text-slate-400 mr-1">Presets:</span>
                      {['#1E293B', '#0F172A', '#064E3B', '#701A75', '#831843', '#7C2D12', '#14532D', '#1E1B4B', '#000000'].map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => setConfig({ ...config, customBgColor: hex })}
                          className="w-6 h-6 rounded-full border border-white/20 transition hover:scale-110 cursor-pointer shadow"
                          style={{ backgroundColor: hex }}
                          title={`Set background color to ${hex}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CATEGORY: SKIN TONE */}
              {activeCategory === 'body' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Skin Tone & Complexion</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {BODY_OPTIONS.map((item) => {
                      const isSelected = config.body === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setConfig({ ...config, body: item.id })}
                          className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                              : 'bg-[#161822] border-white/5 hover:border-white/20 text-slate-200'
                          }`}
                        >
                          <span className="text-xs font-bold">{item.name}</span>
                          {item.isVip && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              VIP
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CATEGORY: HAIR */}
              {activeCategory === 'hair' && (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">Hairstyle</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {HAIR_OPTIONS.map((item) => {
                        const isSelected = (config.hair || 'short') === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setConfig({ ...config, hair: item.id })}
                            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                                : 'bg-[#161822] border-white/5 hover:border-white/20 text-slate-200'
                            }`}
                          >
                            <span className="text-xs font-bold">{item.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">Hair Color</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {HAIR_COLOR_OPTIONS.map((item) => {
                        const isSelected = (config.hairColor || 'brown') === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setConfig({ ...config, hairColor: item.id })}
                            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                                : 'bg-[#161822] border-white/5 hover:border-white/20 text-slate-200'
                            }`}
                          >
                            <span className="text-xs font-bold">{item.name}</span>
                            {item.isVip && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                VIP
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* CATEGORY: EYES */}
              {activeCategory === 'eyes' && (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">Eyes & Glasses Style</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {EYES_OPTIONS.map((item) => {
                        const isSelected = config.eyes === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setConfig({ ...config, eyes: item.id })}
                            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                                : 'bg-[#161822] border-white/5 hover:border-white/20 text-slate-200'
                            }`}
                          >
                            <span className="text-xs font-bold">{item.name}</span>
                            {item.isVip && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                VIP
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Eye Iris Color Picker */}
                  <div className="p-4 rounded-2xl bg-[#161822] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Eye Iris Color</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.customEyeColor || '#18181B'}
                          onChange={(e) => setConfig({ ...config, customEyeColor: e.target.value })}
                          className="w-7 h-7 rounded-lg border-0 bg-transparent cursor-pointer p-0"
                          title="Choose custom eye color"
                        />
                        <span className="text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {config.customEyeColor || 'Default'}
                        </span>
                        {config.customEyeColor && (
                          <button
                            type="button"
                            onClick={() => setConfig({ ...config, customEyeColor: undefined })}
                            className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-bold text-slate-400 mr-1">Presets:</span>
                      {[
                        { hex: '#18181B', name: 'Dark Onyx' },
                        { hex: '#2563EB', name: 'Sapphire Blue' },
                        { hex: '#16A34A', name: 'Emerald Green' },
                        { hex: '#9333EA', name: 'Amethyst Purple' },
                        { hex: '#D97706', name: 'Amber Hazel' },
                        { hex: '#DC2626', name: 'Ruby Red' },
                        { hex: '#0891B2', name: 'Cyan Blue' },
                        { hex: '#78350F', name: 'Warm Brown' },
                        { hex: '#EA580C', name: 'Flame Orange' },
                        { hex: '#DB2777', name: 'Neon Pink' }
                      ].map((item) => (
                        <button
                          key={item.hex}
                          type="button"
                          onClick={() => setConfig({ ...config, customEyeColor: item.hex })}
                          className={`w-6 h-6 rounded-full border transition hover:scale-110 cursor-pointer shadow ${
                            (config.customEyeColor || '#18181B').toLowerCase() === item.hex.toLowerCase()
                              ? 'border-amber-400 ring-2 ring-amber-400/50 scale-110'
                              : 'border-white/20'
                          }`}
                          style={{ backgroundColor: item.hex }}
                          title={`Set eye color to ${item.name}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CATEGORY: MOUTH & BEARD */}
              {activeCategory === 'mouth' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Mouth & Facial Hair</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {MOUTH_OPTIONS.map((item) => {
                      const isSelected = config.mouth === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setConfig({ ...config, mouth: item.id })}
                          className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                              : 'bg-[#161822] border-white/5 hover:border-white/20 text-slate-200'
                          }`}
                        >
                          <span className="text-xs font-bold">{item.name}</span>
                          {item.isVip && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              VIP
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CATEGORY: HATS */}
              {activeCategory === 'hat' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Headwear & TV Helmets</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {HAT_OPTIONS.map((item) => {
                      const isSelected = config.hat === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setConfig({ ...config, hat: item.id })}
                          className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                              : 'bg-[#161822] border-white/5 hover:border-white/20 text-slate-200'
                          }`}
                        >
                          <span className="text-xs font-bold">{item.name}</span>
                          {item.isVip && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              VIP
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CATEGORY: OUTFIT */}
              {activeCategory === 'outfit' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Outfits & Attire</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {OUTFIT_OPTIONS.map((item) => {
                      const isSelected = config.outfit === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setConfig({ ...config, outfit: item.id })}
                          className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                              : 'bg-[#161822] border-white/5 hover:border-white/20 text-slate-200'
                          }`}
                        >
                          <span className="text-xs font-bold">{item.name}</span>
                          {item.isVip && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              VIP
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CATEGORY: HANDHELD ITEMS */}
              {activeCategory === 'item' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Handheld Props & Snacks</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {ITEM_OPTIONS.map((item) => {
                      const isSelected = config.item === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setConfig({ ...config, item: item.id })}
                          className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                              : 'bg-[#161822] border-white/5 hover:border-white/20 text-slate-200'
                          }`}
                        >
                          <span className="text-xs font-bold">{item.name}</span>
                          {item.isVip && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              VIP
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CATEGORY: BACKGROUND */}
              {activeCategory === 'bg' && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Background Atmosphere</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {BG_OPTIONS.map((item) => {
                      const isSelected = config.bg === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setConfig({ ...config, bg: item.id })}
                          className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                              : 'bg-[#161822] border-white/5 hover:border-white/20 text-slate-200'
                          }`}
                        >
                          <span className="text-xs font-bold">{item.name}</span>
                          {item.isVip && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              VIP
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
          </div>
        </div>
      </motion.div>

      {/* VIP GATE MODAL OVERLAY */}
      <AnimatePresence>
        {showVipGateModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md bg-[#12141F] border border-amber-500/40 rounded-3xl p-6 text-center space-y-5 shadow-2xl overflow-hidden"
            >
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
                <Crown className="w-8 h-8 animate-bounce" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  VIP Upgrade Required
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your custom avatar includes <span className="text-amber-400 font-bold">{activeVipItems.length} VIP cosmetic item(s)</span>:
                </p>
                <div className="p-3 rounded-xl bg-black/40 border border-amber-500/20 text-left text-xs font-semibold text-amber-200 max-h-28 overflow-y-auto space-y-1">
                  {activeVipItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowVipGateModal(false);
                    if (onOpenUpgradeModal) {
                      onOpenUpgradeModal();
                    } else {
                      localStorage.setItem('couchtaterz_is_pro', 'true');
                      onSaveAvatar(currentDataUrl);
                      onClose();
                    }
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-extrabold text-sm transition shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Crown className="w-4 h-4" /> Unlock VIP All Access ($3.99/mo)
                </button>

                <button
                  type="button"
                  onClick={handleStripVipAndSave}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-bold transition cursor-pointer"
                >
                  Strip VIP Items & Save Free Avatar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
