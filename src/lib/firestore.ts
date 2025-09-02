import { initializeFirestore, persistentLocalCache, memoryLocalCache, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { app } from './firebase';

// Initialize Firestore with persistent cache
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
      cacheSizeBytes: CACHE_SIZE_UNLIMITED
  }),
  // Use memory cache as a fallback for environments that don't support persistence
  // localCache: memoryLocalCache(),
});

export { db };
