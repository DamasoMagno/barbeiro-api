import z from "zod";
import { createBarberSchema } from "../routes/barber";
import { prisma } from "../lib/prisma";

type Barber = z.infer<typeof createBarberSchema>;

export async function createBarber({
  barberShopId,
  email,
  name,
  phone,
}: Barber) {
  const existingBarber = await prisma.barber.findUnique({
    where: {
      email,
    },
  });

  if (existingBarber) {
    throw new Error("Este email já encontra-se em uso.");
  }

  await prisma.barber.create({
    data: {
      name,
      phone,
      email,
      barberShopId,
    },
  });
}
