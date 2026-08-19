import { useState, useEffect, useCallback } from 'react';
import {
  ChatMessage,
  TaterzAIIntent,
  TaterzAIRequestPayload,
  TaterzAIResponse,
  TvShow,
  UserPreferences,
  TaterzAIGroupBuddy
} from '../types';

const STORAGE_CREDITS_KEY = 'taterz_ai_credits_used';
const STORAGE_PRO_KEY = 'taterz_pro';

export function getShowWelcomeMessage(show?: TvShow | null): string {
  if (!show) {
    return "Yo, AskTaterz so you don't have to waste 45 minutes scrolling through Netflix.\n\nHere’s the deal:\n\n**Show Intelligence**: Get zero-spoiler Catch-Ups for active shows, Series Briefings for upcoming titles, and full Series Refreshers for completed shows.\n\n**Group Peacekeeping**: Trying to pick a movie with three other picky people? Hand me the remotes, I’ll find something nobody hates.\n\n**Vibe Search**: Skip the endless categories. Just tell me if you want \"mind-bending sci-fi\" or \"trashy reality TV to numb my brain,\" and I'll queue it up.";
  }

  if (show.status === 'Backlog') {
    return `Yo, I’m Taterz! Ready to start **${show.title}**?\n\nClick **Get Briefing** above to receive a zero-spoiler Series Briefing covering the core premise, vibe, and key characters before you start watching—or ask me anything below!`;
  }

  if (show.status === 'Completed') {
    return `Yo, I’m Taterz! Looking for a Series Refresher for **${show.title}**?\n\nClick **Get Refresher** above for a full Series Refresher covering the overarching plot arc, character transformations, and finale legacy—or ask me anything below!`;
  }

  const season = show.latestWatched?.season || 1;
  const episode = show.latestWatched?.episode || 1;
  return `Yo, I’m Taterz! Need to Catch Up on **${show.title}**?\n\nClick **Generate Recap** above for a zero-spoiler Catch-Up up to Season ${season}, Episode ${episode}—or ask me anything below!`;
}

export const GENERAL_WELCOME_MSG = getShowWelcomeMessage(null);
export const SHOW_CARD_WELCOME_MSG = getShowWelcomeMessage(null);

export interface UseTaterzAIOptions {
  shows?: TvShow[];
  preferences?: UserPreferences;
  buddies?: TaterzAIGroupBuddy[];
  initialShowForRecap?: TvShow | null;
}

