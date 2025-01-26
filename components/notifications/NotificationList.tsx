import { useEffect, useState } from "react";
import * as PushAPI from "@pushprotocol/restapi";
import { NotificationItem } from "./NotificationItem";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  cta?: string;
  app?: string;
  icon?: string;
  image?: string;
}

export const NotificationList = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg">
      {notifications.map((notification: Notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
};
