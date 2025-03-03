// src/types/route.ts
export interface RoutePoint {
  id: string;
  route_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  type: string;
  point_order: number;
  created_at: string;
}

export interface Route {
  id: string;
  points: RoutePoint[];
}
