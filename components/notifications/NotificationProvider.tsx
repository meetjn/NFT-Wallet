import { createContext, useContext, ReactNode } from "react";
import * as PushAPI from "@pushprotocol/restapi";

interface NotificationContextType {
  notifications: any[];
  fetchNotifications: () => Promise<void>;
  sendNotification: (title: string, body: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  fetchNotifications: async () => {},
  sendNotification: async () => {},
});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  // Implementation will be added later
  const value: NotificationContextType = {
    notifications: [],
    fetchNotifications: async () => {
      // Implementation
    },
    sendNotification: async (title: string, body: string) => {
      // Implementation
    },
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
