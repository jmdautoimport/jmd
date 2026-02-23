import { isFirebaseInitialized } from "./firebase";

// Register the admin device for web push notifications via Firebase Cloud Messaging (FCM)
// - Requests notification permission
// - Registers the FCM service worker
// - Retrieves the web push token and posts it to the server
export async function registerForNotifications(): Promise<void> {
  try {
    if (!isFirebaseInitialized) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;

    // Check if Messaging is supported in this browser
    const messagingMod = await import("firebase/messaging");
    const supported = await messagingMod.isSupported();
    if (!supported) return;

    // Request permission from the user on admin pages
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    // Register the service worker for background notifications
    const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    // Initialize messaging and get the device token
    const { getMessaging, getToken, onMessage } = messagingMod;
    const messaging = getMessaging();

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swReg,
    });

    if (!token) return;

    // Send token to backend to register admin device
    await fetch("/api/notify/register-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    // Optional: handle foreground messages while admin page is open
    onMessage(messaging, (payload) => {
      // Basic in-page notification; could be replaced with a toast
      const title = payload.notification?.title || "Notification";
      const body = payload.notification?.body || "";
      if (title || body) {
        try {
          // Show a simple Notification if permission is granted
          new Notification(title, { body });
        } catch {
          // Fallback to console if Notification constructor is blocked
          console.log("FCM message:", { title, body, payload });
        }
      }
    });
  } catch (err) {
    console.warn("Failed to register for notifications", err);
  }
}