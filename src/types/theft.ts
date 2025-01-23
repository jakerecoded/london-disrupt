export interface TheftLocation {
    id: string;
    longitude: number;
    latitude: number;
    date: string;
    bikeDescription: string;
    theftDescription?: string;
    lockType?: string;
    policeCaseNumber?: string;
  }