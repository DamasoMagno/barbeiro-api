import { prisma } from "../lib/prisma";

interface Barber {
  id: string;
}

export async function deleteBarber({ id }: Barber) {
  const existingBarber = await prisma.barber.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!existingBarber) {
    throw new Error("Barbeiro não encontrado");
  }

  await prisma.barber.delete({
    where: {
      id: Number(id),
    },
  });
}
