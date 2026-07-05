import { PrismaClient, Role, TripStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@buslines.example";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin",
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN
    }
  });
  console.log(`Admin user ready: ${admin.email}`);

  const route1 = await prisma.route.upsert({
    where: { id: "seed-route-1" },
    update: {},
    create: {
      id: "seed-route-1",
      name: "Coastal Express",
      origin: "Portside",
      destination: "Harbor City",
      distanceKm: 142.5
    }
  });

  const route2 = await prisma.route.upsert({
    where: { id: "seed-route-2" },
    update: {},
    create: {
      id: "seed-route-2",
      name: "Mountain Line",
      origin: "Riverdale",
      destination: "Summit Pass",
      distanceKm: 210.0
    }
  });

  const now = new Date();
  const inHours = (h: number) => new Date(now.getTime() + h * 60 * 60 * 1000);

  const trip1 = await prisma.trip.upsert({
    where: { id: "seed-trip-1" },
    update: {},
    create: {
      id: "seed-trip-1",
      routeId: route1.id,
      departureTime: inHours(2),
      arrivalTime: inHours(5),
      stops: ["Portside", "Bay Junction", "Harbor City"],
      status: TripStatus.ON_TIME
    }
  });

  const trip2 = await prisma.trip.upsert({
    where: { id: "seed-trip-2" },
    update: {},
    create: {
      id: "seed-trip-2",
      routeId: route2.id,
      departureTime: inHours(4),
      arrivalTime: inHours(9),
      stops: ["Riverdale", "Pinecrest", "Summit Pass"],
      status: TripStatus.DELAYED
    }
  });

  await prisma.delay.upsert({
    where: { id: "seed-delay-1" },
    update: {},
    create: {
      id: "seed-delay-1",
      tripId: trip2.id,
      delayMinutes: 25,
      reason: "Road maintenance near Pinecrest"
    }
  });

  console.log("Seed data ready:", { route1: route1.name, route2: route2.name, trip1: trip1.id, trip2: trip2.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
