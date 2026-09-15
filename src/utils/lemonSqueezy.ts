/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User } from "../types";

declare global {
  interface Window {
    createLemonSqueezy?: () => void;
    LemonSqueezy?: {
      Url?: {
        Open: (url: string) => void;
        Close: () => void;
      };
      Setup?: (options: {
        eventHandler?: (data: { event: string; data?: any }) => void;
      }) => void;
    };
  }
}

/**
 * Dynamically loads the official Lemon.js overlay library for frictionless in-app popups
 */
export function initLemonSqueezyJs(onSuccess?: () => void): void {
  if (typeof window === "undefined") return;

  if (window.createLemonSqueezy || window.LemonSqueezy) {
    if (window.createLemonSqueezy) window.createLemonSqueezy();
    if (window.LemonSqueezy?.Setup && onSuccess) {
      window.LemonSqueezy.Setup({
        eventHandler: (data) => {
          if (data?.event === "Checkout.Success") {
            onSuccess();
          }
        },
      });
    }
    return;
  }

  const script = document.createElement("script");
  script.src = "https://assets.lemonsqueezy.com/lemon.js";
  script.async = true;
  script.onload = () => {
    if (window.createLemonSqueezy) {
      window.createLemonSqueezy();
    }
    if (window.LemonSqueezy?.Setup && onSuccess) {
      window.LemonSqueezy.Setup({
        eventHandler: (data) => {
          if (data?.event === "Checkout.Success") {
            onSuccess();
          }
        },
      });
    }
  };
  document.head.appendChild(script);
}

/**
 * Initiates the low-friction checkout process
 */
export async function openLemonSqueezyCheckout(options: {
  plan?: 'monthly' | 'lifetime' | 'annual';
  user?: Partial<User> | null;
  customCheckoutUrl?: string;
  onSuccess?: () => void;
}): Promise<{ success: boolean; url?: string; isLiveConfigured?: boolean; error?: string }> {
  try {
    const { plan = 'monthly', user, customCheckoutUrl } = options;

    const returnUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}${window.location.pathname}?checkout=success&plan=${plan}`
      : undefined;

    const response = await fetch("/api/lemonsqueezy/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user?.id || "default",
        userEmail: user?.email || "",
        userName: user?.name || "",
        plan,
        customCheckoutUrl,
        returnUrl
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    const checkoutUrl = data.url;

    if (!checkoutUrl) {
      throw new Error("No checkout URL generated.");
    }

    // Try using LemonSqueezy Overlay first for the lowest-friction experience
    if (typeof window !== "undefined" && window.LemonSqueezy?.Url?.Open) {
      try {
        window.LemonSqueezy.Url.Open(checkoutUrl);
        return { success: true, url: checkoutUrl, isLiveConfigured: data.isLiveConfigured };
      } catch (err) {
        console.warn("[Lemon Squeezy] Overlay open failed, falling back to direct navigation:", err);
      }
    }

    // Fallback: Open in a new focused tab
    if (typeof window !== "undefined") {
      window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    }

    return { success: true, url: checkoutUrl, isLiveConfigured: data.isLiveConfigured };
  } catch (err: any) {
    console.error("[Lemon Squeezy] Checkout launch error:", err);
    return { success: false, error: err?.message || "Could not launch checkout" };
  }
}

/**
 * Verifies current VIP status with backend
 */
export async function fetchUserVipStatus(user?: Partial<User> | null): Promise<{
  isVip: boolean;
  isPro: boolean;
  vipPlan?: string;
  subscriptionStatus?: string;
  subscriptionRenewsAt?: string;
  customerPortalUrl?: string;
  isLiveConfigured?: boolean;
}> {
  if (!user || (!user.id && !user.email)) {
    return { isVip: false, isPro: false };
  }

  try {
    const params = new URLSearchParams();
    if (user.id) params.set("userId", user.id);
    if (user.email) params.set("email", user.email);

    const res = await fetch(`/api/lemonsqueezy/status?${params.toString()}`);
    if (!res.ok) throw new Error("Status check failed");
    const data = await res.json();

    if (data.isVip) {
      localStorage.setItem("couchtaterz_is_pro", "true");
    }

    return data;
  } catch (err) {
    // Fallback to local check
    const isProLocal = localStorage.getItem("couchtaterz_is_pro") === "true";
    return { isVip: isProLocal, isPro: isProLocal };
  }
}

/**
 * Instant developer/tester simulator
 */
export async function simulateVipUpgrade(user: Partial<User>, isVip: boolean = true, plan: string = "monthly") {
  const res = await fetch("/api/lemonsqueezy/simulate-upgrade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user.id || "default",
      email: user.email || "",
      name: user.name || "",
      isVip,
      plan
    }),
  });

  const data = await res.json();
  if (data.isVip) {
    localStorage.setItem("couchtaterz_is_pro", "true");
  } else {
    localStorage.removeItem("couchtaterz_is_pro");
  }

  return data;
}
