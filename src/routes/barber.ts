import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { paginationSchema } from "../validations/paginationSchema";

export const barberSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.email(),
  phone: z.string(),
  createdAt: z.date(),
  barberShopId: z.coerce.number(),
});

export const createBarberSchema = barberSchema.pick({
  name: true,
  phone: true,
  barberShopId: true,
  email: true,
});

export const updateBarberSchema = barberSchema
  .pick({
    name: true,
    email: true,
    phone: true,
  })
  .partial();

export const barberRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/",
    {
      schema: {
        querystring: paginationSchema,
        response: {
          200: z.array(barberSchema),
        },
      },
    },
    async (request, reply) => {
      const { page, limit } = request.query;

      const barber = await prisma.barber.findMany({
        skip: (page - 1) * limit,
        take: limit,
      });

      return reply.status(200).send(barber);
    }
  );

  app.post(
    "/create",
    {
      schema: {
        body: createBarberSchema,
        response: {
          200: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { name, phone, email, barberShopId } = request.body;
      await prisma.barber.create({
        data: {
          name,
          phone,
          email,
          barberShopId,
        },
      });
      return reply.code(200).send();
    }
  );

  app.patch(
    "/:id",
    {
      schema: {
        params: z.object({
          id: z.string().regex(/^\d+$/).transform(Number),
        }),
        body: updateBarberSchema,
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { name, phone, email } = request.body;

      await prisma.barber.update({
        where: {
          id,
        },
        data: {
          name,
          phone,
          email,
        },
      });

      return reply.code(200).send();
    }
  );

  app.delete(
    "/:id",
    {
      schema: {
        params: z.object({
          id: z.string().regex(/^\d+$/).transform(Number),
        }),
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      await prisma.barber.delete({
        where: {
          id,
        },
      });

      return reply.code(200).send();
    }
  );
};
