import { useCallback, useEffect, useState } from "react";

export function useNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined"
      ? Notification.permission
      : "unsupported",
  );

  useEffect(() => {
    if (typeof Notification === "undefined") return;
    setPermission(Notification.permission);
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return "unsupported";
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "denied";
    }
  }, []);

  const notify = useCallback((title, options = {}) => {
    if (typeof Notification === "undefined") {
      console.warn("Notifications not supported in this browser");
      return;
    }

    if (Notification.permission !== "granted") {
      console.warn("Notification permission not granted");
      return;
    }

    try {
      // Create notification with proper options
      const notification = new Notification(title, {
        body: options.body || "",
        icon: options.icon || "/favicon.ico",
        silent: options.silent || false,
        vibrate: options.vibrate || [200, 100, 200],
        ...options,
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle click to focus the tab
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  }, []);

  return { permission, requestPermission, notify };
}
