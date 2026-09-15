/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from "crypto";
import { doc, setDoc, getDoc } from "firebase/firestore";

export interface LemonSqueezyConfig {
  apiKey: string;
  storeId: string;
  webhookSecret: string;
  checkoutUrlMonthly: string;
  checkoutUrlLifetime: string;
  isConfigured: boolean;
}

export function getLemonSqueezyConfig(): LemonSqueezyConfig {
  const apiKey = (process.env.LEMONSQUEEZY_API_KEY || "").trim();
  const storeId = (process.env.LEMONSQUEEZY_STORE_ID || "").trim();
  const webhookSecret = (process.env.LEMONSQUEEZY_WEBHOOK_SECRET || "").trim();
  
  // Custom or default checkout URLs
  const checkoutUrlMonthly = (
    process.env.LEMONSQUEEZY_CHECKOUT_URL_MONTHLY ||
    process.env.VITE_LEMONSQUEEZY_CHECKOUT_URL ||
    ""
  ).trim();

  const checkoutUrlLifetime = (
    process.env.LEMONSQUEEZY_CHECKOUT_URL_LIFETIME ||
    process.env.LEMONSQUEEZY_CHECKOUT_URL_ANNUAL ||
    ""
  ).trim();

  const isConfigured = Boolean(apiKey || webhookSecret || checkoutUrlMonthly);

  return {
    apiKey,
    storeId,
    webhookSecret,
    checkoutUrlMonthly,
    checkoutUrlLifetime,
    isConfigured
  };
}

/**
 * Validates the HMAC-SHA256 signature sent by Lemon Squeezy in the X-Signature header
 */
export function verifyWebhookSignature(rawBody: string | Buffer, signatureHeader: string, secret: string): boolean {
  if (!secret) {
    // If no webhook secret is configured in environment, allow in dev mode with warning
    console.warn("[Lemon Squeezy Webhook] No LEMONSQUEEZY_WEBHOOK_SECRET configured. Skipping strict HMAC verification in development.");
    return true;
  }

  if (!signatureHeader) {
    return false;
  }

  try {
    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
    const signature = Buffer.from(signatureHeader, "utf8");

    if (digest.length !== signature.length) {
      return false;
    }

    return crypto.timingSafeEqual(digest, signature);
  } catch (err) {
    console.error("[Lemon Squeezy Webhook] Signature verification error:", err);
    return false;
  }
}

/**
 * Builds a customized checkout link with user details prefilled to minimize checkout friction
 */
export function buildCheckoutUrl(params: {
  plan?: 'monthly' | 'lifetime' | 'annual';
  userId: string;
  userEmail?: string;
  userName?: string;
  customCheckoutUrl?: string;
  returnUrl?: string;
}): string {
  const config = getLemonSqueezyConfig();
  const { plan = 'monthly', userId, userEmail, userName, customCheckoutUrl, returnUrl } = params;

  let baseCheckoutUrl = customCheckoutUrl || (
    plan === 'lifetime' || plan === 'annual'
      ? (config.checkoutUrlLifetime || config.checkoutUrlMonthly)
      : config.checkoutUrlMonthly
  );

  // If no store URL configured yet, provide a fallback URL
  if (!baseCheckoutUrl) {
    baseCheckoutUrl = `https://couchtaterz.lemonsqueezy.com/buy/vip-${plan}`;
  }

  try {
    const url = new URL(baseCheckoutUrl);
    
    // Low friction pre-fills: customer name and email
    if (userEmail) {
      url.searchParams.set("checkout[email]", userEmail);
    }
    if (userName) {
      url.searchParams.set("checkout[name]", userName);
    }

    // Custom metadata to map webhooks directly back to this user
    url.searchParams.set("checkout[custom][user_id]", userId);
    if (userEmail) {
      url.searchParams.set("checkout[custom][user_email]", userEmail);
    }
    url.searchParams.set("checkout[custom][plan]", plan);

    // Return URL upon completion
    if (returnUrl) {
      url.searchParams.set("checkout[success_url]", returnUrl);
    }

    return url.toString();
  } catch (e) {
    // If URL parsing failed due to relative path or custom schema, construct query params manually
    const separator = baseCheckoutUrl.includes("?") ? "&" : "?";
    const query = new URLSearchParams({
      "checkout[custom][user_id]": userId,
      ...(userEmail ? { "checkout[email]": userEmail, "checkout[custom][user_email]": userEmail } : {}),
      ...(userName ? { "checkout[name]": userName } : {}),
      "checkout[custom][plan]": plan,
      ...(returnUrl ? { "checkout[success_url]": returnUrl } : {})
    });
    return `${baseCheckoutUrl}${separator}${query.toString()}`;
  }
}

/**
 * Handles incoming Lemon Squeezy webhook payloads and updates user database records
 */
