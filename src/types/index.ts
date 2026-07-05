export type Role = "ADMIN" | "PASSENGER";

export type TripStatus = "SCHEDULED" | "ON_TIME" | "DELAYED" | "CANCELLED" | "COMPLETED";

export interface RouteDTO {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distanceKm: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DelayDTO {
  id: string;
  tripId: string;
  delayMinutes: number;
  reason: string;
  reportedAt: string;
}

export interface TripDTO {
  id: string;
  routeId: string;
  departureTime: string;
  arrivalTime: string;
  stops: string[];
  status: TripStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  route?: RouteDTO;
  delays?: DelayDTO[];
}

// Generic envelope every /api/v1 endpoint returns. Keeping a consistent
// shape (data / error / meta) is what makes the same client fetch logic
// reusable from the Android app later.
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}