export function useTaterzAI(options?: UseTaterzAIOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-taterz',
      role: 'model',
      content: getShowWelcomeMessage(options?.initialShowForRecap),
      timestamp: new Date().toISOString()
    }
  ]);

  // Sync welcome message if initialShowForRecap changes when chat has only welcome message
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id.startsWith('welcome-taterz')) {
        const expectedContent = getShowWelcomeMessage(options?.initialShowForRecap);
        if (prev[0].content !== expectedContent) {
          return [
            {
              ...prev[0],
              content: expectedContent
            }
          ];
        }
      }
      return prev;
    });
  }, [options?.initialShowForRecap]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User tier & credit state
  const [freeCreditsUsed, setFreeCreditsUsed] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_CREDITS_KEY);
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  const [isPro, setIsPro] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_PRO_KEY) === 'true';
  });

  const CREDIT_LIMIT = 3;
  const isLimitReached = !isPro && freeCreditsUsed >= CREDIT_LIMIT;

  // Persist credits and pro state
  useEffect(() => {
    localStorage.setItem(STORAGE_CREDITS_KEY, freeCreditsUsed.toString());
  }, [freeCreditsUsed]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PRO_KEY, isPro ? 'true' : 'false');
  }, [isPro]);

  const toggleProMode = useCallback(() => {
    setIsPro((prev) => !prev);
  }, []);

  const resetCredits = useCallback(() => {
    setFreeCreditsUsed(0);
    setError(null);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: `welcome-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        role: 'model',
        content: "Chat cleared! What show are we checking out, recapping, or discovering next?",
        timestamp: new Date().toISOString()
      }
    ]);
  }, []);

  /**
   * Primary execution method for Taterz AI
   */
  const executeIntent = useCallback(
    async (payload: {
      intent: TaterzAIIntent;
      userPrompt?: string;
      showTitle?: string;
      showStatus?: string;
      season?: number;
      episode?: number;
      lastWatchedSeason?: number;
      lastWatchedEpisode?: number;
      overview?: string;
      buddiesOverride?: TaterzAIGroupBuddy[];
      showsOverride?: TvShow[];
    }) => {
      const {
        intent,
        userPrompt,
        showTitle,
        showStatus,
        season,
        episode,
        lastWatchedSeason,
        lastWatchedEpisode,
        overview,
        buddiesOverride,
        showsOverride
      } = payload;

      setError(null);

      // Construct visible user prompt message
      let promptDisplay = userPrompt || '';
      if (intent === 'recap' && showTitle) {
        if (showStatus === 'Backlog') {
          promptDisplay = `Get a zero-spoiler Season Update & premise briefing for "${showTitle}" before I start watching.`;
        } else if (showStatus === 'Completed') {
          promptDisplay = `Get a complete Series Refresher & Finale Recap for "${showTitle}".`;
        } else {
          promptDisplay = `Recap Season ${season || 1}, Episode ${episode || 1} of "${showTitle}" without spoilers up to my progress.`;
        }
      } else if (intent === 'group_recommendation') {
        const buddyList = (buddiesOverride || options?.buddies || []);
        const buddyNames = buddyList.map((b) => b.name).join(', ') || 'Connected Buddies';
        promptDisplay = `Find group consensus show recommendations for me and my Binge Buddies (${buddyNames}).`;
      } else if (intent === 'natural_search' && userPrompt) {
        promptDisplay = userPrompt;
      }

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        role: 'user',
        content: promptDisplay,
        timestamp: new Date().toISOString(),
        intent
      };

      // Add user message to history
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const reqPayload: TaterzAIRequestPayload = {
          intent,
          customPrompt: userPrompt,
          shows: showsOverride || options?.shows,
          preferences: options?.preferences,
          messages: [...messages, userMessage],
          userState: {
            isPro,
            freeCreditsUsed
          }
        };

        if (intent === 'recap' && showTitle) {
          reqPayload.recap = {
            showTitle,
            showStatus,
            targetSeason: season || 1,
            targetEpisode: episode || 1,
            lastWatchedSeason,
            lastWatchedEpisode,
            overview
          };
        } else if (intent === 'group_recommendation') {
          reqPayload.group = {
            buddies: buddiesOverride || options?.buddies || []
          };
        } else if (intent === 'natural_search' && userPrompt) {
          reqPayload.search = {
            prompt: userPrompt
          };
        }

        const res = await fetch('/api/taterz-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reqPayload)
        });

        const data: TaterzAIResponse = await res.json();

        if (!res.ok) {
          if (data.isLimitReached) {
            setError("You've used your 3 free AskTaterz credits this week. Upgrade to Taterz Pro for unlimited zero-spoiler recaps & group picks.");
          } else {
            throw new Error(data.error || 'Failed to generate AskTaterz response');
          }
          return;
        }

        // If call succeeded:
        // Increment credit counter IF response was not cached and user is non-pro
        if (!data.cached && !isPro) {
          setFreeCreditsUsed((prev) => prev + 1);
        }

        const botMessage: ChatMessage = {
          id: `model-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          role: 'model',
          content: data.content,
          timestamp: new Date().toISOString(),
          intent,
          cached: data.cached
        };

        setMessages((prev) => [...prev, botMessage]);
      } catch (err: any) {
        console.error('AskTaterz execution error:', err);
        setError(err.message || 'An unexpected error occurred while reaching AskTaterz.');
      } finally {
        setIsLoading(false);
      }
    },
    [isPro, freeCreditsUsed, messages, options?.shows, options?.preferences, options?.buddies]
  );

  return {
    messages,
    isLoading,
    error,
    freeCreditsUsed,
    isPro,
    creditLimit: CREDIT_LIMIT,
    isLimitReached,
    executeIntent,
    toggleProMode,
    resetCredits,
    clearMessages
  };
}
