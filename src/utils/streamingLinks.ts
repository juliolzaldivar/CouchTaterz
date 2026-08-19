/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StreamingService } from '../types';

/**
 * Direct official registration / sign-up destinations for each streaming channel.
 */
export const REGISTRATION_LINKS: Record<StreamingService, string> = {
  'Netflix': 'https://www.netflix.com/signup',
  'HBO': 'https://www.max.com/',
  'Disney+': 'https://www.disneyplus.com/',
  'Prime Video': 'https://www.amazon.com/amazonprime',
  'Hulu': 'https://signup.hulu.com/',
  'Apple TV': 'https://tv.apple.com/',
  'Paramount+': 'https://www.paramountplus.com/',
  'Peacock': 'https://www.peacocktv.com/',
  'AMC+': 'https://www.amcplus.com/',
  'Starz': 'https://www.starz.com/',
  'Other': 'https://www.google.com'
};

/**
 * Mobile-friendly universal link destinations.
 */
export const MOBILE_SCHEMES: Record<StreamingService, string> = {
  'Netflix': 'https://www.netflix.com/',
  'HBO': 'https://play.max.com/',
  'Disney+': 'https://www.disneyplus.com/',
  'Prime Video': 'https://www.primevideo.com/',
  'Hulu': 'https://www.hulu.com/',
  'Apple TV': 'https://tv.apple.com/',
  'Paramount+': 'https://www.paramountplus.com/',
  'Peacock': 'https://www.peacocktv.com/',
  'AMC+': 'https://www.amcplus.com/',
  'Starz': 'https://www.starz.com/',
  'Other': 'https://www.google.com'
};

/**
 * Desktop home / storefront login portals.
 */
export const DESKTOP_LOGIN_LINKS: Record<StreamingService, string> = {
  'Netflix': 'https://www.netflix.com/browse',
  'HBO': 'https://play.max.com/',
  'Disney+': 'https://www.disneyplus.com/home',
  'Prime Video': 'https://www.primevideo.com/',
  'Hulu': 'https://www.hulu.com/hub/home',
  'Apple TV': 'https://tv.apple.com/',
  'Paramount+': 'https://www.paramountplus.com/',
  'Peacock': 'https://www.peacocktv.com/watch/home',
  'AMC+': 'https://www.amcplus.com/',
  'Starz': 'https://www.starz.com/us/en/',
  'Other': 'https://www.google.com'
};

/**
 * Generates an active, direct watch/search URL for a show on its specific streaming platform.
 * Works seamlessly across both desktop and mobile devices.
 *
 * @param service The streaming network / platform
 * @param showTitle Optional title of the series to direct straight into search/play
 */
export const getStreamingServiceLink = (service: StreamingService, showTitle?: string): string => {
  const cleanTitle = showTitle ? showTitle.trim() : '';

  if (cleanTitle) {
    const encoded = encodeURIComponent(cleanTitle);
    switch (service) {
      case 'Prime Video':
        // Direct Amazon Instant Video search - brings up the exact show page with Play/Watch episode buttons
        return `https://www.amazon.com/s?k=${encoded}&i=instant-video`;
      case 'Netflix':
        return `https://www.netflix.com/search?q=${encoded}`;
      case 'HBO':
        return `https://play.max.com/search?q=${encoded}`;
      case 'Disney+':
        return `https://www.disneyplus.com/search?q=${encoded}`;
      case 'Hulu':
        return `https://www.hulu.com/search?q=${encoded}`;
      case 'Apple TV':
        return `https://tv.apple.com/search?term=${encoded}`;
      case 'Paramount+':
        return `https://www.paramountplus.com/search/?q=${encoded}`;
      case 'Peacock':
        return `https://www.peacocktv.com/watch/search?q=${encoded}`;
      case 'AMC+':
        return `https://www.amcplus.com/search?q=${encoded}`;
      case 'Starz':
        return `https://www.starz.com/us/en/search?q=${encoded}`;
      case 'Other':
      default:
        return `https://www.google.com/search?q=watch+${encoded}+online`;
    }
  }

  // Fallback if no show title is passed
  switch (service) {
    case 'Prime Video':
      return 'https://www.primevideo.com/';
    case 'Netflix':
      return 'https://www.netflix.com/browse';
    case 'HBO':
      return 'https://play.max.com/';
    case 'Disney+':
      return 'https://www.disneyplus.com/home';
    case 'Hulu':
      return 'https://www.hulu.com/hub/home';
    case 'Apple TV':
      return 'https://tv.apple.com/';
    case 'Paramount+':
      return 'https://www.paramountplus.com/';
    case 'Peacock':
      return 'https://www.peacocktv.com/watch/home';
    case 'AMC+':
      return 'https://www.amcplus.com/';
    case 'Starz':
      return 'https://www.starz.com/us/en/';
    case 'Other':
    default:
      return 'https://www.google.com';
  }
};
