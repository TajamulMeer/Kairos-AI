import { useEffect } from 'react';
import { notificationService } from '../services/notification.service';

export function useNotifications() {
  useEffect(() => {
    notificationService.registerToken();
    notificationService.onBackgroundMessage();

    const unsubscribe = notificationService.onForegroundMessage(message => {
      console.log('Foreground FCM message:', message);
    });

    return unsubscribe;
  }, []);
}
