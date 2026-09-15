import { TvShow } from '../types';

export const KNOWN_DEAD_BANNERS = new Set<string>([
  "https://static.tvmaze.com/uploads/images/original_untouched/260/652279.jpg",
  "https://image.tmdb.org/t/p/w1280/5F0HVEgkgP99fEWDJpYikGt9jQi.jpg",
  "https://image.tmdb.org/t/p/w1280/w7kW4fsT08cR3f0r2Z4eGkHlTf.jpg",
  "https://image.tmdb.org/t/p/w1280/pE1cZk1UuN17u2g4pG2d4W6h8E9.jpg",
  "https://image.tmdb.org/t/p/w1280/hP06F4gE8jLclN8NqLdGAtI81U.jpg",
  "https://image.tmdb.org/t/p/w1280/8Z8e8N8122uUfFk80kY6q6oXWb7.jpg",
  "https://image.tmdb.org/t/p/w1280/l0q2Y81BhywogG1p1HwDq6qf8Y8.jpg",
  "https://image.tmdb.org/t/p/w1280/e5b5eUsmqG4m7h0JzTf19uL3E7N.jpg",
  "https://image.tmdb.org/t/p/w1280/etj5CuMuamjhGjQAC0Lo2iZ2u6q.jpg"
]);

export const KNOWN_SHOW_BANNERS: Record<string, string> = {
  "the last of us": "https://image.tmdb.org/t/p/w1280/lY2DhbA7Hy44fAKddr06UrXWWaQ.jpg",
  "the bear": "https://image.tmdb.org/t/p/w1280/AjwoDj77HLlqcpwEGqsnvMXm5my.jpg",
  "severance": "https://image.tmdb.org/t/p/w1280/39bifj2FNytJ2m1cqOBcWMTKgmV.jpg",
  "stranger things": "https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
  "the mandalorian": "https://image.tmdb.org/t/p/w1280/9zcbqSxdsRMZWHYtyCd1nXPr2xq.jpg",
  "house of the dragon": "https://image.tmdb.org/t/p/w1280/577eXC8wFQT0eUrJcgznSiFPRmk.jpg",
  "house of dragon": "https://image.tmdb.org/t/p/w1280/577eXC8wFQT0eUrJcgznSiFPRmk.jpg",
  "shōgun": "https://image.tmdb.org/t/p/w1280/6Tb87q9Tog30F5AAHh1gyDT2Vve.jpg",
  "shogun": "https://image.tmdb.org/t/p/w1280/6Tb87q9Tog30F5AAHh1gyDT2Vve.jpg",
  "silo": "https://image.tmdb.org/t/p/w1280/uTWhbLc7Bj4qNSdW3ZvZKL8cOHv.jpg",
  "fallout": "https://image.tmdb.org/t/p/w1280/coaPCIqQBPUZsOnJcWZxhaORcDT.jpg",
  "ted lasso": "https://image.tmdb.org/t/p/w1280/gEQkOMmnJcoh9Hh1vk7fpVYnksR.jpg",
  "slow horses": "https://image.tmdb.org/t/p/w1280/5SU9xjeC1DxITnbLcaSibkkSFk6.jpg",
  "succession": "https://image.tmdb.org/t/p/w1280/bcdUYUFk8GdpZJPiSAas9UeocLH.jpg",
  "true detective": "https://image.tmdb.org/t/p/w1280/v8YFr8BbU9qsO8PYIulzTeM6Qk.jpg",
  "fargo": "https://image.tmdb.org/t/p/w1280/4jrSbRpLqpvYJtLKncaxZVC47EW.jpg",
  "only murders in the building": "https://image.tmdb.org/t/p/w1280/rCTLaPwuApDx8vLGjYZ9pRl7zRB.jpg",
  "hacks": "https://image.tmdb.org/t/p/w1280/8cpXau1LjYMBjiaHUS75JmlgGsU.jpg",
  "abbott elementary": "https://image.tmdb.org/t/p/w1280/jbFkZSsmFFLjqZzxQHTBYyQb0RR.jpg",
  "the white lotus": "https://image.tmdb.org/t/p/w1280/qVBIAcZkK5j6WRq7JehJcOMbdgb.jpg",
  "white lotus": "https://image.tmdb.org/t/p/w1280/qVBIAcZkK5j6WRq7JehJcOMbdgb.jpg",
  "squid game": "https://image.tmdb.org/t/p/w1280/2meX1nMdScFOoV4370rqHWKmXhY.jpg",
  "industry": "https://image.tmdb.org/t/p/w1280/7JknL2ItfhJzQBSnFfSEASg1Os4.jpg",
  "rick and morty": "https://image.tmdb.org/t/p/w1280/iFOkrSrJRwE27PwbyQeYLlMJXzw.jpg",
  "avatar: the last airbender": "https://image.tmdb.org/t/p/w1280/xUB3xFMgsHgPmdWnUWkHTJ03vHa.jpg",
  "chappelle's show": "https://image.tmdb.org/t/p/w1280/cDuItxWcfn9ZMtLAOkUH5UNpfRN.jpg",
  "the americans": "https://image.tmdb.org/t/p/w1280/7RrcmIQ7e37M3vMkUNAKCEA6uEy.jpg",
  "supernatural": "https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
  "peaky blinders": "https://image.tmdb.org/t/p/w1280/6Tb87q9Tog30F5AAHh1gyDT2Vve.jpg",
  "shameless": "https://image.tmdb.org/t/p/w1280/gEQkOMmnJcoh9Hh1vk7fpVYnksR.jpg",
  "dead like me": "https://image.tmdb.org/t/p/w1280/bwSmgmd90hCWwqOKQYTEraeOZhJ.jpg",
  "yellowjackets": "https://image.tmdb.org/t/p/w1280/acevLdSl5I2MK5RYAm7gwAndt1w.jpg",
  "lioness": "https://image.tmdb.org/t/p/w1280/5PCKxpFcCTDFT3b1olJGPaAIM9e.jpg",
  "special ops: lioness": "https://image.tmdb.org/t/p/w1280/5PCKxpFcCTDFT3b1olJGPaAIM9e.jpg",
  "alien: earth": "https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
  "a knight of the seven kingdoms": "https://image.tmdb.org/t/p/w1280/ceivmulBBetwpuguibNvAj7t3B3.jpg",
  "knight of the seven kingdoms": "https://image.tmdb.org/t/p/w1280/ceivmulBBetwpuguibNvAj7t3B3.jpg",
  "blade runner 2099": "https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
  "foundation": "https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
  "lanterns": "https://image.tmdb.org/t/p/w1280/tdhBhZ8YwLltkbFWpjztVDSNI2N.jpg",
  "dutton ranch": "https://image.tmdb.org/t/p/w1280/6Tb87q9Tog30F5AAHh1gyDT2Vve.jpg",
  "yellowstone": "https://image.tmdb.org/t/p/w1280/6Tb87q9Tog30F5AAHh1gyDT2Vve.jpg",
  "malcolm in the middle": "https://image.tmdb.org/t/p/w1280/si3OheCrSpEyK2JUtZOThsZPUR4.jpg",
  "twin peaks": "https://image.tmdb.org/t/p/w1280/dZklTql88IDOmkC3JAYQSTgyK6f.jpg"
};