export async function processLemonSqueezyWebhook(
  payload: any,
  helpers: {
    dbFirestore: any;
    readDatabase: () => Record<string, any>;
    writeDatabase: (data: Record<string, any>, boardId?: string) => void;
    communityUsers: any[];
    isFirestoreQuotaExhausted: boolean;
  }
): Promise<{ success: boolean; event: string; userId?: string; action: string }> {
  const eventName = payload?.meta?.event_name || payload?.event_name || "unknown";
  const customData = payload?.meta?.custom_data || {};
  const dataAttributes = payload?.data?.attributes || {};

  // Extract user identifier from custom_data or customer email
  const customUserId = customData.user_id;
  const customerEmail = (
    customData.user_email ||
    dataAttributes.user_email ||
    dataAttributes.customer_email ||
    dataAttributes.billing_email ||
    ""
  ).toLowerCase().trim();

  const customerName = dataAttributes.user_name || dataAttributes.customer_name || "";
  const orderId = payload?.data?.id || "";
  const subscriptionStatus = dataAttributes.status; // 'active', 'cancelled', 'expired', 'past_due', 'paused'
  const plan = customData.plan || (eventName.includes("subscription") ? "monthly" : "lifetime");
  const renewsAt = dataAttributes.renews_at || dataAttributes.ends_at || null;
  const customerPortalUrl = dataAttributes.urls?.customer_portal || "";

  console.log(`[Lemon Squeezy Webhook] Received ${eventName} for user:`, { customUserId, customerEmail, orderId, subscriptionStatus });

  // Determine target User ID
  const isJulio = customerEmail === "juliozaldivar@gmail.com" || customUserId === "default" || customUserId === "user-julio";
  const targetUserId = customUserId || (isJulio ? "default" : (customerEmail ? `user-${customerEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "_")}` : "default"));

  // Check if this event grants or revokes VIP
  const isGrantEvent = [
    "order_created",
    "subscription_created",
    "subscription_resumed",
    "subscription_unpaused",
    "subscription_payment_success"
  ].includes(eventName) || (subscriptionStatus === "active" || subscriptionStatus === "on_trial");

  const isRevokeEvent = [
    "subscription_expired",
    "order_refunded"
  ].includes(eventName) || (subscriptionStatus === "expired");

  const isCancelledEvent = eventName === "subscription_cancelled" || subscriptionStatus === "cancelled";

  // 1. Update Local JSON Database
  try {
    const db = helpers.readDatabase();
    const targetBoardIds = isJulio ? ["default", "user-julio"] : [targetUserId];

    for (const bId of targetBoardIds) {
      if (db[bId]) {
        if (!db[bId].owner) {
          db[bId].owner = {
            id: bId,
            name: customerName || (isJulio ? "Julio" : "User"),
            email: customerEmail || (isJulio ? "juliozaldivar@gmail.com" : ""),
            createdAt: new Date().toISOString()
          };
        }

        if (isGrantEvent) {
          db[bId].owner.isVip = true;
          db[bId].owner.isPro = true;
          db[bId].owner.vipPlan = plan;
          db[bId].owner.vipSince = db[bId].owner.vipSince || new Date().toISOString();
          db[bId].owner.subscriptionStatus = "active";
          if (renewsAt) db[bId].owner.subscriptionRenewsAt = renewsAt;
          if (customerPortalUrl) db[bId].owner.lemonSqueezyCustomerPortalUrl = customerPortalUrl;
          if (orderId) db[bId].owner.lemonSqueezyOrderId = orderId;
        } else if (isRevokeEvent) {
          db[bId].owner.isVip = false;
          db[bId].owner.isPro = false;
          db[bId].owner.subscriptionStatus = "expired";
        } else if (isCancelledEvent) {
          // Keep active until billing period ends (renewsAt)
          db[bId].owner.subscriptionStatus = "cancelled";
        }

        db[bId].updatedAt = new Date().toISOString();
        helpers.writeDatabase(db, bId);
      }
    }
  } catch (err) {
    console.error("[Lemon Squeezy Webhook] Error updating local db:", err);
  }

  // 2. Update Cloud Firestore
  if (helpers.dbFirestore && !helpers.isFirestoreQuotaExhausted) {
    try {
      const userUpdatePayload: any = {
        updatedAt: new Date().toISOString(),
        ...(customerEmail ? { email: customerEmail } : {}),
        ...(customerName ? { name: customerName } : {})
      };

      if (isGrantEvent) {
        userUpdatePayload.isVip = true;
        userUpdatePayload.isPro = true;
        userUpdatePayload.vipPlan = plan;
        userUpdatePayload.vipSince = new Date().toISOString();
        userUpdatePayload.subscriptionStatus = "active";
        if (renewsAt) userUpdatePayload.subscriptionRenewsAt = renewsAt;
        if (customerPortalUrl) userUpdatePayload.lemonSqueezyCustomerPortalUrl = customerPortalUrl;
        if (orderId) userUpdatePayload.lemonSqueezyOrderId = orderId;
      } else if (isRevokeEvent) {
        userUpdatePayload.isVip = false;
        userUpdatePayload.isPro = false;
        userUpdatePayload.subscriptionStatus = "expired";
      } else if (isCancelledEvent) {
        userUpdatePayload.subscriptionStatus = "cancelled";
      }

      setDoc(doc(helpers.dbFirestore, "users", targetUserId), userUpdatePayload, { merge: true }).catch((err) => {
        console.warn("[Lemon Squeezy Webhook] Firestore user update error:", err?.message || err);
      });

      if (isJulio) {
        setDoc(doc(helpers.dbFirestore, "users", "default"), userUpdatePayload, { merge: true }).catch(() => {});
        setDoc(doc(helpers.dbFirestore, "users", "user-julio"), userUpdatePayload, { merge: true }).catch(() => {});
      }
    } catch (err) {
      console.error("[Lemon Squeezy Webhook] Firestore write exception:", err);
    }
  }

  // 3. Update In-Memory Community Users Cache
  const match = helpers.communityUsers.find(
    (u) => u.id === targetUserId || (isJulio && (u.id === "default" || u.id === "user-julio")) || (customerEmail && u.email?.toLowerCase() === customerEmail)
  );

  if (match) {
    if (isGrantEvent) {
      match.isVip = true;
      match.isPro = true;
      match.vipPlan = plan;
    } else if (isRevokeEvent) {
      match.isVip = false;
      match.isPro = false;
    }
  }

  return {
    success: true,
    event: eventName,
    userId: targetUserId,
    action: isGrantEvent ? "granted_vip" : isRevokeEvent ? "revoked_vip" : "updated_status"
  };
}
