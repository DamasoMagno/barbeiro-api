import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { paginationSchema } from "../validations/paginationSchema";

const scheduleSchema = z
  .object({
    model: z.enum(["week", "custom", "unavailable"]),
    periods: z.array(
      z.object({
        startTime: z.string(),
        endTime: z.string(),
        duration: z.number(),
      })
    ),
    barberShopId: z.number(),
  })
  .superRefine((data, ctx) => {
    if (
      data.model === "week" ||
      (data.model === "custom" && data.periods.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Week model must have at least one period",
      });
    }
  });

const createScheduleSchema = scheduleSchema.pick({
  model: true,
  periods: true,
  barberShopId: true,
});

const updateScheduleSchema = scheduleSchema
  .pick({
    model: true,
    periods: true,
    barberShopId: true,
  })
  .partial();

export const scheduleRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/",
    {
      schema: {
        querystring: paginationSchema,
        response: {
          200: z.array(scheduleSchema),
        },
      },
    },
    async (request, reply) => {
      const { page, limit } = request.query;

      const schedules = await prisma.schedule.findMany({
        skip: (page - 1) * limit,
        take: limit,
      });

      return reply.status(200).send(schedules);
    }
  );

  app.post(
    "/create",
    {
      schema: {
        body: createScheduleSchema,
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
        body: updateScheduleSchema,
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

      await prisma.schedule.delete({
        where: {
          id: Number(id),
        },
      });

      return reply.code(200).send();
    }
  );
};
