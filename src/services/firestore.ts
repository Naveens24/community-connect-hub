import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  getDoc,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

// Types
export interface Request {
  id: string;
  title: string;
  description: string;
  category: string;
  payment: number;
  createdBy: string;
  creatorName?: string;
  creatorPhoto?: string;
  status: 'open' | 'in_review' | 'assigned' | 'completed';
  createdAt: Timestamp;
}

export interface Pitch {
  id: string;
  requestId: string;
  helperId: string;
  helperName?: string;
  helperPhoto?: string;
  pitchText: string;
  skills: string[];
  createdAt: Timestamp;
}

// Requests
export const subscribeToRequests = (callback: (requests: Request[]) => void) => {
  const q = query(
    collection(db, 'requests'),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, async (snapshot) => {
    const requests: Request[] = [];
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      // Fetch creator info
      const userRef = doc(db, 'users', data.createdBy);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      
      requests.push({
        id: docSnap.id,
        ...data,
        creatorName: userData?.name || 'Unknown User',
        creatorPhoto: userData?.photoURL || ''
      } as Request);
    }
    callback(requests);
  });
};

export const createRequest = async (
  title: string,
  description: string,
  category: string,
  payment: number,
  userId: string
) => {
  const docRef = await addDoc(collection(db, 'requests'), {
    title,
    description,
    category,
    payment,
    createdBy: userId,
    status: 'open',
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateRequestStatus = async (requestId: string, status: Request['status']) => {
  const requestRef = doc(db, 'requests', requestId);
  await updateDoc(requestRef, { status });
};

export const deleteRequest = async (requestId: string) => {
  // Delete the request
  const requestRef = doc(db, 'requests', requestId);
  await deleteDoc(requestRef);
  
  // Also delete associated pitches
  const pitchesQuery = query(collection(db, 'pitches'), where('requestId', '==', requestId));
  const pitchesSnap = await getDocs(pitchesQuery);
  for (const pitchDoc of pitchesSnap.docs) {
    await deleteDoc(doc(db, 'pitches', pitchDoc.id));
  }
};

// Pitches
export const subscribeToPitches = (requestId: string, callback: (pitches: Pitch[]) => void) => {
  const q = query(
    collection(db, 'pitches'),
    where('requestId', '==', requestId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, async (snapshot) => {
    const pitches: Pitch[] = [];
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      // Fetch helper info
      const userRef = doc(db, 'users', data.helperId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      
      pitches.push({
        id: docSnap.id,
        ...data,
        helperName: userData?.name || 'Unknown User',
        helperPhoto: userData?.photoURL || ''
      } as Pitch);
    }
    callback(pitches);
  });
};

export const createPitch = async (
  requestId: string,
  helperId: string,
  pitchText: string,
  skills: string[]
) => {
  // Check if user already pitched
  const q = query(
    collection(db, 'pitches'),
    where('requestId', '==', requestId),
    where('helperId', '==', helperId)
  );
  const existing = await getDocs(q);
  if (!existing.empty) {
    throw new Error('You have already pitched for this request');
  }

  await addDoc(collection(db, 'pitches'), {
    requestId,
    helperId,
    pitchText,
    skills,
    createdAt: serverTimestamp()
  });

  // Update request status to in_review
  const requestRef = doc(db, 'requests', requestId);
  const requestSnap = await getDoc(requestRef);
  if (requestSnap.exists() && requestSnap.data().status === 'open') {
    await updateDoc(requestRef, { status: 'in_review' });
  }
};

export const hasUserPitched = async (requestId: string, userId: string): Promise<boolean> => {
  const q = query(
    collection(db, 'pitches'),
    where('requestId', '==', requestId),
    where('helperId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

// User Profile
export const updateUserProfile = async (
  uid: string,
  updates: { name?: string; skills?: string[]; photoURL?: string }
) => {
  const userRef = doc(db, 'users', uid);
  // Use setDoc with merge to create doc if it doesn't exist
  await setDoc(userRef, updates, { merge: true });
};

export const uploadProfileImage = async (uid: string, file: File): Promise<string> => {
  const storageRef = ref(storage, `profiles/${uid}.jpg`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  await updateUserProfile(uid, { photoURL: downloadURL });
  return downloadURL;
};

export const incrementHelpsGiven = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const currentHelps = userSnap.data().helpsGiven || 0;
    await updateDoc(userRef, { helpsGiven: currentHelps + 1 });
  }
};

// Subscribe to user's posted requests (real-time)
export const subscribeToUserRequests = (userId: string, callback: (requests: Request[]) => void) => {
  // Removed orderBy to avoid requiring composite index
  const q = query(
    collection(db, 'requests'),
    where('createdBy', '==', userId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as Request));
    // Sort client-side instead
    requests.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
    callback(requests);
  });
};

// Subscribe to user's submitted pitches (real-time)
export const subscribeToUserPitches = (userId: string, callback: (pitches: (Pitch & { requestTitle?: string })[]) => void) => {
  // Removed orderBy to avoid requiring composite index
  const q = query(
    collection(db, 'pitches'),
    where('helperId', '==', userId)
  );
  
  return onSnapshot(q, async (snapshot) => {
    const pitches: (Pitch & { requestTitle?: string })[] = [];
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const requestRef = doc(db, 'requests', data.requestId);
      const requestSnap = await getDoc(requestRef);
      const requestTitle = requestSnap.exists() ? requestSnap.data().title : 'Unknown Request';
      
      pitches.push({
        id: docSnap.id,
        ...data,
        requestTitle
      } as Pitch & { requestTitle?: string });
    }
    
    // Sort client-side instead
    pitches.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
    
    callback(pitches);
  });
};
