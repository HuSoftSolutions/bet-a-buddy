import { User } from '@/types/user';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config';

// Create a new user document in Firestore
export const createUser = async (userData: Partial<User>): Promise<void> => {
  if (!userData.uid) throw new Error('User ID is required');
  
  const userRef = doc(db, 'users', userData.uid);
  
  await setDoc(userRef, {
    ...userData,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
};

// Get user profile by ID
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as User;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    // Return null instead of throwing to prevent cascading errors
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, userData: Partial<User>): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  
  await updateDoc(userRef, {
    ...userData,
    updatedAt: Date.now(),
  });
};
