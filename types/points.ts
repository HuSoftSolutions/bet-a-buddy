export interface PointsHistory {
  id: string;
  userId: string;
  matchId: string;
  points: number;
  reason: 'match_completion' | 'achievement' | 'bonus';
  createdAt: number;
}

export interface UserPoints {
  total: number;
  history: PointsHistory[];
}