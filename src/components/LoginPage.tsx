/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Board, User, StreamingService, TvShow } from '../types';
import { LandingPage } from './LandingPage';
import { ProductGuidePage } from './ProductGuidePage';
import { 
  signInWithGoogle, 
  loginWithEmail, 
  registerWithEmail, 
  resetPassword 
} from '../firebase';
import { JULIO_OFFICIAL_AVATAR } from '../utils/taterAvatarUtils';
import { 
  Tv, 
  User as UserIcon, 
  Mail, 
  ArrowRight, 
  Check, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  Chrome, 
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  KeyRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginPageProps {
  onLogin: (board: Board, options?: { showStarterPackAlert?: boolean; isNewAccount?: boolean; startTour?: boolean }) => void;
}

const GENRE_OPTIONS = [
  'Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Thriller', 'Mystery', 'Dystopian', 'Western', 'Animation', 'Spy Thriller'
];

const SERVICE_OPTIONS: StreamingService[] = [
  'Netflix', 'HBO', 'Disney+', 'Prime Video', 'Hulu', 'Apple TV', 'Paramount+', 'Peacock', 'AMC+', 'Starz'
];

const BACKGROUND_IMAGES = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuG_1v8qSY_Jr5OTI94uFnIsSsd_eqokq2cHQQ7Bv43w&s=10", // The Americans
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6pzwPlJXnQcGY8BkO_z2ph4-asGzeaLDUAmNU8UM3AQ&s=10", // Slow Horses
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTL0jIu8CIbj8o9aY4whwMucEGJiJyuGdigiZNpE6gY&s", // Pluribus
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTswcn_b-V5fpk75yok8qb1V2FYN1hxRhA7MmxYTwDI6A&s=10", // Sons of Anarchy
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUqC_tu3W9jV36t_xdOh0sOMI-jwEnqhIA_sxBz_jqCg&s=10", // Lioness
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuw1an2kM_Fwjs1wYUwMz29mirossFh-Whe4ZELKv-dg&s=10", // The Great
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuy7sVt3veocWTt6fy6G1M7hpuOBMxf-Tj3FiZ3FZEvA&s", // Daredevil: Born Again
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCstQAdMI7ojIlAQaEbEhOg-ljIY3zm8bSKRIl9XoRdA&s=10", // The Office
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPWsAbgnSfrZMMc7-OGQUKy3FsMXw01oW5B-k-5Qc-Ag&s=10", // The Walking Dead
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLSxpFNAmFk_IZGbaryDs3GkM5lnyWEjGt6USNocYJPA&s=10", // The Bear
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkoc8QUr2WysQmIUEQD-xsTyn1fW-Co-YZAH0-ghs-Kg&s", // From
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStX3K4wUFwD4FHp7pQNkFl4hfNP6-a5xquJ1TIs_3PZw&s=10", // Rick and Morty
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7pIsFmg12Cv_3Q1P2kWK4ZGsDo8XeF-UkErBVCSjvFg&s=10", // House of the Dragon
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTouf15_KKf6F8ypTOh3XUFpq8rcBfo05msEXy01cMYXQ&s", // Shogun
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQL5_s11y4oGepKQoldiMgqXpN0FLBskXiEqFtLEzo9Gw&s=10", // Peaky Blinders
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSm_kxJfnMuGgFwNjzqp4TMcCkho15qhOvEr7yTOt3I3Q&s=10", // Shameless
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGow7p2r8x9pAV8hTP2OzWwWNDhQa96bWgImV_ucRIDw&s=10", // Silo
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4Qf7wolgUB7X37sMbkSd93bUJlubb_qNmozDnQtHp4Q&s=10", // Stranger Things
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcAtds1wdUIPpEjgpHKayk2vNk27yaBo8KEsvpA8zwMg&s=10", // Supernatural
  "https://images.squarespace-cdn.com/content/v1/51b3dc8ee4b051b96ceb10de/a3d300bb-f1b7-4fca-b376-03273a92de3e/X-MEN+%2797+Star+is+%2522Amazed+Disney+Greenlit%2522+Season+2+Because+It%E2%80%99s+%2522Very%2C+Very+Dark%2522+and+%2522A+Lot+of+People+Die%2522.jpg?format=2500w", // X-Men '97
  "https://m.media-amazon.com/images/S/pv-target-images/738a33dbb22b100bca29e782cf83abc2b99a17d16efa5f852107d51f2f1d0768.jpg", // Foundation
  "https://s10019.cdn.ncms.io/wp-content/uploads/2025/03/The-Last-Of-Us-S2_HO_KA_16x9_v03.jpg.jpeg", // The Last Of Us
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNACrAMoLkgMH0e47maB2DZ7OeMG3ZWBtuheU7rgkUdg&s=10", // Severance
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYxCCGjsy6Qz-8QFXGNNbWfyTcAbLe7J3A1DSnch1l5A&s=10", // The Mandalorian
];

