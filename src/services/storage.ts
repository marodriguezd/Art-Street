import { UserProfile, CheckState, MilestoneArtwork, AppStateData } from '../types/curriculum';

const DB_NAME = 'ArtStreetDB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('profile')) {
        db.createObjectStore('profile', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('checks')) {
        db.createObjectStore('checks', { keyPath: 'checkId' });
      }

      if (!db.objectStoreNames.contains('milestones')) {
        db.createObjectStore('milestones', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('sketches')) {
        db.createObjectStore('sketches', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

// User Profile Operations
export async function getProfile(): Promise<UserProfile | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('profile', 'readonly');
      const store = tx.objectStore('profile');
      const req = store.get('current_user');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Fallback to localStorage for profile:', e);
    const raw = localStorage.getItem('art_street_profile');
    return raw ? JSON.parse(raw) : null;
  }
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('profile', 'readwrite');
      const store = tx.objectStore('profile');
      const req = store.put({ ...profile, id: 'current_user' });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Fallback to localStorage for profile save:', e);
  }
  // Keep lightweight profile in localStorage as safety mirror
  localStorage.setItem('art_street_profile', JSON.stringify({ ...profile, baselineArtwork: profile.baselineArtwork ? { ...profile.baselineArtwork, dataUrl: 'stored_in_idb' } : undefined }));
}

// Check States Operations
export async function getAllCheckStates(): Promise<Record<string, CheckState>> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('checks', 'readonly');
      const store = tx.objectStore('checks');
      const req = store.getAll();
      req.onsuccess = () => {
        const records: CheckState[] = req.result || [];
        const map: Record<string, CheckState> = {};
        for (const item of records) {
          map[item.checkId] = item;
        }
        resolve(map);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Fallback to localStorage for checks:', e);
    const raw = localStorage.getItem('art_street_checks');
    return raw ? JSON.parse(raw) : {};
  }
}

export async function saveCheckState(state: CheckState): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('checks', 'readwrite');
      const store = tx.objectStore('checks');
      const req = store.put(state);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Fallback to localStorage for saveCheckState:', e);
    const raw = localStorage.getItem('art_street_checks');
    const map = raw ? JSON.parse(raw) : {};
    map[state.checkId] = state;
    localStorage.setItem('art_street_checks', JSON.stringify(map));
  }
}

// Milestones & Graduation Artworks
export async function getMilestones(): Promise<MilestoneArtwork[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('milestones', 'readonly');
      const store = tx.objectStore('milestones');
      const req = store.getAll();
      req.onsuccess = () => {
        const list: MilestoneArtwork[] = req.result || [];
        // Sort chronologically and by termNumber
        list.sort((a, b) => a.termNumber - b.termNumber);
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Fallback to localStorage for milestones:', e);
    const raw = localStorage.getItem('art_street_milestones');
    return raw ? JSON.parse(raw) : [];
  }
}

export async function saveMilestone(milestone: MilestoneArtwork): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('milestones', 'readwrite');
      const store = tx.objectStore('milestones');
      const req = store.put(milestone);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Fallback to localStorage for saveMilestone:', e);
    const current = await getMilestones();
    const filtered = current.filter(m => m.id !== milestone.id);
    filtered.push(milestone);
    localStorage.setItem('art_street_milestones', JSON.stringify(filtered));
  }
}

export async function deleteMilestone(id: string): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('milestones', 'readwrite');
      const store = tx.objectStore('milestones');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Fallback to localStorage for deleteMilestone:', e);
  }
}

// Full Export / Backup and Import
export async function exportAllData(): Promise<AppStateData> {
  const profile = await getProfile();
  const checks = await getAllCheckStates();
  const milestones = await getMilestones();

  // If testing with clean database or no onboarding done yet, provide valid starter profile
  const fallbackProfile: UserProfile = {
    id: 'profile_default',
    name: 'Artista Inicial',
    medium: 'traditional',
    goal: 'Comenzar el camino del artista desde cero',
    createdAt: new Date().toISOString(),
    xp: 0,
    streakDays: 1,
    lastActiveDate: new Date().toISOString(),
  };

  return {
    profile: profile || fallbackProfile,
    checks: checks || {},
    milestones: milestones || [],
  };
}

export async function importAllData(data: AppStateData): Promise<void> {
  const db = await getDB();

  // Import profile
  if (data.profile) {
    await saveProfile(data.profile);
  }

  // Import checks
  if (data.checks) {
    const tx = db.transaction('checks', 'readwrite');
    const store = tx.objectStore('checks');
    await new Promise<void>((resolve, reject) => {
      store.clear().onsuccess = () => {
        const entries = Object.values(data.checks);
        for (const c of entries) {
          store.put(c);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
    });
  }

  // Import milestones
  if (data.milestones && Array.isArray(data.milestones)) {
    const tx = db.transaction('milestones', 'readwrite');
    const store = tx.objectStore('milestones');
    await new Promise<void>((resolve, reject) => {
      store.clear().onsuccess = () => {
        for (const m of data.milestones) {
          store.put(m);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
    });
  }
}
