import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import { apiService } from './api.service';
import { ENDPOINTS } from '../constants/api';

class NotificationService {
  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    }
    const authStatus = await messaging().requestPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  }

  async registerToken(): Promise<void> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) return;

      const token = await messaging().getToken();
      await apiService.post(ENDPOINTS.NOTIFICATIONS.REGISTER_TOKEN, { token, platform: Platform.OS });
    } catch (error) {
      console.warn('FCM token registration failed:', error);
    }
  }

  onForegroundMessage(handler: (message: any) => void) {
    return messaging().onMessage(handler);
  }

  onBackgroundMessage() {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background message:', remoteMessage);
    });
  }
}

export const notificationService = new NotificationService();