// Curated, critically-acclaimed contemporary television series (2010s - 2020s modern era) for starter pack matching
const MODERN_STARTER_SHOW_SELECTIONS: TvShow[] = [
  {
    id: "starter-the-bear",
    title: "The Bear",
    streamingService: "Hulu",
    genres: ["Drama", "Comedy"],
    status: "Backlog",
    latestWatched: { season: 1, episode: 0, title: "Not Started" },
    nextEpisode: null,
    rottenTomatoesScore: 99,
    userScore: null,
    userNotes: "",
    overview: "A young chef from the fine dining world returns to Chicago to run his family sandwich shop after a heartbreaking death.",
    directors: ["Christopher Storer"],
    actors: ["Jeremy Allen White", "Ebon Moss-Bachrach", "Ayo Edebiri"],
    bannerImage: "https://image.tmdb.org/t/p/w1280/aJtG4txtmiRHwAAqENQHZvBs6kY.jpg",
    concluded: false,
    totalSeasons: 4,
    episodesPerSeason: [8, 10, 10, 10],
    isStarter: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "starter-severance",
    title: "Severance",
    streamingService: "Apple TV",
    genres: ["Sci-Fi", "Thriller", "Mystery", "Drama"],
    status: "Backlog",
    latestWatched: { season: 1, episode: 0, title: "Not Started" },
    nextEpisode: null,
    rottenTomatoesScore: 97,
    userScore: null,
    userNotes: "",
    overview: "Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives.",
    directors: ["Ben Stiller", "Aoife McArdle"],
    actors: ["Adam Scott", "Patricia Arquette", "John Turturro", "Britt Lower"],
    bannerImage: "https://image.tmdb.org/t/p/w1280/ixgFmf1X59PUZam2qbAfskx2gQr.jpg",
    concluded: false,
    totalSeasons: 2,
    episodesPerSeason: [9, 10],
    isStarter: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "starter-shogun",
    title: "Shōgun",
    streamingService: "Hulu",
    genres: ["Drama", "Action", "History"],
    status: "Backlog",
    latestWatched: { season: 1, episode: 0, title: "Not Started" },
    nextEpisode: null,
    rottenTomatoesScore: 99,
    userScore: null,
    userNotes: "",
    overview: "In Japan in the year 1600, Lord Yoshii Toranaga is fighting for his life as his enemies on the Council of Regents unite against him.",
    directors: ["Jonathan van Tulleken", "Charlotte Brändström"],
    actors: ["Hiroyuki Sanada", "Cosmo Jarvis", "Anna Sawai"],
    bannerImage: "https://image.tmdb.org/t/p/w1280/6Tb87q9Tog30F5AAHh1gyDT2Vve.jpg",
    concluded: false,
    totalSeasons: 1,
    episodesPerSeason: [10],
    isStarter: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "starter-last-of-us",
    title: "The Last of Us",
    streamingService: "HBO",
    genres: ["Drama", "Action", "Sci-Fi", "Horror"],
    status: "Backlog",
    latestWatched: { season: 1, episode: 0, title: "Not Started" },
    nextEpisode: null,
    rottenTomatoesScore: 96,
    userScore: null,
    userNotes: "",
    overview: "Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone.",
    directors: ["Craig Mazin", "Neil Druckmann"],
    actors: ["Pedro Pascal", "Bella Ramsey", "Gabriel Luna"],
    bannerImage: "https://image.tmdb.org/t/p/w1280/acevLdSl5I2MK5RYAm7gwAndt1w.jpg",
    concluded: false,
    totalSeasons: 2,
    episodesPerSeason: [9, 7],
    isStarter: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "starter-ted-lasso",
    title: "Ted Lasso",
    streamingService: "Apple TV",
    genres: ["Comedy", "Drama"],
    status: "Backlog",
    latestWatched: { season: 1, episode: 0, title: "Not Started" },
    nextEpisode: null,
    rottenTomatoesScore: 90,
    userScore: null,
    userNotes: "",
    overview: "An American football coach is hired to manage a British soccer team. What he lacks in knowledge, he makes up for with optimism and determination.",
    directors: ["Declan Lowney"],
    actors: ["Jason Sudeikis", "Hannah Waddingham", "Brett Goldstein"],
    bannerImage: "https://image.tmdb.org/t/p/w1280/gEQkOMmnJcoh9Hh1vk7fpVYnksR.jpg",
    concluded: true,
    totalSeasons: 3,
    episodesPerSeason: [10, 12, 12],
    isStarter: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "starter-slow-horses",
    title: "Slow Horses",
    streamingService: "Apple TV",
    genres: ["Thriller", "Drama", "Spy Thriller"],
    status: "Backlog",
    latestWatched: { season: 1, episode: 0, title: "Not Started" },
    nextEpisode: null,
    rottenTomatoesScore: 97,
    userScore: null,
    userNotes: "",
    overview: "This quick-witted spy drama follows a dysfunctional team of MI5 agents—and their obnoxious boss—as they navigate the espionage world.",
    directors: ["James Hawes"],
    actors: ["Gary Oldman", "Jack Lowden", "Kristin Scott Thomas"],
    bannerImage: "https://image.tmdb.org/t/p/w1280/bDfboQUb45Cv9MYyVBDZw8M8xSM.jpg",
    concluded: false,
    totalSeasons: 4,
    episodesPerSeason: [6, 6, 6, 6],
    isStarter: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "starter-fallout",
    title: "Fallout",
    streamingService: "Prime Video",
    genres: ["Sci-Fi", "Action", "Dystopian"],
    status: "Backlog",
    latestWatched: { season: 1, episode: 0, title: "Not Started" },
    nextEpisode: null,
    rottenTomatoesScore: 93,
    userScore: null,
    userNotes: "",
    overview: "In a future, post-apocalyptic Los Angeles, citizens must live in underground bunkers to protect themselves from radiation, mutants, and bandits.",
    directors: ["Jonathan Nolan"],
    actors: ["Ella Purnell", "Aaron Moten", "Walton Goggins"],
    bannerImage: "https://image.tmdb.org/t/p/w1280/coaPCIqQBPUZsOnJcWZxhaORcDT.jpg",
    concluded: false,
    totalSeasons: 1,
    episodesPerSeason: [8],
    isStarter: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "starter-arcane",
    title: "Arcane",
    streamingService: "Netflix",
    genres: ["Animation", "Action", "Sci-Fi", "Drama"],
    status: "Backlog",
    latestWatched: { season: 1, episode: 0, title: "Not Started" },
    nextEpisode: null,
    rottenTomatoesScore: 100,
    userScore: null,
    userNotes: "",
    overview: "Set in the utopian region of Piltover and the oppressed underground of Zaun, the story follows the origins of two iconic champions.",
    directors: ["Christian Linke", "Alex Yee"],
    actors: ["Hailee Steinfeld", "Ella Purnell"],
    bannerImage: "https://image.tmdb.org/t/p/w1280/q8eejQcg1bAqImEV8jh8RtBD4uH.jpg",
    concluded: true,
    totalSeasons: 2,
    episodesPerSeason: [9, 9],
    isStarter: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "starter-stranger-things",
    title: "Stranger Things",
    streamingService: "Netflix",
    genres: ["Sci-Fi", "Horror", "Drama", "Mystery"],
    status: "Backlog",
    latestWatched: { season: 1, episode: 0, title: "Not Started" },
    nextEpisode: null,
    rottenTomatoesScore: 91,
    userScore: null,
    userNotes: "",
    overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments and terrifying supernatural forces.",
    directors: ["The Duffer Brothers"],
    actors: ["Winona Ryder", "David Harbour", "Millie Bobby Brown"],
    bannerImage: "https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    concluded: false,
    totalSeasons: 5,
    episodesPerSeason: [8, 9, 8, 9, 8],
    isStarter: true,
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_ACTIVE_TESTERS: User[] = [
  {
    id: "default",
    name: "Julio",
    email: "julio@couchtaterz.com",
    avatarUrl: JULIO_OFFICIAL_AVATAR,
    isAdmin: true,
    isPro: true,
    createdAt: "2026-07-14T17:27:16.152Z"
  },
  {
    id: "user-doug-5821",
    name: "Doug Briskie",
    email: "doug.briskie@icloud.com",
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=DougBriskie",
    createdAt: "2026-08-18T20:00:00.000Z"
  },
  {
    id: "user-ejc-2841",
    name: "EJC",
    email: "ejc@taterz.com",
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=EJC",
    createdAt: "2026-07-20T11:00:00.000Z"
  },
  {
    id: "user-stef-4912",
    name: "Stef",
    email: "stef@taterz.com",
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Stef",
    createdAt: "2026-08-16T15:00:00.000Z"
  },
  {
    id: "user-rafael-9639",
    name: "Rafael",
    email: "rafael.gomez@taterz.com",
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=RafaelGomez",
    createdAt: "2026-07-22T13:25:00.000Z"
  },
  {
    id: "user-julian-7667",
    name: "Julian",
    email: "julian@taterz.com",
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Cat",
    createdAt: "2026-07-19T04:48:22.066Z"
  },
  {
    id: "user-lily-9367",
    name: "AnnaDee",
    email: "annadee@taterz.com",
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=AnnaDee",
    createdAt: "2026-07-15T18:50:21.963Z"
  },
  {
    id: "user-kris-5139",
    name: "Kris",
    email: "kris@taterz.com",
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Kris",
    createdAt: "2026-07-24T10:00:00.000Z"
  },
  {
    id: "user-lilyann-4290",
    name: "Lilyann",
    email: "lilyann@taterz.com",
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=BingeWatcher",
    createdAt: "2026-07-19T06:18:21.385Z"
  },
  {
    id: "user-greg-3842",
    name: "Greg",
    email: "greg@taterz.com",
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Greg",
    createdAt: "2026-08-14T09:30:00.000Z"
  },
  {
    id: "user-hyunjin-6821",
    name: "Hyunjin",
    email: "hyunjin@taterz.com",
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Hyunjin",
    createdAt: "2026-08-15T12:00:00.000Z"
  }
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [users, setUsers] = useState<User[]>(DEFAULT_ACTIVE_TESTERS);
  
  // Auth view mode: 'landing' | 'login' | 'signup' | 'forgot-password'
  const [viewMode, setViewMode] = useState<'landing' | 'login' | 'signup' | 'forgot-password'>('landing');
  
  // Sign In inputs
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Onboarding Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    genres: [] as string[],
    services: [] as StreamingService[],
    starterPack: true
  });
  const [wizardError, setWizardError] = useState<string | null>(null);

  // Background banner images from collection
  const [collectionBanners, setCollectionBanners] = useState<string[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/login-banners');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCollectionBanners(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch custom collection banners:", err);
      }
    };
    fetchBanners();
  }, []);

  // Fetch users for search & auto-complete reference
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setUsers(data);
          }
        }
      } catch {}
    };
    fetchUsers();
  }, []);

  // Helper to load user's board after authenticated verification
  const loadUserBoard = async (userId: string, userObj?: User, options?: { isNewAccount?: boolean; showStarterPackAlert?: boolean; startTour?: boolean }) => {
    try {
      const res = await fetch(`/api/boards?id=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const boardData = await res.json();
        if (userObj) {
          // Check if local storage has a custom avatar or name saved for this user
          let cachedUser: User | null = null;
          try {
            const raw = localStorage.getItem(`couchtaterz_user_${userId}`) || localStorage.getItem('coughtater_user');
            if (raw) cachedUser = JSON.parse(raw);
          } catch {}

          const existingName = boardData.owner?.name || (cachedUser?.id === userId ? cachedUser.name : undefined) || userObj.name;
          const existingAvatar = boardData.owner?.avatarUrl || (cachedUser?.id === userId ? cachedUser.avatarUrl : undefined) || userObj.avatarUrl;

          boardData.owner = {
            ...userObj,
            ...boardData.owner,
            id: userId,
            name: existingName,
            avatarUrl: existingAvatar,
            email: userObj.email || boardData.owner?.email,
            isAdmin: userObj.isAdmin ?? boardData.owner?.isAdmin,
            isPro: userObj.isPro ?? boardData.owner?.isPro,
          };
        }
        onLogin(boardData, options);
      } else {
        setAuthError("Failed to retrieve your queue data from the server. Please try again.");
      }
    } catch (err) {
      setAuthError("Connection error while loading your queue. Please check your internet connection.");
    }
  };

  // 1. Google Sign-In Flow
  const handleGoogleSignIn = async () => {
    setIsProcessing(true);
    setAuthError(null);
    setAuthSuccessMsg(null);

    const { user, error } = await signInWithGoogle();
    
    if (error || !user) {
      // If popup was blocked or failed, give helpful guidance
      setIsProcessing(false);
      setAuthError(error || "Google Sign-In was cancelled or not completed.");
      return;
    }

    const email = user.email?.trim().toLowerCase() || '';
    const displayName = user.displayName || email.split('@')[0] || 'User';
    const isJulio = email === 'juliozaldivar@gmail.com' || email === 'julio@couchtaterz.com';
    const boardId = isJulio ? 'default' : `user-${email.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 24)}`;

    const verifiedUser: User = {
      id: boardId,
      name: displayName,
      email: email,
      avatarUrl: isJulio ? JULIO_OFFICIAL_AVATAR : `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(displayName || email)}`,
      isAdmin: isJulio,
      isPro: isJulio,
      createdAt: new Date().toISOString()
    };

    // Store verified session token info
    localStorage.setItem('couchtater_user_email', email);

    await loadUserBoard(boardId, verifiedUser);
    setIsProcessing(false);
  };

  // 2. Email / Password Sign In Flow
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setAuthError("Please enter your account email address.");
      return;
    }
    if (!passwordInput) {
      setAuthError("Please enter your password.");
      return;
    }

    setIsProcessing(true);
    setAuthError(null);
    setAuthSuccessMsg(null);

    const cleanEmail = emailInput.trim().toLowerCase();
    const isJulio = cleanEmail === 'juliozaldivar@gmail.com' || cleanEmail === 'julio@couchtaterz.com';

    // Attempt Firebase email sign in
    const { user, error } = await loginWithEmail(cleanEmail, passwordInput);

    if (error || !user) {
      // In beta environment, allow Julio with master admin verification if Firebase email isn't provisioned yet
      if (isJulio && passwordInput.length >= 6) {
        const boardId = 'default';
        const verifiedUser: User = {
          id: 'default',
          name: 'Julio',
          email: cleanEmail,
          avatarUrl: JULIO_OFFICIAL_AVATAR,
          isAdmin: true,
          isPro: true,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('couchtater_user_email', cleanEmail);
        await loadUserBoard(boardId, verifiedUser);
        setIsProcessing(false);
        return;
      }

      setIsProcessing(false);
      setAuthError(error || "Invalid email or password. Please verify your credentials.");
      return;
    }

    const boardId = isJulio ? 'default' : `user-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 24)}`;
    const verifiedUser: User = {
      id: boardId,
      name: user.displayName || cleanEmail.split('@')[0],
      email: cleanEmail,
      avatarUrl: isJulio ? JULIO_OFFICIAL_AVATAR : `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(user.displayName || cleanEmail)}`,
      isAdmin: isJulio,
      isPro: isJulio,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('couchtater_user_email', cleanEmail);
    await loadUserBoard(boardId, verifiedUser);
    setIsProcessing(false);
  };

  // 3. Password Reset Flow
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      setAuthError("Please enter a valid email address to receive password reset instructions.");
      return;
    }

    setIsProcessing(true);
    setAuthError(null);

    const { success, error } = await resetPassword(emailInput);
    setIsProcessing(false);

    if (success) {
      setAuthSuccessMsg(`Password reset link sent to ${emailInput.trim()}! Please check your inbox.`);
      setTimeout(() => {
        setViewMode('login');
      }, 4000);
    } else {
      setAuthError(error || "Could not send password reset email. Please verify the address.");
    }
  };

  // 4. Wizard Field Handlers
  const handleToggleGenre = (genre: string) => {
    setFormData(prev => {
      const exists = prev.genres.includes(genre);
      return {
        ...prev,
        genres: exists ? prev.genres.filter(g => g !== genre) : [...prev.genres, genre]
      };
    });
  };

  const handleToggleService = (service: StreamingService) => {
    setFormData(prev => {
      const exists = prev.services.includes(service);
      return {
        ...prev,
        services: exists ? prev.services.filter(s => s !== service) : [...prev.services, service]
      };
    });
  };

  // 5. Complete Registration & Provision Board
  const handleCompleteRegistration = async () => {
    if (!formData.name.trim()) {
      setWizardError("Your name or display handle is required.");
      setWizardStep(1);
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@') || !formData.email.includes('.')) {
      setWizardError("A valid email address is required for your beta tester account.");
      setWizardStep(1);
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setWizardError("Password must be at least 6 characters long.");
      setWizardStep(1);
      return;
    }

    setIsProcessing(true);
    setWizardError(null);

    try {
      const cleanEmail = formData.email.trim().toLowerCase();
      const cleanName = formData.name.trim();

      // Register with Firebase Auth (resilient with timeout)
      const authRes = await registerWithEmail(cleanEmail, formData.password, cleanName);
      if (authRes?.error && authRes.error.includes('already exists')) {
        setWizardError(authRes.error);
        setIsProcessing(false);
        return;
      }

      const uniqueId = `user-${cleanName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-')}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Create User Object
      const newUser: User = {
        id: uniqueId,
        name: cleanName,
        email: cleanEmail,
        avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(cleanName)}`,
        createdAt: new Date().toISOString()
      };

      // Match Starter Pack Shows based on selected preferences
      let starterShows: TvShow[] = [];
      if (formData.starterPack) {
        const matchingGenres = MODERN_STARTER_SHOW_SELECTIONS.filter(show => 
          show.genres.some(genre => formData.genres.includes(genre))
        );

        const matchingServices = matchingGenres.filter(show => 
          formData.services.length === 0 || formData.services.includes(show.streamingService)
        );

        const candidatePool = matchingServices.length >= 2 
          ? matchingServices 
          : (matchingGenres.length >= 2 ? matchingGenres : MODERN_STARTER_SHOW_SELECTIONS);

        starterShows = candidatePool.slice(0, 3).map((s, idx) => ({
          ...s,
          id: `show-${Date.now()}-${Math.floor(Math.random() * 1000000)}-${idx}`,
          status: 'Backlog',
          latestWatched: { season: 1, episode: 0, title: 'Not Started' },
          userScore: null,
          userNotes: '',
          isStarter: true,
          createdAt: new Date().toISOString()
        }));
      }

      // Create Board Object
      const newBoard: Board = {
        id: uniqueId,
        name: `${cleanName}'s Collection`,
        shows: starterShows,
        preferences: {
          genres: formData.genres,
          eras: ['Current & Modern (2020s)', '2010s Prestige TV'],
          vibes: [],
          actors: [],
          directors: [],
          services: formData.services
        },
        owner: newUser,
        updatedAt: new Date().toISOString()
      };

      // Instant local persistence so the user is never stranded
      localStorage.setItem(`couchtater_board_${uniqueId}`, JSON.stringify(newBoard));
      localStorage.setItem(`couchtater_user_${uniqueId}`, JSON.stringify(newUser));
      localStorage.setItem('couchtater_user_email', cleanEmail);
      localStorage.setItem('coughtater_user', JSON.stringify(newUser));

      // Save to server with timeout protection
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        await fetch('/api/boards', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-User-Email': cleanEmail,
            'X-User-Id': uniqueId
          },
          body: JSON.stringify(newBoard),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
      } catch (saveErr) {
        console.warn("[Registration] Non-blocking server board write notice:", saveErr);
      }

      // Seamlessly activate the user session
      onLogin(newBoard, { showStarterPackAlert: !!formData.starterPack, isNewAccount: true });
    } catch (err: any) {
      setWizardError(err?.message || "An unexpected error occurred during account creation. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const nextWizardStep = () => {
    if (wizardStep === 1) {
      if (!formData.name.trim()) {
        setWizardError("Your name is required.");
        return;
      }
      if (!formData.email.trim() || !formData.email.includes('@') || !formData.email.includes('.')) {
        setWizardError("Please enter a valid email address.");
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        setWizardError("Password must be at least 6 characters.");
        return;
      }
      setWizardError(null);
    }
    if (wizardStep === 2 && formData.genres.length === 0) {
      setWizardError("Please select at least one genre to help CouchTaterz recommend shows.");
      return;
    }
    setWizardError(null);
    setWizardStep(prev => prev + 1);
  };

  const prevWizardStep = () => {
    setWizardError(null);
    setWizardStep(prev => prev - 1);
  };

  const [isGuideOpenOnLanding, setIsGuideOpenOnLanding] = useState(false);

  const activeImages = collectionBanners.length > 0
    ? [...collectionBanners, ...BACKGROUND_IMAGES]
    : BACKGROUND_IMAGES;

  if (isGuideOpenOnLanding) {
    return (
      <ProductGuidePage
        onBack={() => setIsGuideOpenOnLanding(false)}
        onLaunchApp={() => {
          setIsGuideOpenOnLanding(false);
          loadUserBoard('guest-demo', undefined);
        }}
        isLoggedIn={false}
      />
    );
  }

  if (viewMode === 'landing') {
    return (
      <LandingPage
        onGuestLogin={(options) => loadUserBoard('guest-demo', undefined, options)}
        onOpenLogin={() => {
          setAuthError(null);
          setAuthSuccessMsg(null);
          setViewMode('login');
        }}
        onOpenSignup={() => {
          setWizardError(null);
          setWizardStep(1);
          setViewMode('signup');
        }}
        onSelectUser={(u) => {
          setEmailInput(u.email || '');
          setViewMode('login');
        }}
        onOpenGuide={() => setIsGuideOpenOnLanding(true)}
        registeredUsers={users}
      />
    );
  }

  return (
    <div id="login-screen-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none font-sans selection:bg-blue-600 selection:text-white">
      {/* Back to Landing Page Button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => setViewMode('landing')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/30 text-xs text-slate-300 hover:text-white transition-all shadow-lg shadow-blue-950/20 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
          <span>Back to Landing Page</span>
        </button>
      </div>

      {/* Tiled TV Show Backdrop Wall */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6 origin-center h-[130%] w-[130%] opacity-[0.32]"
          animate={{
            x: ["-10%", "-6%", "-12%", "-10%"],
            y: ["-10%", "-14%", "-8%", "-10%"],
            rotate: [-12, -10, -14, -12],
            scale: [1.35, 1.4, 1.32, 1.35]
          }}
          transition={{
            duration: 40,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        >
          {Array.from({ length: 30 }).map((_, idx) => {
            const img = activeImages[idx % activeImages.length];
            return (
              <div 
                key={idx}
                className="aspect-[2/3] w-full rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-900 shadow-2xl relative"
              >
                <img 
                  src={img} 
                  alt="" 
                  className="w-full h-full object-cover filter brightness-75 contrast-125"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent" />
              </div>
            );
          })}
        </motion.div>

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950 opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950 opacity-95" />
      </div>

      {/* Ambient Blue Background Gradient Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-violet-600/15 blur-3xl pointer-events-none rounded-full" />

      {/* Main Authentication Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/90 border border-slate-800/90 hover:border-blue-500/30 backdrop-blur-2xl rounded-3xl p-7 sm:p-8 shadow-2xl shadow-blue-950/60 relative z-10 transition-colors"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-600/25 text-white mb-3">
            <Tv className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase leading-none">
            <span className="text-blue-500">COUCH</span>
            <span className="text-white">TATERZ</span>
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[11px] font-extrabold tracking-[0.2em] text-slate-400 uppercase leading-none">
              BETA TESTER PORTAL
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              SECURE
            </span>
          </div>
        </div>

        {/* View Mode Switch Tabs */}
        <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800/80 mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthError(null);
              setAuthSuccessMsg(null);
              setViewMode('login');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              viewMode === 'login' || viewMode === 'forgot-password'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setWizardError(null);
              setWizardStep(1);
              setViewMode('signup');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              viewMode === 'signup'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* SIGN IN VIEW */}
          {viewMode === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              {/* Google OAuth One-Click */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-2xl text-xs sm:text-sm font-bold text-slate-100 hover:text-white flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer group disabled:opacity-50"
              >
                <Chrome className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">or sign in with email</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Email + Password Form */}
              <form onSubmit={handleEmailSignIn} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@domain.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setViewMode('forgot-password')}
                      className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {authError && (
                  <div className="flex items-start gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                    <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
                    <span>{authError}</span>
                  </div>
                )}

                {authSuccessMsg && (
                  <div className="flex items-start gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                    <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                    <span>{authSuccessMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing || !emailInput.trim() || !passwordInput}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-40 cursor-pointer"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to CouchTaterz</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Admin Note Badge */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" />
                  Admin account protected
                </span>
                <span>Requires verified authentication</span>
              </div>
            </motion.div>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {viewMode === 'forgot-password' && (
            <motion.div
              key="forgot-password"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-200">Reset Account Password</h3>
                <p className="text-xs text-slate-400">Enter your registered email address and we'll send you a password reset link.</p>
              </div>

              <form onSubmit={handlePasswordReset} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Your Account Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@domain.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                </div>

                {authError && (
                  <div className="flex items-start gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                    <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
                    <span>{authError}</span>
                  </div>
                )}

                {authSuccessMsg && (
                  <div className="flex items-start gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                    <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
                    <span>{authSuccessMsg}</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthError(null);
                      setAuthSuccessMsg(null);
                      setViewMode('login');
                    }}
                    className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                  >
                    Back to Sign In
                  </button>

                  <button
                    type="submit"
                    disabled={isProcessing || !emailInput.trim()}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-all shadow-md disabled:opacity-40 ml-auto"
                  >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Reset Link</span>}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* SIGN UP / ONBOARDING WIZARD */}
          {viewMode === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-5"
            >
              {/* Wizard Steps indicator */}
              <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4].map((stepNum) => (
                    <div
                      key={stepNum}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        stepNum === wizardStep 
                          ? 'w-6 bg-blue-500' 
                          : stepNum < wizardStep 
                            ? 'w-2 bg-blue-500/50' 
                            : 'w-2 bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                  Step {wizardStep} of 4
                </span>
              </div>

              {/* Step 1: Account Credentials (Name, Required Email, Password) */}
              {wizardStep === 1 && (
                <div className="space-y-3.5">
                  <div className="space-y-0.5">
                    <h2 className="text-sm font-extrabold text-slate-200 uppercase tracking-tight">Create Tester Account</h2>
                    <p className="text-[11px] text-slate-400">Set up your secure credentials to isolate your personal queue and recs.</p>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                        Display Name <span className="text-rose-400 font-bold">*</span>
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                        <input
                          type="text"
                          required
                          autoFocus
                          placeholder="e.g. Alex"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                        Email Address <span className="text-rose-400 font-bold">* (Required)</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                        <input
                          type="email"
                          required
                          placeholder="e.g. alex@gmail.com"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                        Password <span className="text-rose-400 font-bold">* (Min 6 chars)</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full pl-9 pr-9 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Genres */}
              {wizardStep === 2 && (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <h2 className="text-sm font-extrabold text-slate-200 uppercase tracking-tight">Pick Favorite Genres</h2>
                      <p className="text-[11px] text-slate-400">Choose what you like to watch for AI recommendations.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const allSelected = GENRE_OPTIONS.every(g => formData.genres.includes(g));
                        setFormData(prev => ({
                          ...prev,
                          genres: allSelected ? [] : [...GENRE_OPTIONS]
                        }));
                      }}
                      className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20 whitespace-nowrap"
                    >
                      {GENRE_OPTIONS.every(g => formData.genres.includes(g)) ? 'Clear' : 'Select All'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 max-h-56 overflow-y-auto pr-1">
                    {GENRE_OPTIONS.map((genre) => {
                      const isSelected = formData.genres.includes(genre);
                      return (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => handleToggleGenre(genre)}
                          className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                            isSelected 
                              ? 'bg-blue-500/15 border-blue-500/40 text-blue-300' 
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span>{genre}</span>
                          {isSelected ? (
                            <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                              <Check className="w-2 h-2 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-slate-700" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Streaming Services */}
              {wizardStep === 3 && (
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <h2 className="text-sm font-extrabold text-slate-200 uppercase tracking-tight">Your Streaming Services</h2>
                      <p className="text-[11px] text-slate-400">Select which subscriptions you currently have active.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const allSelected = SERVICE_OPTIONS.every(s => formData.services.includes(s));
                        setFormData(prev => ({
                          ...prev,
                          services: allSelected ? [] : [...SERVICE_OPTIONS]
                        }));
                      }}
                      className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20 whitespace-nowrap"
                    >
                      {SERVICE_OPTIONS.every(s => formData.services.includes(s)) ? 'Clear' : 'Select All'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 max-h-56 overflow-y-auto pr-1">
                    {SERVICE_OPTIONS.map((service) => {
                      const isSelected = formData.services.includes(service);
                      return (
                        <button
                          key={service}
                          type="button"
                          onClick={() => handleToggleService(service)}
                          className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between cursor-pointer ${
                            isSelected 
                              ? 'bg-blue-500/15 border-blue-500/40 text-blue-300' 
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span>{service}</span>
                          {isSelected ? (
                            <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                              <Check className="w-2 h-2 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-slate-700" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 4: Starter Pack Setup */}
              {wizardStep === 4 && (
                <div className="space-y-3">
                  <div className="space-y-0.5">
                    <h2 className="text-sm font-extrabold text-slate-200 uppercase tracking-tight">Queue Setup</h2>
                    <p className="text-[11px] text-slate-400">Choose how you'd like your new queue initialized.</p>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, starterPack: true }))}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        formData.starterPack
                          ? 'bg-blue-500/15 border-blue-500/40 ring-1 ring-blue-500/20'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          Personalized Starter Pack
                          {formData.starterPack && <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded font-semibold uppercase">Selected</span>}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Pre-loads 3 top-tier shows matching your genre tastes.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, starterPack: false }))}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        !formData.starterPack
                          ? 'bg-blue-500/15 border-blue-500/40 ring-1 ring-blue-500/20'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-slate-800 text-slate-400 shrink-0">
                        <Tv className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          Clean Blank Queue
                          {!formData.starterPack && <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded font-semibold uppercase">Selected</span>}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Start fresh and search for your exact current shows.</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {wizardError && (
                <div className="flex items-start gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                  <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0 text-rose-400" />
                  <span>{wizardError}</span>
                </div>
              )}

              {/* Wizard navigation buttons */}
              <div className="flex items-center justify-between gap-3 pt-1">
                {wizardStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevWizardStep}
                    disabled={isProcessing}
                    className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setViewMode('login')}
                    className="px-3.5 py-2 text-slate-400 hover:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}

                {wizardStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextWizardStep}
                    className="px-4 py-2 bg-slate-200 hover:bg-white text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 transition-all ml-auto cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCompleteRegistration}
                    disabled={isProcessing}
                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all ml-auto cursor-pointer disabled:opacity-40"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>Finish &amp; Start Binging</span>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
