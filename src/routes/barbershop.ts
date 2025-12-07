import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { paginationSchema } from "../validations/paginationSchema";

const barberShopCreateSchema = z.object({
  name: z.string().min(1, "name is required"),
  email: z.string().email("invalid email"),
  slug: z.string().min(1, "slug is required"),
  address: z.string().min(1, "address is required"),
  phone: z.string().min(1, "phone is required"),
});

const createBarberSchema = barberShopCreateSchema.pick({
  name: true,
  phone: true,
  slug: true,
  address: true,
  email: true,
});

const authBarberSchema = barberShopCreateSchema.pick({
  email: true,
  phone: true,
});

const updateBarberSchema = barberShopCreateSchema
  .pick({
    name: true,
    email: true,
  })
  .partial();

export const barberShopRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/",
    {
      schema: {
        querystring: paginationSchema,
        response: {
          200: z.array(barberShopCreateSchema),
        },
      },
    },
    async (request, reply) => {
      const { page, limit } = request.query;

      const barbers = await prisma.barberShop.findMany({
        skip: (page - 1) * limit,
        take: limit,
      });

      return reply.status(200).send(barbers);
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
      const { name, email, phone, slug, address } = request.body;

      await prisma.barberShop.create({
        data: {
          name,
          phone,
          email,
          slug,
          address,
        },
      });

      return reply.code(200).send();
    }
  );

  app.post(
    "/auth",
    {
      schema: {
        body: authBarberSchema,
        response: {
          200: z.object({
            message: z.string(),
          }),
          401: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { email, phone } = request.body;

      const barberShop = await prisma.barberShop.findFirst({
        where: {
          email,
          phone,
        },
      });

      if (!barberShop) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

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
      const { name, email } = request.body;

      await prisma.barberShop.update({
        where: {
          id,
        },
        data: {
          name,
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
