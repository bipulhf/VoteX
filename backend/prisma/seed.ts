import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create default election types
  const presidentialType = await prisma.electionType.upsert({
    where: { name: "Presidential Election" },
    update: {},
    create: {
      name: "Presidential Election",
      description: "National election for selecting the head of state",
    },
  });

  const parliamentaryType = await prisma.electionType.upsert({
    where: { name: "Parliamentary Election" },
    update: {},
    create: {
      name: "Parliamentary Election",
      description: "Election for selecting parliamentary representatives",
    },
  });

  const localType = await prisma.electionType.upsert({
    where: { name: "Local Government Election" },
    update: {},
    create: {
      name: "Local Government Election",
      description: "Election for local government officials",
    },
  });

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@votingsystem.com" },
    update: {},
    create: {
      email: "admin@votingsystem.com",
      password: adminPassword,
      firstName: "System",
      lastName: "Administrator",
      role: UserRole.ADMIN,
      isEmailVerified: true,
    },
  });

  // Create test users
  const userPassword = await bcrypt.hash("user123456", 12);

  const user1 = await prisma.user.upsert({
    where: { email: "john.doe@example.com" },
    update: {},
    create: {
      email: "john.doe@example.com",
      password: userPassword,
      firstName: "John",
      lastName: "Doe",
      role: UserRole.USER,
      isEmailVerified: true,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "jane.smith@example.com" },
    update: {},
    create: {
      email: "jane.smith@example.com",
      password: userPassword,
      firstName: "Jane",
      lastName: "Smith",
      role: UserRole.USER,
      isEmailVerified: true,
    },
  });

  // Create a sample election
  const sampleElection = await prisma.election.create({
    data: {
      title: "Sample Presidential Election 2024",
      description: "A demonstration election for testing the voting system",
      electionTypeId: presidentialType.id,
      createdById: admin.id,
      startDate: new Date("2024-06-01T08:00:00Z"),
      endDate: new Date("2024-06-01T20:00:00Z"),
      status: "PUBLISHED",
    },
  });

  // Add candidates to the sample election
  await prisma.candidate.createMany({
    data: [
      {
        name: "Alice Johnson",
        party: "Progressive Party",
        description: "Experienced leader focused on education and healthcare",
        electionId: sampleElection.id,
        position: 1,
      },
      {
        name: "Bob Wilson",
        party: "Conservative Alliance",
        description: "Business-oriented candidate promoting economic growth",
        electionId: sampleElection.id,
        position: 2,
      },
      {
        name: "Carol Davis",
        party: "Green Movement",
        description: "Environmental advocate for sustainable development",
        electionId: sampleElection.id,
        position: 3,
      },
    ],
  });

  // Add commissioners to the sample election
  await prisma.electionCommissioner.createMany({
    data: [
      {
        userId: user1.id,
        electionId: sampleElection.id,
      },
      {
        userId: user2.id,
        electionId: sampleElection.id,
      },
    ],
  });

  console.log("✅ Database seeding completed!");
  console.log("👤 Admin credentials: admin@votingsystem.com / admin123456");
  console.log("👤 Test user credentials: john.doe@example.com / user123456");
  console.log("👤 Test user credentials: jane.smith@example.com / user123456");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
