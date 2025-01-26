"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import * as PushAPI from "@pushprotocol/restapi";
import { useAccount, useWalletClient } from "wagmi";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  cta: string;
  app: string;
  icon: string;
  image: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  sendNotification: (title: string, body: string) => Promise<void>;
  markAsRead: (notificationId: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const fetchNotifications = async () => {
    if (!address || !isConnected) return;

    try {
      const feeds = await PushAPI.user.getFeeds({
        user: `eip155:5:${address}`, // for Goerli testnet
        env: "staging",
      });

      const formattedNotifications = feeds.map((feed: any) => ({
        id: feed.id,
        title: feed.title,
        message: feed.message,
        timestamp: feed.timestamp,
        cta: feed.cta,
        app: feed.app,
        icon: feed.icon,
        image: feed.image,
      }));

      setNotifications(formattedNotifications);
      setUnreadCount(formattedNotifications.length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const sendNotification = async (title: string, body: string) => {
    if (!address || !walletClient) return;

    try {
      await PushAPI.payloads.sendNotification({
        signer: walletClient,
        type: 3,
        identityType: 2,
        notification: {
          title,
          body,
        },
        payload: {
          title,
          body,
          cta: "",
          img: "",
        },
        recipients: `eip155:5:${address}`, // user address in CAIP
        channel: process.env.NEXT_PUBLIC_PUSH_CHANNEL_ADDRESS!, // your channel address
        env: "staging",
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchNotifications();
    }
  }, [isConnected, address]);

  // Set up Push Protocol user subscription
  useEffect(() => {
    const initializePushProtocol = async () => {
      if (!address || !isConnected) return;

      try {
        await PushAPI.user.subscribe({
          signer: walletClient,
          channelAddress: process.env.NEXT_PUBLIC_PUSH_CHANNEL_ADDRESS!, // channel address in CAIP
          userAddress: `eip155:5:${address}`, // user address in CAIP
          onSuccess: () => {
            console.log("Opt-in Success");
          },
          onError: () => {
            console.error("Opt-in Error");
          },
          env: "staging",
        });
      } catch (error) {
        console.error("Error initializing Push Protocol:", error);
      }
    };

    initializePushProtocol();
  }, [address, isConnected, walletClient]);

  const value = {
    notifications,
    unreadCount,
    fetchNotifications,
    sendNotification,
    markAsRead,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
