export interface Match {
  id: string;
  title: string;
  description?: string;
  hostId: string;
  participants: string[];
  participantEmails?: Record<string, string>;
  numberOfHoles: number;
  location?: string;
  locationName?: string;
  address?: Location;
  scheduledFor?: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  createdAt: number;
  updatedAt?: number;
  completedAt?: number;
  scores?: Record<number, Record<string, number>>;
  readyForPointsAward?: boolean;
  pointsAwarded?: boolean;
  type?: 'invite';
}

export interface Location {
  address: string;
  lat: number;
  lng: number;
  placeId: string;
  locationName?: string;
}

export interface MatchInvitation {
  id: string;
  matchId: string;
  invitedBy: string;
  email: string;
  createdAt: number;
  accepted: boolean;
  acceptedAt?: number;
}
