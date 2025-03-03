// src/services/routeService.ts
import { supabase } from '../lib/supabase';
import { Route, RoutePoint } from '../types/route';

export async function loadRoutes(): Promise<Route[]> {
  try {
    // Fetch all route points from Supabase
    const { data: routePoints, error } = await supabase
      .from('aggregated_theft_routes')
      .select('*')
      .order('point_order', { ascending: true });
      
    if (error) throw error;
    
    // Group points by route_id
    const routesMap = new Map<string, RoutePoint[]>();
    
    routePoints.forEach(point => {
      if (!routesMap.has(point.route_id)) {
        routesMap.set(point.route_id, []);
      }
      routesMap.get(point.route_id)!.push(point);
    });
    
    // Convert map to array of Route objects
    const routes: Route[] = [];
    routesMap.forEach((points, id) => {
      routes.push({
        id,
        points: points.sort((a, b) => a.point_order - b.point_order)
      });
    });
    
    return routes;
  } catch (error) {
    console.error('Error loading routes:', error);
    throw error;
  }
}
