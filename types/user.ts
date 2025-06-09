export interface User {
  id?: string;
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  handicap?: number;
  rating?: number;
  wins?: number;
  losses?: number;
  createdAt?: number;
  updatedAt?: number;
}