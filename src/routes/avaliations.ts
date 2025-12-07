import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { paginationSchema } from "../validations/paginationSchema";

export const avaliationsSchema = z.object({
  id: z.number().int(),
  rating: z.number().positive(),
  comment: z.string().nullable(),
  barberShopId: z.coerce.number(),
});

export const createAvaliationsSchema = avaliationsSchema.pick({
  rating: true,
  comment: true,
  barberShopId: true,
});

export const updateAvaliationsSchema = avaliationsSchema
  .pick({
    rating: true,
    comment: true,
    barberShopId: true,
  })
  .partial();

export const avaliationsRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/",
    {
      schema: {
        querystring: paginationSchema,
        response: {
          200: z.array(avaliationsSchema),
        },
      },
    },
    async (request, reply) => {
      const { page, limit } = request.query;

      const avaliations = await prisma.avaliations.findMany({
        skip: (page - 1) * limit,
        take: limit,
      });

      return reply.status(200).send(avaliations);
    }
  );

  app.post(
    "/create",
    {
      schema: {
        body: createAvaliationsSchema,
        response: {
          200: z.object({
            message: z.string(),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { rating, comment, barberShopId } = request.body;
      const barberShopExists = await prisma.barberShop.findUnique({
        where: {
          id: barberShopId,
        },
      });

      if (!barberShopExists) {
        return reply.status(404).send({ message: "Barber shop not found." });
      }

      await prisma.avaliations.create({
        data: {
          rating,
          comment,
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
        body: updateAvaliationsSchema,
        response: {
          200: z.void(),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { rating, comment } = request.body;

      const avaliationsExists = await prisma.avaliations.findUnique({
        where: {
          id,
        },
      });

      if (!avaliationsExists) {
        return reply.status(404).send({ message: "Barber shop not found." });
      }

      await prisma.avaliations.update({
        where: {
          id,
        },
        data: {
          rating,
          comment,
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
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const avaliationsExists = await prisma.avaliations.findUnique({
        where: {
          id,
        },
      });

      if (!avaliationsExists) {
        return reply.status(404).send({ message: "Avaliations not found." });
      }

      await prisma.avaliations.delete({
        where: {
          id,
        },
      });

      return reply.code(200).send();
    }
  );
};
