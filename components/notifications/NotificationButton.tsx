// components/notifications/NotificationButton.tsx
import { useState } from "react";
import { NotificationList } from "./NotificationList";
import { BsBell } from "react-icons/bs";

export const NotificationButton = () => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "8px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BsBell size={20} />
      </button>
      {showNotifications && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            marginTop: "10px",
            zIndex: 1000,
          }}
        >
          <NotificationList />
        </div>
      )}
    </div>
  );
};
