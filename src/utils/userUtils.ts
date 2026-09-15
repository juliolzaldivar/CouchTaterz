/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function normalizeUserId(rawId: string): string {
  if (!rawId) return '';
  const trimmed = rawId.toLowerCase().trim();
  if (
    trimmed === 'user-julio' || 
    trimmed === 'julio' || 
    trimmed === 'juliozaldivar@gmail.com' || 
    trimmed === 'julio@couchtaterz.com' ||
    trimmed === 'user-google-8850' ||
    trimmed === 'default'
  ) {
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
  if (
    trimmed === 'user-jylian-summers' ||
    trimmed === 'user-jylian' ||
    trimmed === 'jylian' ||
    trimmed === 'jylian summers' ||
    trimmed === 'jylian-summers' ||
    trimmed === 'jylian_summers@yahoo.com' ||
    trimmed === 'user-jylian-summers-yahoo' ||
    trimmed === 'user-jylian-summers-yahoo-com' ||
    trimmed.includes('jylian')
  ) {
    return 'user-jylian-summers';
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
  if (norm === 'default') return ['default', 'user-julio', 'julio', 'user-google-8850', 'juliozaldivar@gmail.com'];
  if (norm === 'user-kris-5139') return ['user-kris-5139', 'user-kris-vance', 'user-kris-3256', 'kris'];
  if (norm === 'user-rafael-9639') return ['user-rafael-9639', 'user-rafael-gomez', 'rafael'];
  if (norm === 'user-ejc-2841') return ['user-ejc-2841', 'user-ejc', 'ejc'];
  if (norm === 'user-greg-3842') return ['user-greg-3842', 'user-greg', 'greg'];
  if (norm === 'user-hyunjin-6821') return ['user-hyunjin-6821', 'user-hyunjin', 'hyunjin'];
  if (norm === 'user-doug-5821') return ['user-doug-5821', 'user-doug', 'user-doug-briskie-5088', 'user-doug-briskie', 'doug', 'doug-briskie', 'doug briskie'];
  if (norm === 'user-jylian-summers') return ['user-jylian-summers', 'user-jylian', 'jylian', 'jylian summers', 'jylian_summers@yahoo.com', 'user-jylian-summers-yahoo', 'user-jylian-summers-yahoo-com'];
  return Array.from(new Set([userId, norm]));
}

export function formatDisplayNameFromId(id: string): string {
  if (!id) return 'Binge Buddy';
  const clean = id.replace(/^user-/, '').replace(/-\d+$/, '');
  if (!clean) return 'Binge Buddy';
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export function isUserInFriendList(
  user: { id: string; email?: string; name?: string },
  friendIds: string[] | undefined | null
): boolean {
  if (!user || !user.id || !Array.isArray(friendIds) || friendIds.length === 0) return false;

  const targetId = user.id.toLowerCase().trim();
  const targetNorm = normalizeUserId(user.id);
  const targetEmail = (user.email || '').toLowerCase().trim();
  const targetName = (user.name || '').toLowerCase().trim();
  const userAliases = getAllKnownAliases(user.id).map(a => a.toLowerCase().trim());

  return friendIds.some(fId => {
    if (!fId) return false;
    const cleanF = fId.toLowerCase().trim();
    const normF = normalizeUserId(fId);

    // 1. Direct or normalized ID equality
    if (cleanF === targetId || normF === targetNorm) return true;
    if (matchUserId(cleanF, targetId)) return true;

    // 2. Alias match
    if (userAliases.includes(cleanF) || userAliases.includes(normF)) return true;
    const fAliases = getAllKnownAliases(fId).map(a => a.toLowerCase().trim());
    if (fAliases.includes(targetId) || fAliases.includes(targetNorm)) return true;

    // 3. Email match
    if (targetEmail && (cleanF === targetEmail || cleanF.includes(targetEmail) || targetEmail.includes(cleanF))) return true;

    // 4. Handle/Slug similarity match (e.g. "user-jylian-4821" vs "jylian" or "user-jylian")
    const cleanFBase = cleanF.replace(/^user-/, '').replace(/-\d+$/, '');
    const targetBase = targetId.replace(/^user-/, '').replace(/-\d+$/, '');
    if (cleanFBase && targetBase && cleanFBase === targetBase) return true;

    // 5. Name match
    if (targetName && targetName.length >= 3) {
      if (cleanF.includes(targetName) || cleanFBase === targetName) return true;
    }

    return false;
  });
}
