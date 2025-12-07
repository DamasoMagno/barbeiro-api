import { prisma } from "./lib/prisma";

async function seed() {
  const barberShop = await prisma.barberShop.create({
    data: {
      name: "Barbearia do Damaso",
      email: "damaso@example.com",
      address: "123 Main St, Cityville",
      phone: "+55 11 91234-5678",
      slug: "barbearia-do-damaso",
    },
  });

  const barbers = await prisma.barber.createMany({
    data: [
      {
        name: "Damaso Magno",
        email: "damaso@example.com",
        barberShopId: barberShop.id,
        phone: "+55 11 99876-5432",
      },
      {
        name: "João Silva",
        email: "joao.silva@example.com",
        barberShopId: barberShop.id,
        phone: "+55 11 98765-4321",
      },
    ],
  });

  console.log({ barberShop, barbers });
}

seed()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
