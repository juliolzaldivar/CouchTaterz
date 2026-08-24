/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function normalizeUserId(rawId: string): string {
  if (!rawId) return '';
  const trimmed = rawId.toLowerCase().trim();
  if (trimmed === 'user-julio' || trimmed === 'julio' || trimmed === 'juliozaldivar@gmail.com' || trimmed === 'default') {
    return 'default';
  }
  if (trimmed === 'user-kris-vance' || trimmed === 'user-kris-3256' || trimmed === 'kris' || trimmed === 'user-kris-5139') {
    return 'user-kris-5139';
  }
  if (trimmed === 'user-rafael-gomez' || trimmed === 'rafael' || trimmed === 'user-rafael-9639') {
    return 'user-rafael-9639';
  }
  if (trimmed === 'user-ejc' || trimmed === 'ejc' || trimmed === 'user-ejc-2841') {
    return 'user-ejc-2841';
  }
  if (trimmed === 'user-greg' || trimmed === 'greg' || trimmed === 'user-greg-3842') {
    return 'user-greg-3842';
  }
  if (trimmed === 'user-hyunjin' || trimmed === 'hyunjin' || trimmed === 'user-hyunjin-6821') {
    return 'user-hyunjin-6821';
  }
  if (trimmed === 'user-doug' || trimmed === 'user-doug-briskie-5088' || trimmed === 'user-doug-briskie' || trimmed === 'doug' || trimmed === 'doug-briskie' || trimmed === 'doug briskie' || trimmed === 'user-doug-5821') {
    return 'user-doug-5821';
  }
  return trimmed;
}

export function matchUserId(id1: string, id2: string): boolean {
  if (!id1 || !id2) return false;
  if (id1 === id2) return true;
  return normalizeUserId(id1) === normalizeUserId(id2);
}

export function getAllKnownAliases(userId: string): string[] {
  const norm = normalizeUserId(userId);
  if (norm === 'default') return ['default', 'user-julio', 'julio'];
  if (norm === 'user-kris-5139') return ['user-kris-5139', 'user-kris-vance', 'user-kris-3256', 'kris'];
  if (norm === 'user-rafael-9639') return ['user-rafael-9639', 'user-rafael-gomez', 'rafael'];
  if (norm === 'user-ejc-2841') return ['user-ejc-2841', 'user-ejc', 'ejc'];
  if (norm === 'user-greg-3842') return ['user-greg-3842', 'user-greg', 'greg'];
  if (norm === 'user-hyunjin-6821') return ['user-hyunjin-6821', 'user-hyunjin', 'hyunjin'];
  if (norm === 'user-doug-5821') return ['user-doug-5821', 'user-doug', 'user-doug-briskie-5088', 'user-doug-briskie', 'doug', 'doug-briskie', 'doug briskie'];
  return Array.from(new Set([userId, norm]));
}
