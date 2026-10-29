import { PrismaClient, PetSpecies, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (process.env.SEED_DEMO_DATA !== "true") {
    console.info(
      "Seed skipped. Set SEED_DEMO_DATA=true only in a local development database to create example accounts.",
    );
    return;
  }
  const passwordHash = await hash(
    process.env.DEMO_PASSWORD ?? "PetCareDemo!2026",
    12,
  );
  const demoUsers = [
    { name: "Demo Owner", email: "owner@petcare.demo", role: UserRole.OWNER },
    {
      name: "Demo Sitter",
      email: "sitter@petcare.demo",
      role: UserRole.SITTER,
    },
    { name: "Demo Admin", email: "admin@petcare.demo", role: UserRole.ADMIN },
  ];
  for (const item of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: item.email },
      update: { name: item.name, role: item.role },
      create: { ...item, passwordHash },
    });
    if (item.role === UserRole.SITTER) {
      await prisma.sitterProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          headline: "Calm, caring home boarding",
          about:
            "A demo sitter profile for testing the PetCare booking flow. I follow each pet's routine and keep owners informed.",
          city: "New Delhi",
          locality: "Vasant Kunj",
          dailyRate: 1200,
          yearsExperience: 4,
          maxPets: 2,
          acceptedSpecies: [PetSpecies.DOG, PetSpecies.CAT],
          acceptedSizes: ["small", "medium"],
          amenities: ["Daily updates", "Indoor play"],
          houseRules: ["Vaccination details required"],
          outdoorSpace: true,
        },
      });
    }
  }
  const owner = await prisma.user.findUniqueOrThrow({
    where: { email: "owner@petcare.demo" },
  });
  const pet = await prisma.pet.findFirst({
    where: { ownerId: owner.id, name: "Milo" },
  });
  if (!pet)
    await prisma.pet.create({
      data: {
        ownerId: owner.id,
        name: "Milo",
        species: PetSpecies.DOG,
        breed: "Indie",
        ageYears: 3,
        temperament: "Friendly",
        feedingInstructions: "Twice daily",
      },
    });
  console.info(
    "Seed complete. Demo accounts: owner@petcare.demo, sitter@petcare.demo, admin@petcare.demo",
  );
  console.info(
    "Shared demo password: set DEMO_PASSWORD before seeding, or use PetCareDemo!2026",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
