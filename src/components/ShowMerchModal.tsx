import React, { useState, useEffect } from 'react';
import { TvShow, User } from '../types';
import { X, Search, Plus, ExternalLink, Star, Tag, BookOpen, Shirt, Package, ShoppingBag, Sparkles, RefreshCw, Edit } from 'lucide-react';

export interface MerchandiseItem {
  id: string;
  showTitle: string;
  category: 'books' | 'clothing' | 'collectibles';
  title: string;
  price: string;
  rating?: string;
  imageUrl: string;
  amazonUrl: string;
  badge?: string;
  description?: string;
}

interface ShowMerchModalProps {
  show: TvShow;
  isOpen: boolean;
  onClose: () => void;
  theme?: 'dark' | 'light';
  currentUser?: User | null;
}

export interface ShowThemePalette {
  primary: string;         // Main accent color e.g. '#FACC15' or '#EF4444' or '#06B6D4'
  primaryHover: string;    // Darker/lighter variant for button hover
  primaryText: string;     // Text color over primary e.g. '#0F172A' or '#FFFFFF'
  accent: string;          // Secondary accent color e.g. '#38BDF8'
  headerGradientFrom: string; // Header overlay gradient top
  headerGradientVia: string;  // Header overlay gradient middle
  badgeBg: string;         // Badge background color
  badgeBorder: string;     // Badge border color
  badgeText: string;       // Badge text color
  cardBorderHover: string; // Product card border on hover
  glowColor: string;       // Dynamic drop shadow glow
}

export const AmazonShoppingBagIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = "w-4 h-4", style }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.8" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    style={style}
  >
    <path d="M8 7V6a4 4 0 0 1 8 0v1" />
    <path d="M4 7h16l1.2 13A2 2 0 0 1 19.2 22H4.8A2 2 0 0 1 2.8 20L4 7z" />
  </svg>
);

