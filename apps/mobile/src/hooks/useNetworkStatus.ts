import {useEffect} from 'react';
import NetInfo from '@react-native-community/netinfo';
import {useAppStore} from '@store/app.store';

export function useNetworkStatus() {
  const {setOffline} = useAppStore();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setOffline(!state.isConnected);
    });
    return unsubscribe;
  }, [setOffline]);
}
