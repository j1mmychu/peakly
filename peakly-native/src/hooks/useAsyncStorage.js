// ─── AsyncStorage Hook ──────────────────────────────────────────────────────
// React Native equivalent of the web useLocalStorage hook
// Uses AsyncStorage instead of localStorage

import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAsyncStorage(key, initial) {
  const [val, setVal] = useState(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(key).then(s => {
      if (s !== null) {
        try { setVal(JSON.parse(s)); } catch {}
      }
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, [key]);

  const save = useCallback(v => {
    setVal(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      AsyncStorage.setItem(key, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, [key]);

  return [val, save, loaded];
}