// Fallback theme palette generator based on show title, network, and hash
export const getShowPalette = (show: TvShow): ShowThemePalette => {
  const title = (show?.title || '').toLowerCase();

  // Signature show theme overrides
  if (title.includes('simpson')) {
    return {
      primary: '#FACC15',
      primaryHover: '#EAB308',
      primaryText: '#0F172A',
      accent: '#38BDF8',
      headerGradientFrom: 'rgba(2, 132, 199, 0.85)',
      headerGradientVia: 'rgba(250, 204, 21, 0.35)',
      badgeBg: 'rgba(56, 189, 248, 0.25)',
      badgeBorder: 'rgba(56, 189, 248, 0.5)',
      badgeText: '#BAE6FD',
      cardBorderHover: 'rgba(250, 204, 21, 0.8)',
      glowColor: 'rgba(250, 204, 21, 0.3)',
    };
  }
  if (title.includes('stranger things')) {
    return {
      primary: '#EF4444',
      primaryHover: '#DC2626',
      primaryText: '#FFFFFF',
      accent: '#F97316',
      headerGradientFrom: 'rgba(127, 29, 29, 0.75)',
      headerGradientVia: 'rgba(239, 68, 68, 0.3)',
      badgeBg: 'rgba(239, 68, 68, 0.25)',
      badgeBorder: 'rgba(239, 68, 68, 0.5)',
      badgeText: '#FCA5A5',
      cardBorderHover: 'rgba(239, 68, 68, 0.6)',
      glowColor: 'rgba(239, 68, 68, 0.3)',
    };
  }
  if (title.includes('bear')) {
    return {
      primary: '#3B82F6',
      primaryHover: '#2563EB',
      primaryText: '#FFFFFF',
      accent: '#F59E0B',
      headerGradientFrom: 'rgba(30, 58, 138, 0.7)',
      headerGradientVia: 'rgba(59, 130, 246, 0.25)',
      badgeBg: 'rgba(59, 130, 246, 0.25)',
      badgeBorder: 'rgba(59, 130, 246, 0.5)',
      badgeText: '#93C5FD',
      cardBorderHover: 'rgba(59, 130, 246, 0.6)',
      glowColor: 'rgba(59, 130, 246, 0.25)',
    };
  }
  if (title.includes('severance')) {
    return {
      primary: '#06B6D4',
      primaryHover: '#0891B2',
      primaryText: '#0F172A',
      accent: '#38BDF8',
      headerGradientFrom: 'rgba(15, 23, 42, 0.85)',
      headerGradientVia: 'rgba(6, 182, 212, 0.3)',
      badgeBg: 'rgba(6, 182, 212, 0.25)',
      badgeBorder: 'rgba(6, 182, 212, 0.5)',
      badgeText: '#67E8F9',
      cardBorderHover: 'rgba(6, 182, 212, 0.6)',
      glowColor: 'rgba(6, 182, 212, 0.25)',
    };
  }
  if (title.includes('shogun') || title.includes('shōgun')) {
    return {
      primary: '#DC2626',
      primaryHover: '#B91C1C',
      primaryText: '#FFFFFF',
      accent: '#EAB308',
      headerGradientFrom: 'rgba(127, 29, 29, 0.8)',
      headerGradientVia: 'rgba(234, 179, 8, 0.25)',
      badgeBg: 'rgba(220, 38, 38, 0.25)',
      badgeBorder: 'rgba(220, 38, 38, 0.5)',
      badgeText: '#FCA5A5',
      cardBorderHover: 'rgba(220, 38, 38, 0.6)',
      glowColor: 'rgba(220, 38, 38, 0.25)',
    };
  }
  if (title.includes('wednesday')) {
    return {
      primary: '#A855F7',
      primaryHover: '#9333EA',
      primaryText: '#FFFFFF',
      accent: '#C084FC',
      headerGradientFrom: 'rgba(88, 28, 135, 0.8)',
      headerGradientVia: 'rgba(168, 85, 247, 0.25)',
      badgeBg: 'rgba(168, 85, 247, 0.25)',
      badgeBorder: 'rgba(168, 85, 247, 0.5)',
      badgeText: '#E9D5FF',
      cardBorderHover: 'rgba(168, 85, 247, 0.6)',
      glowColor: 'rgba(168, 85, 247, 0.25)',
    };
  }
  if (title.includes('mandalorian') || title.includes('star wars')) {
    return {
      primary: '#14B8A6',
      primaryHover: '#0D9488',
      primaryText: '#0F172A',
      accent: '#F97316',
      headerGradientFrom: 'rgba(15, 118, 110, 0.7)',
      headerGradientVia: 'rgba(20, 184, 166, 0.25)',
      badgeBg: 'rgba(20, 184, 166, 0.25)',
      badgeBorder: 'rgba(20, 184, 166, 0.5)',
      badgeText: '#5EEAD4',
      cardBorderHover: 'rgba(20, 184, 166, 0.6)',
      glowColor: 'rgba(20, 184, 166, 0.25)',
    };
  }
  if (title.includes('breaking bad') || title.includes('saul')) {
    return {
      primary: '#10B981',
      primaryHover: '#059669',
      primaryText: '#0F172A',
      accent: '#06B6D4',
      headerGradientFrom: 'rgba(6, 78, 59, 0.8)',
      headerGradientVia: 'rgba(16, 185, 129, 0.25)',
      badgeBg: 'rgba(16, 185, 129, 0.25)',
      badgeBorder: 'rgba(16, 185, 129, 0.5)',
      badgeText: '#6EE7B7',
      cardBorderHover: 'rgba(16, 185, 129, 0.6)',
      glowColor: 'rgba(16, 185, 129, 0.25)',
    };
  }
  if (title.includes('office')) {
    return {
      primary: '#3B82F6',
      primaryHover: '#2563EB',
      primaryText: '#FFFFFF',
      accent: '#F59E0B',
      headerGradientFrom: 'rgba(30, 58, 138, 0.7)',
      headerGradientVia: 'rgba(59, 130, 246, 0.25)',
      badgeBg: 'rgba(59, 130, 246, 0.25)',
      badgeBorder: 'rgba(59, 130, 246, 0.5)',
      badgeText: '#93C5FD',
      cardBorderHover: 'rgba(59, 130, 246, 0.6)',
      glowColor: 'rgba(59, 130, 246, 0.25)',
    };
  }
  if (title.includes('dragon') || title.includes('thrones')) {
    return {
      primary: '#F59E0B',
      primaryHover: '#D97706',
      primaryText: '#0F172A',
      accent: '#EF4444',
      headerGradientFrom: 'rgba(127, 29, 29, 0.8)',
      headerGradientVia: 'rgba(245, 158, 11, 0.25)',
      badgeBg: 'rgba(245, 158, 11, 0.25)',
      badgeBorder: 'rgba(245, 158, 11, 0.5)',
      badgeText: '#FDE68A',
      cardBorderHover: 'rgba(245, 158, 11, 0.6)',
      glowColor: 'rgba(245, 158, 11, 0.25)',
    };
  }
  if (title.includes('ted lasso')) {
    return {
      primary: '#2563EB',
      primaryHover: '#1D4ED8',
      primaryText: '#FFFFFF',
      accent: '#FACC15',
      headerGradientFrom: 'rgba(30, 58, 138, 0.8)',
      headerGradientVia: 'rgba(250, 204, 21, 0.25)',
      badgeBg: 'rgba(37, 99, 235, 0.25)',
      badgeBorder: 'rgba(37, 99, 235, 0.5)',
      badgeText: '#93C5FD',
      cardBorderHover: 'rgba(37, 99, 235, 0.6)',
      glowColor: 'rgba(37, 99, 235, 0.25)',
    };
  }

  // Network Fallbacks
  const network = (show?.streamingService || '').toLowerCase();
  if (network.includes('hbo')) {
    return {
      primary: '#8B5CF6',
      primaryHover: '#7C3AED',
      primaryText: '#FFFFFF',
      accent: '#C084FC',
      headerGradientFrom: 'rgba(91, 33, 182, 0.7)',
      headerGradientVia: 'rgba(139, 92, 246, 0.25)',
      badgeBg: 'rgba(139, 92, 246, 0.25)',
      badgeBorder: 'rgba(139, 92, 246, 0.5)',
      badgeText: '#DDD6FE',
      cardBorderHover: 'rgba(139, 92, 246, 0.6)',
      glowColor: 'rgba(139, 92, 246, 0.25)',
    };
  }
  if (network.includes('netflix')) {
    return {
      primary: '#E50914',
      primaryHover: '#B91C1C',
      primaryText: '#FFFFFF',
      accent: '#F87171',
      headerGradientFrom: 'rgba(153, 27, 27, 0.75)',
      headerGradientVia: 'rgba(229, 9, 20, 0.25)',
      badgeBg: 'rgba(229, 9, 20, 0.25)',
      badgeBorder: 'rgba(229, 9, 20, 0.5)',
      badgeText: '#FCA5A5',
      cardBorderHover: 'rgba(229, 9, 20, 0.6)',
      glowColor: 'rgba(229, 9, 20, 0.25)',
    };
  }
  if (network.includes('disney')) {
    return {
      primary: '#0284C7',
      primaryHover: '#0369A1',
      primaryText: '#FFFFFF',
      accent: '#38BDF8',
      headerGradientFrom: 'rgba(12, 74, 110, 0.75)',
      headerGradientVia: 'rgba(2, 132, 199, 0.25)',
      badgeBg: 'rgba(2, 132, 199, 0.25)',
      badgeBorder: 'rgba(2, 132, 199, 0.5)',
      badgeText: '#BAE6FD',
      cardBorderHover: 'rgba(2, 132, 199, 0.6)',
      glowColor: 'rgba(2, 132, 199, 0.25)',
    };
  }
  if (network.includes('prime')) {
    return {
      primary: '#0EA5E9',
      primaryHover: '#0284C7',
      primaryText: '#0F172A',
      accent: '#F59E0B',
      headerGradientFrom: 'rgba(12, 74, 110, 0.75)',
      headerGradientVia: 'rgba(14, 165, 233, 0.25)',
      badgeBg: 'rgba(14, 165, 233, 0.25)',
      badgeBorder: 'rgba(14, 165, 233, 0.5)',
      badgeText: '#BAE6FD',
      cardBorderHover: 'rgba(14, 165, 233, 0.6)',
      glowColor: 'rgba(14, 165, 233, 0.25)',
    };
  }
  if (network.includes('hulu')) {
    return {
      primary: '#22C55E',
      primaryHover: '#16A34A',
      primaryText: '#0F172A',
      accent: '#4ADE80',
      headerGradientFrom: 'rgba(21, 128, 61, 0.75)',
      headerGradientVia: 'rgba(34, 197, 94, 0.25)',
      badgeBg: 'rgba(34, 197, 94, 0.25)',
      badgeBorder: 'rgba(34, 197, 94, 0.5)',
      badgeText: '#BBF7D0',
      cardBorderHover: 'rgba(34, 197, 94, 0.6)',
      glowColor: 'rgba(34, 197, 94, 0.25)',
    };
  }
  if (network.includes('apple')) {
    return {
      primary: '#38BDF8',
      primaryHover: '#0284C7',
      primaryText: '#0F172A',
      accent: '#E2E8F0',
      headerGradientFrom: 'rgba(30, 41, 59, 0.85)',
      headerGradientVia: 'rgba(56, 189, 248, 0.25)',
      badgeBg: 'rgba(56, 189, 248, 0.25)',
      badgeBorder: 'rgba(56, 189, 248, 0.5)',
      badgeText: '#BAE6FD',
      cardBorderHover: 'rgba(56, 189, 248, 0.6)',
      glowColor: 'rgba(56, 189, 248, 0.25)',
    };
  }

  // Deterministic HSL Hash generator based on title
  let hash = 0;
  for (let i = 0; i < (show?.title || '').length; i++) {
    hash = (show?.title || '').charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return {
    primary: `hsl(${hue}, 85%, 52%)`,
    primaryHover: `hsl(${hue}, 85%, 44%)`,
    primaryText: hue > 45 && hue < 180 ? '#0F172A' : '#FFFFFF',
    accent: `hsl(${(hue + 45) % 360}, 90%, 60%)`,
    headerGradientFrom: `hsla(${hue}, 75%, 18%, 0.8)`,
    headerGradientVia: `hsla(${hue}, 80%, 45%, 0.25)`,
    badgeBg: `hsla(${hue}, 80%, 50%, 0.25)`,
    badgeBorder: `hsla(${hue}, 80%, 50%, 0.5)`,
    badgeText: `hsl(${hue}, 90%, 82%)`,
    cardBorderHover: `hsla(${hue}, 80%, 50%, 0.6)`,
    glowColor: `hsla(${hue}, 80%, 50%, 0.25)`,
  };
};

export const ShowMerchModal: React.FC<ShowMerchModalProps> = ({
  show,
  isOpen,
  onClose,
  theme = 'dark',
  currentUser
}) => {
  const isAdmin = currentUser?.email?.trim().toLowerCase() === 'juliozaldivar@gmail.com';

  const [items, setItems] = useState<MerchandiseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'books' | 'clothing' | 'collectibles'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MerchandiseItem | null>(null);

  const [amazonApiStatus, setAmazonApiStatus] = useState<{ paapiConfigured: boolean; rapidApiConfigured: boolean; activeMode: string } | null>(null);
  const [isFetchingAmazon, setIsFetchingAmazon] = useState<boolean>(false);
  const [amazonFetchMsg, setAmazonFetchMsg] = useState<string>('');

  const [isDiscoveringBestSellers, setIsDiscoveringBestSellers] = useState<boolean>(false);
  const [discoverMsg, setDiscoverMsg] = useState<string>('');

  const [extractedPalette, setExtractedPalette] = useState<ShowThemePalette | null>(null);

  // Dynamic show image placeholder
  const showImageFallback = show?.bannerImage || 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=800';

  const getProxiedImageUrl = (url?: string) => {
    if (!url || url.trim() === '' || url.includes('unsplash.com')) {
      return showImageFallback;
    }
    if (url.startsWith('/') || url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return `/api/image-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  // Extract pixel color palette from show banner image dynamically
  useEffect(() => {
    if (!show || !show.bannerImage || (show.title || '').toLowerCase().includes('simpson')) {
      setExtractedPalette(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = getProxiedImageUrl(show.bannerImage);

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 32, 32);
        const data = ctx.getImageData(0, 0, 32, 32).data;
        let maxSat = -1;
        let bestR = 245, bestG = 158, bestB = 11;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
          if (a < 128) continue;
          const brightness = (r + g + b) / 3;
          if (brightness < 35 || brightness > 225) continue;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max === 0 ? 0 : (max - min) / max;

          if (sat > maxSat) {
            maxSat = sat;
            bestR = r;
            bestG = g;
            bestB = b;
          }
        }

        if (maxSat > 0.12) {
          const primary = `rgb(${bestR}, ${bestG}, ${bestB})`;
          const primaryHover = `rgb(${Math.max(0, bestR - 25)}, ${Math.max(0, bestG - 25)}, ${Math.max(0, bestB - 25)})`;
          const brightness = (bestR * 299 + bestG * 587 + bestB * 114) / 1000;
          const primaryText = brightness > 145 ? '#0F172A' : '#FFFFFF';

          setExtractedPalette({
            primary,
            primaryHover,
            primaryText,
            accent: `rgb(${Math.min(255, bestR + 40)}, ${Math.min(255, bestG + 40)}, ${Math.min(255, bestB + 40)})`,
            headerGradientFrom: `rgba(${Math.floor(bestR * 0.35)}, ${Math.floor(bestG * 0.35)}, ${Math.floor(bestB * 0.35)}, 0.8)`,
            headerGradientVia: `rgba(${bestR}, ${bestG}, ${bestB}, 0.25)`,
            badgeBg: `rgba(${bestR}, ${bestG}, ${bestB}, 0.25)`,
            badgeBorder: `rgba(${bestR}, ${bestG}, ${bestB}, 0.5)`,
            badgeText: brightness > 145 ? `rgb(${Math.floor(bestR * 0.7)}, ${Math.floor(bestG * 0.7)}, ${Math.floor(bestB * 0.7)})` : `rgb(${Math.min(255, bestR + 80)}, ${Math.min(255, bestG + 80)}, ${Math.min(255, bestB + 80)})`,
            cardBorderHover: `rgba(${bestR}, ${bestG}, ${bestB}, 0.6)`,
            glowColor: `rgba(${bestR}, ${bestG}, ${bestB}, 0.25)`,
          });
        }
      } catch (e) {
        // Fall back to signature/hash palette
      }
    };
  }, [show?.bannerImage, show?.title]);

  const palette: ShowThemePalette = extractedPalette || getShowPalette(show);

  const [newItem, setNewItem] = useState<{
    category: 'books' | 'clothing' | 'collectibles';
    title: string;
    price: string;
    imageUrl: string;
    amazonUrl: string;
    badge: string;
    description: string;
  }>({
    category: 'books',
    title: '',
    price: '$19.99',
    imageUrl: '',
    amazonUrl: '',
    badge: 'Popular',
    description: ''
  });

  useEffect(() => {
    if (!isOpen || !show) return;
    fetchMerchandise();
    fetch('/api/amazon/status')
      .then(r => r.json())
      .then(data => setAmazonApiStatus(data))
      .catch(() => {});
  }, [isOpen, show?.id, show?.title]);

  const handleFetchAmazonProduct = async (urlOrAsin: string, isEdit: boolean) => {
    if (!urlOrAsin.trim()) return;
    setIsFetchingAmazon(true);
    setAmazonFetchMsg('Connecting to server product lookup endpoint...');
    try {
      const res = await fetch('/api/amazon/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlOrAsin, showTitle: show.title })
      });
      const data = await res.json();
      if (res.ok && data.productDetails) {
        const p = data.productDetails;
        if (isEdit && editingItem) {
          setEditingItem({
            ...editingItem,
            title: p.title || editingItem.title,
            price: p.price || editingItem.price,
            imageUrl: p.imageUrl || editingItem.imageUrl,
            amazonUrl: p.amazonUrl || editingItem.amazonUrl,
            description: p.description || editingItem.description,
            badge: p.badge || editingItem.badge
          });
        } else {
          setNewItem(prev => ({
            ...prev,
            title: p.title || prev.title,
            price: p.price || prev.price,
            imageUrl: p.imageUrl || prev.imageUrl,
            amazonUrl: p.amazonUrl || prev.amazonUrl,
            description: p.description || prev.description,
            badge: p.badge || prev.badge
          }));
        }
        setAmazonFetchMsg('Product details synced with Amazon!');
      } else {
        setAmazonFetchMsg(data.error || 'Failed to auto-fetch from Amazon link.');
      }
    } catch (e: any) {
      setAmazonFetchMsg('Error calling Amazon server endpoint.');
    } finally {
      setIsFetchingAmazon(false);
      setTimeout(() => setAmazonFetchMsg(''), 4000);
    }
  };

  const handleDiscoverBestSellers = async () => {
    setIsDiscoveringBestSellers(true);
    setDiscoverMsg(`Searching Amazon for top best sellers for "${show.title}" using Gemini AI Grounding...`);
    try {
      const res = await fetch('/api/merchandise/discover-bestsellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showTitle: show.title, bannerUrl: show.bannerImage })
      });
      const data = await res.json();
      if (res.ok && data.items && data.items.length > 0) {
        setItems(prev => {
          const itemMap = new Map();
          data.items.forEach((item: MerchandiseItem) => itemMap.set(item.id, item));
          prev.forEach((item: MerchandiseItem) => {
            if (!itemMap.has(item.id)) itemMap.set(item.id, item);
          });
          return Array.from(itemMap.values());
        });
        setDiscoverMsg(`Successfully discovered & saved ${data.items.length} Amazon best sellers!`);
      } else {
        setDiscoverMsg('Could not find new best sellers right now.');
      }
    } catch (e) {
      console.error('Error discovering best sellers:', e);
      setDiscoverMsg('Error querying AI best sellers endpoint.');
    } finally {
      setIsDiscoveringBestSellers(false);
      setTimeout(() => setDiscoverMsg(''), 5000);
    }
  };

  const fetchMerchandise = async () => {
    setLoading(true);
    try {
      const bannerParam = encodeURIComponent(show.bannerImage || '');
      const res = await fetch(`/api/merchandise?show=${encodeURIComponent(show.title)}&banner=${bannerParam}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (e) {
      console.error('Failed to fetch merchandise:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!editingItem || !editingItem.title || !editingItem.amazonUrl) return;

    try {
      const res = await fetch('/api/merchandise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem)
      });
      if (res.ok) {
        setItems(prev => prev.map(i => i.id === editingItem.id ? editingItem : i));
        setEditingItem(null);
      }
    } catch (e) {
      console.error('Failed to update merchandise item:', e);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!newItem.title || !newItem.amazonUrl) return;

    const payload: MerchandiseItem = {
      id: `custom-item-${Date.now()}`,
      showTitle: show.title,
      category: newItem.category,
      title: newItem.title,
      price: newItem.price.startsWith('$') ? newItem.price : `$${newItem.price}`,
      rating: '4.8',
      imageUrl: newItem.imageUrl || showImageFallback,
      amazonUrl: newItem.amazonUrl.startsWith('http') ? newItem.amazonUrl : `https://${newItem.amazonUrl}`,
      badge: newItem.badge || 'Amazon Pick',
      description: newItem.description
    };

    try {
      const res = await fetch('/api/merchandise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setItems(prev => [payload, ...prev]);
        setShowAddModal(false);
        setNewItem({
          category: 'books',
          title: '',
          price: '$19.99',
          imageUrl: '',
          amazonUrl: '',
          badge: 'Popular',
          description: ''
        });
      }
    } catch (e) {
      console.error('Failed to add merchandise item:', e);
    }
  };

  if (!isOpen) return null;

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = !searchQuery.trim() || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categoryCounts = {
    all: items.length,
    books: items.filter(i => i.category === 'books').length,
    clothing: items.filter(i => i.category === 'clothing').length,
    collectibles: items.filter(i => i.category === 'collectibles').length,
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-4 md:p-6 backdrop-blur-md overflow-y-auto ${
      theme === 'dark' ? 'bg-black/85' : 'bg-slate-900/60'
    }`}>
      <div 
        className={`relative w-full max-w-5xl max-h-[96vh] sm:max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-[#0E1015] border-white/10 text-slate-100' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        style={{
          boxShadow: theme === 'dark' 
            ? `0 25px 60px -15px ${palette.glowColor}, 0 0 0 1px ${palette.badgeBorder}`
            : `0 20px 40px -15px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(226, 232, 240, 1)`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hero Banner - Custom show theme colors */}
        <div 
          className={`relative p-3 sm:p-6 md:p-7 border-b overflow-hidden shrink-0 ${
            theme === 'dark' ? 'border-white/10' : 'border-slate-200'
          }`}
          style={{
            background: theme === 'dark'
              ? `linear-gradient(135deg, ${palette.headerGradientFrom} 0%, ${palette.headerGradientVia} 55%, rgba(14, 16, 21, 0.95) 100%)`
              : `linear-gradient(135deg, ${palette.headerGradientFrom} 0%, ${palette.headerGradientVia} 55%, rgba(248, 250, 252, 0.95) 100%)`
          }}
        >
          <div 
            className="absolute inset-0 opacity-20 bg-cover bg-center filter blur-xl scale-110 pointer-events-none"
            style={{ backgroundImage: `url(${show.bannerImage || showImageFallback})` }}
          />

          <div className="relative z-10 flex flex-row items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
              {(show.bannerImage || showImageFallback) && (
                <img 
                  src={show.bannerImage || showImageFallback} 
                  alt={show.title} 
                  className={`w-10 h-14 sm:w-16 sm:h-24 md:w-20 md:h-28 object-cover rounded-lg sm:rounded-xl shadow-xl border shrink-0 block ${
                    theme === 'dark' ? 'border-white/20' : 'border-slate-300'
                  }`}
                  style={{
                    boxShadow: `0 10px 25px ${palette.glowColor}`
                  }}
                  onError={(e) => {
                    e.currentTarget.src = showImageFallback;
                  }}
                />
              )}

              <div className="flex flex-col justify-center min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1.5">
                  <span 
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border backdrop-blur-md"
                    style={{
                      backgroundColor: theme === 'dark' ? palette.badgeBg : 'rgba(255, 255, 255, 0.9)',
                      borderColor: palette.badgeBorder,
                      color: theme === 'dark' ? palette.badgeText : '#0F172A',
                    }}
                  >
                    <AmazonShoppingBagIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" style={{ color: palette.primary }} />
                    <span className="hidden sm:inline">Amazon Merchandise Hub</span>
                    <span className="sm:hidden">Amazon Hub</span>
                  </span>
                </div>
                <h2 className={`text-base sm:text-2xl md:text-3xl font-black tracking-tight leading-tight break-words whitespace-normal drop-shadow-md ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  {show.title}
                </h2>
                <p className={`hidden sm:block text-xs sm:text-sm mt-1 max-w-xl leading-relaxed ${
                  theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  Explore official & fan-favorite Amazon merchandise styled for <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{show.title}</span>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {isAdmin && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black flex items-center gap-1 transition-all shadow-md hover:scale-105 cursor-pointer"
                  style={{
                    backgroundColor: palette.primary,
                    color: palette.primaryText,
                    boxShadow: `0 4px 14px ${palette.glowColor}`
                  }}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span className="hidden sm:inline">Add Item</span>
                  <span className="sm:hidden">Add</span>
                </button>
              )}
              <button
                onClick={onClose}
                className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-colors cursor-pointer ${
                  theme === 'dark' 
                    ? 'bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white' 
                    : 'bg-black/10 hover:bg-black/20 text-slate-700 hover:text-slate-950'
                }`}
                title="Close"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Search & Categories Bar */}
          <div className={`mt-2.5 pt-2 sm:mt-6 sm:pt-4 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 ${
            theme === 'dark' ? 'border-white/10' : 'border-slate-200'
          }`}>
            {/* Category Tabs */}
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1`}
                style={
                  activeCategory === 'all'
                    ? { backgroundColor: palette.primary, color: palette.primaryText, boxShadow: `0 4px 12px ${palette.glowColor}` }
                    : { backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)', color: theme === 'dark' ? '#CBD5E1' : '#334155' }
                }
              >
                <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>All ({categoryCounts.all})</span>
              </button>

              <button
                onClick={() => setActiveCategory('books')}
                className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1`}
                style={
                  activeCategory === 'books'
                    ? { backgroundColor: palette.primary, color: palette.primaryText, boxShadow: `0 4px 12px ${palette.glowColor}` }
                    : { backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)', color: theme === 'dark' ? '#CBD5E1' : '#334155' }
                }
              >
                <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Books & Novels ({categoryCounts.books})</span>
                <span className="sm:hidden">Books ({categoryCounts.books})</span>
              </button>

              <button
                onClick={() => setActiveCategory('clothing')}
                className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1`}
                style={
                  activeCategory === 'clothing'
                    ? { backgroundColor: palette.primary, color: palette.primaryText, boxShadow: `0 4px 12px ${palette.glowColor}` }
                    : { backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)', color: theme === 'dark' ? '#CBD5E1' : '#334155' }
                }
              >
                <Shirt className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Clothing & Apparel ({categoryCounts.clothing})</span>
                <span className="sm:hidden">Apparel ({categoryCounts.clothing})</span>
              </button>

              <button
                onClick={() => setActiveCategory('collectibles')}
                className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1`}
                style={
                  activeCategory === 'collectibles'
                    ? { backgroundColor: palette.primary, color: palette.primaryText, boxShadow: `0 4px 12px ${palette.glowColor}` }
                    : { backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)', color: theme === 'dark' ? '#CBD5E1' : '#334155' }
                }
              >
                <Package className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Collectibles & Funkos ({categoryCounts.collectibles})</span>
                <span className="sm:hidden">Collectibles ({categoryCounts.collectibles})</span>
              </button>
            </div>

            {/* Search Box */}
            <div className="relative min-w-[160px] sm:min-w-[220px]">
              <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
              <input 
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-8 pr-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-medium border outline-none transition-colors ${
                  theme === 'dark' 
                    ? 'bg-black/40 text-white placeholder-slate-500' 
                    : 'bg-slate-100/90 text-slate-900 placeholder-slate-400'
                }`}
                style={{
                  borderColor: searchQuery 
                    ? palette.badgeBorder 
                    : theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(203, 213, 225, 1)'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
          {loading ? (
            <div className="py-12 sm:py-20 flex flex-col items-center justify-center text-center">
              <RefreshCw className="w-7 h-7 sm:w-8 sm:h-8 animate-spin mb-3" style={{ color: palette.primary }} />
              <p className={`text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Loading Amazon merchandise...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <ShoppingBag className={`w-10 h-10 sm:w-12 sm:h-12 mb-3 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-300'}`} />
              <h3 className={`text-base sm:text-lg font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>No items found</h3>
              <p className={`text-xs mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {searchQuery ? `No merchandise matches "${searchQuery}"` : 'No items added in this category yet.'}
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                }`}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`group relative flex flex-col rounded-xl sm:rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                    theme === 'dark'
                      ? 'bg-[#14161D] border-white/10'
                      : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                  }`}
                  style={{
                    borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = palette.badgeBorder;
                    e.currentTarget.style.boxShadow = `0 12px 28px ${palette.glowColor}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(226, 232, 240, 1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Image Frame */}
                  <div className={`relative aspect-[4/3] p-1.5 sm:p-2 overflow-hidden flex items-center justify-center ${
                    theme === 'dark' ? 'bg-neutral-950/80' : 'bg-slate-100'
                  }`}>
                    <img
                      src={getProxiedImageUrl(item.imageUrl)}
                      alt={item.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.dataset.failed) return;
                        target.dataset.failed = 'true';
                        target.src = showImageFallback;
                      }}
                    />
                    <div className={`absolute inset-0 opacity-80 pointer-events-none ${
                      theme === 'dark' ? 'bg-gradient-to-t from-black/80 via-transparent to-transparent' : 'bg-gradient-to-t from-slate-900/60 via-transparent to-transparent'
                    }`} />
                    
                    {/* Category & Badge */}
                    <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 flex items-center gap-1">
                      <span 
                        className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider backdrop-blur-md border"
                        style={{
                          backgroundColor: theme === 'dark' ? 'rgba(10, 10, 15, 0.85)' : 'rgba(255, 255, 255, 0.95)',
                          borderColor: palette.badgeBorder,
                          color: theme === 'dark' ? palette.badgeText : '#0F172A',
                        }}
                      >
                        {item.category === 'books' ? 'Book' : item.category === 'clothing' ? 'Apparel' : 'Collectible'}
                      </span>
                      {item.badge && (
                        <span 
                          className="hidden xs:inline-block px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-extrabold"
                          style={{
                            backgroundColor: palette.primary,
                            color: palette.primaryText,
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {/* Edit Image / Item Quick Button */}
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItem({ ...item });
                        }}
                        className={`absolute top-1.5 right-1.5 sm:top-3 sm:right-3 p-1 sm:p-1.5 rounded-md sm:rounded-lg backdrop-blur-md transition-colors border cursor-pointer ${
                          theme === 'dark' 
                            ? 'bg-black/70 hover:bg-white text-slate-300 hover:text-neutral-950 border-white/10' 
                            : 'bg-white/90 hover:bg-slate-900 text-slate-700 hover:text-white border-slate-200'
                        }`}
                        title="Edit Image or Item Details"
                      >
                        <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    )}

                    {/* Price Tag */}
                    <div className="absolute bottom-1.5 left-1.5 sm:bottom-3 sm:left-3 font-black text-sm sm:text-xl text-white drop-shadow-md">
                      {item.price}
                    </div>

                    {/* Prime badge */}
                    <div className={`absolute bottom-1.5 right-1.5 sm:bottom-3 sm:right-3 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-extrabold flex items-center gap-0.5 ${
                      theme === 'dark'
                        ? 'bg-sky-950/80 border border-sky-400/40 text-sky-300'
                        : 'bg-sky-100/90 border border-sky-300 text-sky-800'
                    }`}>
                      <span className={theme === 'dark' ? 'text-sky-400 italic font-black' : 'text-sky-700 italic font-black'}>✓ prime</span>
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
                    <div>
                      <h4 className={`font-bold text-xs sm:text-sm line-clamp-2 leading-snug transition-colors ${
                        theme === 'dark' ? 'text-white' : 'text-slate-900'
                      }`}>
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className={`hidden sm:block text-xs line-clamp-2 mt-1.5 leading-relaxed ${
                          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className={`pt-1.5 sm:pt-2 border-t flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-1.5 sm:gap-2 ${
                      theme === 'dark' ? 'border-white/5' : 'border-slate-100'
                    }`}>
                      <div className={`flex items-center gap-1 text-[11px] sm:text-xs font-bold ${
                        theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                      }`}>
                        <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
                        <span>{item.rating || '4.8'}</span>
                      </div>

                      <a
                        href={item.amazonUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer"
                        className="w-full xs:w-auto text-center px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black flex items-center justify-center gap-1 transition-all shadow-sm hover:scale-105 cursor-pointer"
                        style={{
                          backgroundColor: palette.primary,
                          color: palette.primaryText,
                          boxShadow: `0 2px 8px ${palette.glowColor}`
                        }}
                      >
                        <span>Buy on Amazon</span>
                        <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`p-4 border-t flex items-center justify-between text-xs ${
          theme === 'dark'
            ? 'border-white/10 bg-black/40 text-slate-400'
            : 'border-slate-200 bg-slate-50 text-slate-600'
        }`}>
          <div className="flex items-center gap-2">
            <AmazonShoppingBagIcon className="w-4 h-4" style={{ color: palette.primary }} />
            <span>Curated Amazon Merchandise • {filteredItems.length} items listed</span>
          </div>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            }`}
          >
            Done
          </button>
        </div>
      </div>

      {/* Add Item Sub-Modal */}
      {isAdmin && showAddModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className={`w-full max-w-md border rounded-2xl p-6 shadow-2xl relative ${
            theme === 'dark' ? 'bg-[#12141A] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black flex items-center gap-2" style={{ color: palette.primary }}>
                <Plus className="w-5 h-5" />
                Add Amazon Product
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className={theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4 text-xs">
              <div>
                <label className={`block font-bold mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                  className={`w-full border rounded-xl px-3 py-2 outline-none ${
                    theme === 'dark' ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="books">Books & Graphic Novels</option>
                  <option value="clothing">Clothing & Apparel</option>
                  <option value="collectibles">Collectibles, Keychains & Funkos</option>
                </select>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Product Title</label>
                <input
                  type="text"
                  required
                  placeholder={`e.g. ${show.title} Official Collector Item`}
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 outline-none ${
                    theme === 'dark' ? 'bg-black/50 border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Price</label>
                  <input
                    type="text"
                    required
                    placeholder="$24.99"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 outline-none ${
                      theme === 'dark' ? 'bg-black/50 border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block font-bold mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Badge (Optional)</label>
                  <input
                    type="text"
                    placeholder="Funko Pop / Hardcover"
                    value={newItem.badge}
                    onChange={(e) => setNewItem({ ...newItem, badge: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 outline-none ${
                      theme === 'dark' ? 'bg-black/50 border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Amazon Product URL or ASIN</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://www.amazon.com/dp/B08XWN7J5L or ASIN"
                    value={newItem.amazonUrl}
                    onChange={(e) => setNewItem({ ...newItem, amazonUrl: e.target.value })}
                    className={`flex-1 border rounded-xl px-3 py-2 outline-none font-mono text-[11px] ${
                      theme === 'dark' ? 'bg-black/50 border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                  <button
                    type="button"
                    disabled={isFetchingAmazon || !newItem.amazonUrl}
                    onClick={() => handleFetchAmazonProduct(newItem.amazonUrl, false)}
                    className="px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer text-xs"
                    style={{
                      backgroundColor: palette.badgeBg,
                      borderColor: palette.badgeBorder,
                      color: palette.badgeText,
                    }}
                  >
                    {isFetchingAmazon ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Auto-Fetch
                  </button>
                </div>
                {amazonFetchMsg && (
                  <p className="mt-1 text-[11px] font-medium animate-pulse" style={{ color: palette.primary }}>{amazonFetchMsg}</p>
                )}
              </div>

              <div>
                <label className={`block font-bold mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="Leave empty to use show image"
                  value={newItem.imageUrl}
                  onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 outline-none ${
                    theme === 'dark' ? 'bg-black/50 border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Official collectible merchandise item..."
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 outline-none resize-none ${
                    theme === 'dark' ? 'bg-black/50 border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 rounded-xl font-bold ${
                    theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-black shadow-md cursor-pointer"
                  style={{
                    backgroundColor: palette.primary,
                    color: palette.primaryText
                  }}
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Merchandise Item Modal */}
      {isAdmin && editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 ${
            theme === 'dark' ? 'bg-[#12141A] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
              <h3 className="text-base font-black flex items-center gap-2" style={{ color: palette.primary }}>
                <Edit className="w-4 h-4" />
                Edit Merchandise Image & Details
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className={`p-1 rounded-lg ${theme === 'dark' ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateItem} className="space-y-3 text-xs">
              <div>
                <label className={`block font-bold mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Product Title</label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 outline-none ${
                    theme === 'dark' ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                    className={`w-full border rounded-xl px-3 py-2 outline-none ${
                      theme === 'dark' ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="books">Books</option>
                    <option value="clothing">Apparel / Clothing</option>
                    <option value="collectibles">Collectibles / Toys</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Price</label>
                  <input
                    type="text"
                    required
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                    className={`w-full border rounded-xl px-3 py-2 outline-none ${
                      theme === 'dark' ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Image URL (Product photo link or leave empty for show poster)</label>
                <input
                  type="url"
                  placeholder="https://m.media-amazon.com/images/..."
                  value={editingItem.imageUrl}
                  onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 outline-none font-mono text-[11px] ${
                    theme === 'dark' ? 'bg-black/50 border-white/10 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <div className={`mt-2 flex items-center gap-3 p-2 rounded-xl border ${
                  theme === 'dark' ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'
                }`}>
                  <img
                    src={getProxiedImageUrl(editingItem.imageUrl)}
                    alt="Preview"
                    className={`w-12 h-12 object-contain rounded-lg border ${
                      theme === 'dark' ? 'bg-black/60 border-white/10' : 'bg-white border-slate-200'
                    }`}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = showImageFallback;
                    }}
                  />
                  <span className={`text-[10px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Live Image Preview</span>
                </div>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Amazon Product Page Link or ASIN</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={editingItem.amazonUrl}
                    onChange={(e) => setEditingItem({ ...editingItem, amazonUrl: e.target.value })}
                    className={`flex-1 border rounded-xl px-3 py-2 outline-none font-mono text-[11px] ${
                      theme === 'dark' ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                  <button
                    type="button"
                    disabled={isFetchingAmazon || !editingItem.amazonUrl}
                    onClick={() => handleFetchAmazonProduct(editingItem.amazonUrl, true)}
                    className="px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer text-xs"
                    style={{
                      backgroundColor: palette.badgeBg,
                      borderColor: palette.badgeBorder,
                      color: palette.badgeText,
                    }}
                  >
                    {isFetchingAmazon ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    Sync with Amazon
                  </button>
                </div>
                {amazonFetchMsg && (
                  <p className="mt-1 text-[11px] font-medium animate-pulse" style={{ color: palette.primary }}>{amazonFetchMsg}</p>
                )}
              </div>

              <div>
                <label className={`block font-bold mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Short Description</label>
                <textarea
                  rows={2}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className={`w-full border rounded-xl px-3 py-2 outline-none resize-none ${
                    theme === 'dark' ? 'bg-black/50 border-white/10 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className={`px-4 py-2 rounded-xl font-bold ${
                    theme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-black shadow-md cursor-pointer"
                  style={{
                    backgroundColor: palette.primary,
                    color: palette.primaryText
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
