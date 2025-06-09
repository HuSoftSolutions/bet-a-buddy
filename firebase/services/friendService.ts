import { db } from "@/firebase/config";
import { collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { FriendRequest } from "@/types/friend";

const friendRequestsCollection = collection(db, 'friendRequests');
const friendsCollection = collection(db, 'friends');

// Accept a friend request
export async function acceptFriendRequest(requestId: string): Promise<void> {
  try {
    const requestDoc = await getDoc(doc(friendRequestsCollection, requestId));
    
    if (!requestDoc.exists()) {
      throw new Error('Friend request not found');
    }
    
    const request = { id: requestDoc.id, ...requestDoc.data() } as FriendRequest;
    
    if (request.status !== 'pending') {
      throw new Error('Friend request already processed');
    }
    
    // Update request status
    await updateDoc(doc(friendRequestsCollection, requestId), {
      status: 'accepted',
      updatedAt: Date.now()
    });
    
    // Create friendship - make sure the current user is one of the users
    await addDoc(friendsCollection, {
      user1Id: request.senderId,
      user2Id: request.recipientId,
      createdAt: Date.now()
    });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
}

// Reject a friend request
export async function rejectFriendRequest(requestId: string): Promise<void> {
  try {
    await updateDoc(doc(friendRequestsCollection, requestId), {
      status: 'rejected',
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    throw error;
  }
}

// Check if two users are friends
export async function areFriends(userId1: string, userId2: string): Promise<boolean> {
  try {
    const q1 = query(
      friendsCollection,
      where('user1Id', '==', userId1),
      where('user2Id', '==', userId2)
    );
    
    const q2 = query(
      friendsCollection,
      where('user1Id', '==', userId2),
      where('user2Id', '==', userId1)
    );
    
    const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    
    return !snapshot1.empty || !snapshot2.empty;
  } catch (error) {
    console.error('Error checking friendship:', error);
    throw error;
  }
}

// Get pending friend requests for a user
export async function getPendingFriendRequests(userId: string): Promise<FriendRequest[]> {
  try {
    const q = query(
      friendRequestsCollection,
      where('recipientId', '==', userId),
      where('status', '==', 'pending')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FriendRequest));
  } catch (error) {
    console.error('Error getting pending friend requests:', error);
    throw error;
  }
}

// Get all friends for a user
export async function getUserFriends(userId: string): Promise<string[]> {
  try {
    const q1 = query(friendsCollection, where('user1Id', '==', userId));
    const q2 = query(friendsCollection, where('user2Id', '==', userId));
    
    const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    
    const friends: string[] = [];
    
    snapshot1.forEach(doc => {
      const data = doc.data();
      friends.push(data.user2Id);
    });
    
    snapshot2.forEach(doc => {
      const data = doc.data();
      friends.push(data.user1Id);
    });
    
    return friends;
  } catch (error) {
    console.error('Error getting user friends:', error);
    throw error;
  }
}

// Remove a friend
export async function removeFriend(userId: string, friendId: string): Promise<void> {
  try {
    // Find the friendship document
    const q1 = query(
      friendsCollection,
      where('user1Id', '==', userId),
      where('user2Id', '==', friendId)
    );
    
    const q2 = query(
      friendsCollection,
      where('user1Id', '==', friendId),
      where('user2Id', '==', userId)
    );
    
    const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    
    // Delete the friendship document(s)
    const deletePromises: Promise<void>[] = [];
    
    snapshot1.forEach(doc => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    snapshot2.forEach(doc => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
}

// Send a friend request
export async function sendFriendRequest(senderId: string, recipientId: string): Promise<string> {
  try {
    // Check if a request already exists
    const q = query(
      friendRequestsCollection,
      where('senderId', '==', senderId),
      where('recipientId', '==', recipientId),
      where('status', '==', 'pending')
    );
    
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      throw new Error('Friend request already sent');
    }
    
    // Create a new friend request
    const newRequest = {
      senderId,
      recipientId,
      status: 'pending',
      createdAt: Date.now()
    };
    
    const docRef = await addDoc(friendRequestsCollection, newRequest);
    return docRef.id;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
}
