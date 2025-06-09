export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface FriendRequest {
  id: string;
  senderId: string;
  recipientId: string;
  status: FriendRequestStatus;
  createdAt: number;
  updatedAt?: number;
}

export interface Friendship {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: number;
}