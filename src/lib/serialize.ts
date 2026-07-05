import { Route, Trip, Delay } from "@prisma/client";
import { RouteDTO, TripDTO, DelayDTO } from "@/types";

export function serializeRoute(route: Route): RouteDTO {
  return {
    id: route.id,
    name: route.name,
    origin: route.origin,
    destination: route.destination,
    distanceKm: route.distanceKm,
    isActive: route.isActive,
    createdAt: route.createdAt.toISOString(),
    updatedAt: route.updatedAt.toISOString()
  };
}

export function serializeDelay(delay: Delay): DelayDTO {
  return {
    id: delay.id,
    tripId: delay.tripId,
    delayMinutes: delay.delayMinutes,
    reason: delay.reason,
    reportedAt: delay.reportedAt.toISOString()
  };
}

export function serializeTrip(trip: Trip & { route?: Route; delays?: Delay[] }): TripDTO {
  return {
    id: trip.id,
    routeId: trip.routeId,
    departureTime: trip.departureTime.toISOString(),
    arrivalTime: trip.arrivalTime.toISOString(),
    stops: trip.stops,
    status: trip.status,
    isActive: trip.isActive,
    createdAt: trip.createdAt.toISOString(),
    updatedAt: trip.updatedAt.toISOString(),
    route: trip.route ? serializeRoute(trip.route) : undefined,
    delays: trip.delays ? trip.delays.map(serializeDelay) : undefined
  };
}
