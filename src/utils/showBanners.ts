import { TvShow } from '../types';

export const KNOWN_SHOW_BANNERS: Record<string, string> = {
  "the last of us": "https://s10019.cdn.ncms.io/wp-content/uploads/2025/03/The-Last-Of-Us-S2_HO_KA_16x9_v03.jpg.jpeg",
  "the bear": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLSxpFNAmFk_IZGbaryDs3GkM5lnyWEjGt6USNocYJPA&s=10",
  "severance": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNACrAMoLkgMH0e47maB2DZ7OeMG3ZWBtuheU7rgkUdg&s=10",
  "stranger things": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4Qf7wolgUB7X37sMbkSd93bUJlubb_qNmozDnQtHp4Q&s=10",
  "the mandalorian": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRW7GL3lPW3wlxBr5nmhQ5gup4wqG5aGiroNJ8UNLSJaQ&s=10",
  "house of the dragon": "https://cdn.theplaylist.net/wp-content/uploads/2026/02/19111056/house-of-the-dragon.jpg",
  "house of dragon": "https://cdn.theplaylist.net/wp-content/uploads/2026/02/19111056/house-of-the-dragon.jpg",
  "shōgun": "https://image.tmdb.org/t/p/w1280/6Tb87q9Tog30F5AAHh1gyDT2Vve.jpg",
  "shogun": "https://image.tmdb.org/t/p/w1280/6Tb87q9Tog30F5AAHh1gyDT2Vve.jpg",
  "silo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGow7p2r8x9pAV8hTP2OzWwWNDhQa96bWgImV_ucRIDw&s=10",
  "fallout": "https://image.tmdb.org/t/p/w1280/coaPCIqQBPUZsOnJcWZxhaORcDT.jpg",
  "ted lasso": "https://image.tmdb.org/t/p/w1280/gEQkOMmnJcoh9Hh1vk7fpVYnksR.jpg",
  "slow horses": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6pzwPlJXnQcGY8BkO_z2ph4-asGzeaLDUAmNU8UM3AQ&s=10",
  "succession": "https://image.tmdb.org/t/p/w1280/ixgFmf1X59PUZam2qbAfskx2gQr.jpg",
  "true detective": "https://image.tmdb.org/t/p/w1280/v8YFr8BbU9qsO8PYIulzTeM6Qk.jpg",
  "fargo": "https://image.tmdb.org/t/p/w1280/4jrSbRpLqpvYJtLKncaxZVC47EW.jpg",
  "only murders in the building": "https://image.tmdb.org/t/p/w1280/rCTLaPwuApDx8vLGjYZ9pRl7zRB.jpg",
  "hacks": "https://static.tvmaze.com/uploads/images/original_untouched/623/1557822.jpg",
  "abbott elementary": "https://image.tmdb.org/t/p/w1280/bcdUYUFk8GdpZJPiSAas9UeocLH.jpg",
  "the white lotus": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4CAM-wqcRw4IGHQqCO8buc7syl9Xps3udfelzvffwiQ&s=10",
  "white lotus": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4CAM-wqcRw4IGHQqCO8buc7syl9Xps3udfelzvffwiQ&s=10",
  "squid game": "https://image.tmdb.org/t/p/w1280/2meX1nMdScFOoV4370rqHWKmXhY.jpg",
  "industry": "https://static.tvmaze.com/uploads/images/original_untouched/554/1387331.jpg",
  "rick and morty": "https://www.awn.com/sites/default/files/styles/original/public/image/featured/randms9-1280.jpg?itok=z6XeKjCx",
  "avatar: the last airbender": "https://image.tmdb.org/t/p/w1280/xUB3xFMgsHgPmdWnUWkHTJ03vHa.jpg",
  "chappelle's show": "https://resizing.flixster.com/pQ0T4pjRQW7VHa6jPJkCdMsMb98=/fit-in/705x460/v2/https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/p185050_b_h10_ag.jpg",
  "the americans": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuG_1v8qSY_Jr5OTI94uFnIsSsd_eqokq2cHQQ7Bv43w&s=10",
  "supernatural": "https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
  "peaky blinders": "https://image.tmdb.org/t/p/w1280/6Tb87q9Tog30F5AAHh1gyDT2Vve.jpg",
  "shameless": "https://image.tmdb.org/t/p/w1280/gEQkOMmnJcoh9Hh1vk7fpVYnksR.jpg",
  "dead like me": "https://image.tmdb.org/t/p/w1280/bwSmgmd90hCWwqOKQYTEraeOZhJ.jpg",
  "yellowjackets": "https://image.tmdb.org/t/p/w1280/acevLdSl5I2MK5RYAm7gwAndt1w.jpg",
  "dutton ranch": "https://image.tmdb.org/t/p/w1280/6Tb87q9Tog30F5AAHh1gyDT2Vve.jpg",
  "yellowstone": "https://image.tmdb.org/t/p/w1280/6Tb87q9Tog30F5AAHh1gyDT2Vve.jpg"
};

