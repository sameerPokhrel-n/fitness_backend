import prisma from "../src/prisma";
import bcrypt from "bcrypt";


async function main() {
  // 1. Create Admin User (author for exercises)
  const adminPassword = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@fitnessapp.com" },
    update: {},
    create: {
      email: "admin@fitnessapp.com",
      password: adminPassword,
      isVerified: true,
      role: "ADMIN",
      profile: {
        create: {
          heightCm: 175,
          weightKg: 70,
        },
      },
    },
  });

  // 2. Create Sample Exercises
  await prisma.exercise.createMany({
    data: [
      {
        category: "Strength",
        authorId: admin.id,
        title: "Push Up",
        description: "A bodyweight exercise for chest, shoulders, and triceps.",
        difficulty: "Beginner",
        muscleGroup: "Chest",
      },
      {
        category: "Strength",
        authorId: admin.id,
        title: "Squat",
        description: "A compound movement for quads, hamstrings, and glutes.",
        difficulty: "Beginner",
        muscleGroup: "Legs",
      },
      {
        category: "Core",
        authorId: admin.id,
        title: "Plank",
        description: "Isometric exercise for core stability and endurance.",
        difficulty: "Intermediate",
        muscleGroup: "Abs",
      },
      {
        category: "Cardio",
        authorId: admin.id,
        title: "Running",
        description: "Cardiovascular endurance activity for overall fitness.",
        difficulty: "Intermediate",
        muscleGroup: "Full Body",
      },
      {
        category: "Flexibility",
        authorId: admin.id,
        title: "Yoga Sun Salutation",
        description: "A sequence of yoga poses improving flexibility and balance.",
        difficulty: "Advanced",
        muscleGroup: "Full Body",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed data created with Admin and Exercises");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

