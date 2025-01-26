export interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: number;
    cta?: string;
    app?: string;
    icon?: string;
    image?: string;
    read?: boolean;
  }
  
  export interface NotificationPayload {
    title: string;
    body: string;
    cta?: string;
    img?: string;
  }
  