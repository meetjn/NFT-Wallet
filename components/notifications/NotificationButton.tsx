import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useNotifications } from "@/context/NotificationContext";
import { Bell } from "lucide-react";

export const NotificationButton = () => {
  const [open, setOpen] = useState(false);
  const { notifications } = useNotifications();

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="relative p-2 rounded-full hover:bg-gray-200"
      >
        <Bell size={20} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-96">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>
          <div className="max-h-60 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-400">No new notifications</p>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="p-3 border-b border-gray-700">
                  <p className="font-semibold">{notif.title}</p>
                  <p className="text-sm text-gray-400">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