const GENRE_FALLBACK_BANNERS: Record<string, string> = {
  "sci-fi": "https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
  "horror": "https://image.tmdb.org/t/p/w1280/acevLdSl5I2MK5RYAm7gwAndt1w.jpg",
  "comedy": "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1280&auto=format&fit=crop",
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
  const currentBanner = (show?.bannerImage || "").trim();
  const isDeadBanner = !currentBanner || 
    KNOWN_DEAD_BANNERS.has(currentBanner) || 
    currentBanner.includes("652279") ||
    currentBanner.startsWith("data:") || 
    !currentBanner.startsWith("http");

  const title = (show?.title || "").trim();
  const lowerTitle = title.toLowerCase();
  const normalizedTitle = normalizeTitleForComparison(title);

  // If the banner is valid and not on the dead list, return it
  if (currentBanner && !isDeadBanner) {
    return currentBanner;
  }

  // 1. Check KNOWN_SHOW_BANNERS dictionary first for verified canonical banner
  if (lowerTitle && KNOWN_SHOW_BANNERS[lowerTitle]) {
    return KNOWN_SHOW_BANNERS[lowerTitle];
  }
  if (normalizedTitle) {
    for (const [key, banner] of Object.entries(KNOWN_SHOW_BANNERS)) {
      if (normalizeTitleForComparison(key) === normalizedTitle) {
        return banner;
      }
    }
  }

  // 2. Check against Julio's (admin) collection if provided
  if (adminShows && Array.isArray(adminShows) && adminShows.length > 0) {
    const exactAdminMatch = adminShows.find(s => 
      s && s.bannerImage && s.bannerImage.trim().length > 0 &&
      !KNOWN_DEAD_BANNERS.has(s.bannerImage.trim()) &&
      s.bannerImage.trim().startsWith("http") &&
      (s.title || '').toLowerCase().trim() === lowerTitle
    );
    if (exactAdminMatch && exactAdminMatch.bannerImage) {
      return exactAdminMatch.bannerImage.trim();
    }

    const normalizedAdminMatch = adminShows.find(s => {
      if (!s || !s.bannerImage || KNOWN_DEAD_BANNERS.has(s.bannerImage.trim()) || !s.bannerImage.trim().startsWith("http")) return false;
      const sNorm = normalizeTitleForComparison(s.title || '');
      return sNorm && normalizedTitle && sNorm === normalizedTitle;
    });
    if (normalizedAdminMatch && normalizedAdminMatch.bannerImage) {
      return normalizedAdminMatch.bannerImage.trim();
    }
  }

  // 3. Partial substring matching in KNOWN_SHOW_BANNERS
  if (normalizedTitle) {
    for (const [key, banner] of Object.entries(KNOWN_SHOW_BANNERS)) {
      const normKey = normalizeTitleForComparison(key);
      if (normKey && (normalizedTitle.includes(normKey) || normKey.includes(normalizedTitle))) {
        return banner;
      }
    }
  }

  // 4. Fallback by genre
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

export function getShowFallbackBanner(show: Partial<TvShow>, failedUrl?: string): string {
  const title = (show?.title || "").trim();
  const lowerTitle = title.toLowerCase();
  const normalizedTitle = normalizeTitleForComparison(title);

  // 1. Check known banner dictionary if it's different from the failed URL
  if (lowerTitle && KNOWN_SHOW_BANNERS[lowerTitle] && KNOWN_SHOW_BANNERS[lowerTitle] !== failedUrl) {
    return KNOWN_SHOW_BANNERS[lowerTitle];
  }

  if (normalizedTitle) {
    for (const [key, banner] of Object.entries(KNOWN_SHOW_BANNERS)) {
      if (normalizeTitleForComparison(key) === normalizedTitle && banner !== failedUrl) {
        return banner;
      }
    }
  }

  // 2. Fallback to genre
  if (show?.genres && Array.isArray(show.genres) && show.genres.length > 0) {
    for (const g of show.genres) {
      const lowerG = g.toLowerCase();
      if (GENRE_FALLBACK_BANNERS[lowerG] && GENRE_FALLBACK_BANNERS[lowerG] !== failedUrl) {
        return GENRE_FALLBACK_BANNERS[lowerG];
      }
    }
  }

  return GENRE_FALLBACK_BANNERS["default"];
}
