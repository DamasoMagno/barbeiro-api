import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { paginationSchema } from "../validations/paginationSchema";

const hairSchema = z.object({
  name: z.string().min(1, "name is required"),
  price: z.coerce.number().min(1, "phone is required"),
  photoUrl: z.url().optional(),
  barberShopId: z.coerce.number().min(1, "barberShopId is required"),
});

const createHairSchema = hairSchema.pick({
  name: true,
  price: true,
  photoUrl: true,
  barberShopId: true,
});

const updateHairSchema = hairSchema
  .pick({
    name: true,
    photoUrl: true,
    price: true,
    barberShopId: true,
  })
  .partial();

export const hairRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/",
    {
      schema: {
        querystring: paginationSchema,
        response: {
          200: z.array(hairSchema),
        },
      },
    },
    async (request, reply) => {
      const { page, limit } = request.query;

      const hairs = await prisma.hair.findMany({
        skip: (page - 1) * limit,
        take: limit,
      });

      return reply.status(200).send(hairs);
    }
  );

  app.post(
    "/create",
    {
      schema: {
        body: createHairSchema,
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { name, price, photoUrl, barberShopId } = request.body;

      await prisma.hair.create({
        data: {
          name,
          price,
          photoUrl: photoUrl || "",
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
        body: updateHairSchema,
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { name, price, photoUrl, barberShopId } = request.body;

      await prisma.hair.update({
        where: {
          id: Number(id),
        },
        data: {
          name,
          price,
          photoUrl,
          barberShopId,
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

      await prisma.hair.delete({
        where: {
          id: Number(id),
        },
      });

      return reply.code(200).send();
    }
  );
};
