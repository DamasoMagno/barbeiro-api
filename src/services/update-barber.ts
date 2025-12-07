import z from "zod";
import { updateBarberSchema } from "../routes/barber";
import { prisma } from "../lib/prisma";

type UpdateBarber = z.infer<typeof updateBarberSchema>;

export async function updateBarber({ email, name, phone }: UpdateBarber) {
  const existingBarber = await prisma.barber.findUnique({
    where: {
      email,
    },
  });

  if (!existingBarber) {
    throw new Error("Barbeiro não encontrado");
  }

  await prisma.barber.update({
    where: {
      email,
    },
    data: {
      name,
      phone,
      email,
    },
  });
}