const GENRE_FALLBACK_BANNERS: Record<string, string> = {
  "sci-fi": "https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
  "horror": "https://image.tmdb.org/t/p/w1280/acevLdSl5I2MK5RYAm7gwAndt1w.jpg",
  "comedy": "https://image.tmdb.org/t/p/w1280/gEQkOMmnJcoh9Hh1vk7fpVYnksR.jpg",
  "drama": "https://image.tmdb.org/t/p/w1280/rCTLaPwuApDx8vLGjYZ9pRl7zRB.jpg",
  "action": "https://image.tmdb.org/t/p/w1280/6Tb87q9Tog30F5AAHh1gyDT2Vve.jpg",
  "thriller": "https://image.tmdb.org/t/p/w1280/bDfboQUb45Cv9MYyVBDZw8M8xSM.jpg",
  "mystery": "https://image.tmdb.org/t/p/w1280/ixgFmf1X59PUZam2qbAfskx2gQr.jpg",
  "default": "https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg"
};

export function normalizeTitleForComparison(title: string): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(the|a|an)\b/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

export function getShowBannerImage(show: Partial<TvShow>, adminShows?: Partial<TvShow>[]): string {
  if (show && show.bannerImage && show.bannerImage.trim().length > 0) {
    return show.bannerImage.trim();
  }

  const title = (show?.title || "").trim();
  const lowerTitle = title.toLowerCase();
  const normalizedTitle = normalizeTitleForComparison(title);

  // 1. Check against Julio's (admin) collection first if provided
  if (adminShows && Array.isArray(adminShows) && adminShows.length > 0) {
    // Exact or case-insensitive title match first
    const exactAdminMatch = adminShows.find(s => 
      s && s.bannerImage && s.bannerImage.trim().length > 0 &&
      (s.title || '').toLowerCase().trim() === lowerTitle
    );
    if (exactAdminMatch && exactAdminMatch.bannerImage) {
      return exactAdminMatch.bannerImage.trim();
    }

    // Normalized title match next (e.g., "House of Dragon" vs "House of the Dragon")
    if (normalizedTitle) {
      const normalizedAdminMatch = adminShows.find(s => 
        s && s.bannerImage && s.bannerImage.trim().length > 0 &&
        normalizeTitleForComparison(s.title || '') === normalizedTitle
      );
      if (normalizedAdminMatch && normalizedAdminMatch.bannerImage) {
        return normalizedAdminMatch.bannerImage.trim();
      }
    }
  }

  // 2. Check KNOWN_SHOW_BANNERS dictionary
  if (lowerTitle && KNOWN_SHOW_BANNERS[lowerTitle]) {
    return KNOWN_SHOW_BANNERS[lowerTitle];
  }

  // Check normalized keys in KNOWN_SHOW_BANNERS
  if (normalizedTitle) {
    for (const [key, banner] of Object.entries(KNOWN_SHOW_BANNERS)) {
      if (normalizeTitleForComparison(key) === normalizedTitle) {
        return banner;
      }
    }
    // Partial substring matching
    for (const [key, banner] of Object.entries(KNOWN_SHOW_BANNERS)) {
      const normKey = normalizeTitleForComparison(key);
      if (normKey && (normalizedTitle.includes(normKey) || normKey.includes(normalizedTitle))) {
        return banner;
      }
    }
  }

  // 3. Fallback by genre
  if (show?.genres && Array.isArray(show.genres) && show.genres.length > 0) {
    for (const g of show.genres) {
      const lowerG = g.toLowerCase();
      if (GENRE_FALLBACK_BANNERS[lowerG]) {
        return GENRE_FALLBACK_BANNERS[lowerG];
      }
    }
  }

  return GENRE_FALLBACK_BANNERS["default"];
}
