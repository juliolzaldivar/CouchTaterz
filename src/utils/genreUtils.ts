import { TvShow } from '../types';

export function getNormalizedGenres(show: Partial<TvShow>): string[] {
  if (!show) return ['Drama'];
  const genreSet = new Set<string>();
  const rawGenres = show.genres || [];
  const lowerTitle = (show.title || '').toLowerCase().trim();
  const lowerOverview = (show.overview || '').toLowerCase().trim();

  // 1. Process raw genres string array
  for (const raw of rawGenres) {
    if (!raw) continue;
    // Split by commas, slashes, ampersands, or 'and'
    const parts = raw.split(/[,/&]|\band\b/i);
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      genreSet.add(trimmed);

      const lowerPart = trimmed.toLowerCase();
      if (lowerPart.includes('sci-fi') || lowerPart.includes('science fiction')) genreSet.add('Sci-Fi');
      if (lowerPart.includes('horror') || lowerPart.includes('supernatural') || lowerPart.includes('ghost') || lowerPart.includes('paranormal')) {
        genreSet.add('Horror');
      }
      if (lowerPart.includes('thriller')) genreSet.add('Thriller');
      if (lowerPart.includes('mystery')) genreSet.add('Mystery');
      if (lowerPart.includes('comedy') || lowerPart.includes('sitcom')) genreSet.add('Comedy');
      if (lowerPart.includes('drama')) genreSet.add('Drama');
      if (lowerPart.includes('action')) genreSet.add('Action');
      if (lowerPart.includes('fantasy')) genreSet.add('Fantasy');
      if (lowerPart.includes('western')) genreSet.add('Western');
      if (lowerPart.includes('dystopi') || lowerPart.includes('post-apocalyp')) genreSet.add('Dystopian');
      if (lowerPart.includes('anime') || lowerPart.includes('animation')) genreSet.add('Animation');
    }
  }

  // 2. Comprehensive Horror & Supernatural detection by title & overview keywords
  const horrorKeywords = [
    'supernatural', 'horror', 'ghost', 'demon', 'vampire', 'zombie', 'monster',
    'haunted', 'witch', 'slasher', 'occult', 'frightening', 'terrifying', 'exorcist',
    'paranormal', 'creature', 'nightmare', 'devil', 'evil', 'spooky', 'curse', 'spirit',
    'apocalypse', 'undead'
  ];

  const horrorTitles = [
    'supernatural', 'stranger things', 'the walking dead', 'hannibal', 'bates motel',
    'penny dreadful', 'american horror story', 'yellowjackets', 'from', 'interview with the vampire',
    'chucky', 'castlevania', 'cabinet of curiosities', 'what we do in the shadows', 'ghosts',
    'the last of us', 'ash vs evil dead', 'the fall of the house of usher', 'evil', 'servant',
    'buffy', 'angel', 'grimm', 'sleepy hollow', 'midnight mass', 'the haunting', 'creepshow',
    'helstrom', 'swamp thing', 'scream', 'goosebumps', 'dexter', 'the strain', 'the terror',
    'locke & key', 'constantine', 'the exorcist', 'marianne', 'salem', 'chilling adventures of sabrina'
  ];

  const isHorror = horrorTitles.some(ht => lowerTitle.includes(ht)) ||
    horrorKeywords.some(kw => lowerTitle.includes(kw) || lowerOverview.includes(kw));

  if (isHorror) {
    genreSet.add('Horror');
  }

  if (genreSet.has('Supernatural') || genreSet.has('Paranormal')) {
    genreSet.add('Horror');
  }

  if (lowerTitle.includes('fallout') || lowerTitle.includes('silo') || lowerOverview.includes('apocalyp') || lowerOverview.includes('dystopi')) {
    genreSet.add('Dystopian');
    genreSet.add('Sci-Fi');
  }

  const result = Array.from(genreSet);
  return result.length > 0 ? result : ['Drama'];
}
