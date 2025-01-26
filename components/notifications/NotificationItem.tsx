interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    timestamp: number;
  };
}

export const NotificationItem = ({ notification }: NotificationItemProps) => {
  return (
    <div className="p-4 border-b hover:bg-gray-50">
      <h4 className="font-semibold">{notification.title}</h4>
      <p className="text-sm text-gray-600">{notification.message}</p>
    </div>
  );
};
