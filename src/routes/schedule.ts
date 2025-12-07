import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { paginationSchema } from "../validations/paginationSchema";
import { ScheduleModel } from "../generated/prisma/enums";

const scheduleSchema = z
  .object({
    model: z.enum([
      ScheduleModel.WEEK,
      ScheduleModel.CUSTOM,
      ScheduleModel.UNAVAILABLE,
    ]),
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
      data.model === ScheduleModel.WEEK ||
      (data.model === ScheduleModel.CUSTOM && data.periods.length === 0)
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
        querystring: paginationSchema.extend({
          model: z
            .enum([
              ScheduleModel.WEEK,
              ScheduleModel.CUSTOM,
              ScheduleModel.UNAVAILABLE,
            ])
            .optional(),
          barberShopId: z.number().optional(),
        }),
      },
    },
    async (request, reply) => {
      const { page, limit, model, barberShopId } = request.query;

      const schedules = await prisma.schedule.findMany({
        where: {
          ...(model && { model }),
          ...(barberShopId && { barberShopId }),
        },
        include: {
          barberShop: true,
          custom: {
            select: {
              date: true,
              periods: true,
            },
          },
          week: {
            select: {
              dayOfWeek: true,
              periods: true,
            },
          },
          scheduleNotAvailables: {
            select: {
              date: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      const formatted = schedules.map((schedule) => {
        const base = {
          id: schedule.id,
          barberShopId: schedule.barberShopId,
          model: schedule.model,
          createdAt: schedule.createdAt,
          updatedAt: schedule.updatedAt,
        };

        switch (schedule.model) {
          case ScheduleModel.WEEK:
            return {
              ...base,
              weekSchedule: schedule.week.map((w) => ({
                dayOfWeek: w.dayOfWeek,
                periods: w.periods,
              })),
            };

          case ScheduleModel.CUSTOM:
            return {
              ...base,
              customSchedule: schedule.custom.map((c) => ({
                date: c.date,
                periods: c.periods,
              })),
            };

          case ScheduleModel.UNAVAILABLE:
            return {
              ...base,
              unavailableDates: schedule.scheduleNotAvailables.map(
                (n) => n.date
              ),
            };
        }
      });

      return reply.status(200).send(formatted);
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
      const { barberShopId, model, periods } = request.body;

      const schedule = await prisma.schedule.create({
        data: {
          barberShopId,
          model,
        },
      });

      await prisma.schedulePeriod.createMany({
        data: periods.map((period) => ({
          scheduleId: schedule.id,
          startTime: new Date(`1970-01-01T${period.startTime}:00Z`),
          endTime: new Date(`1970-01-01T${period.endTime}:00Z`),
          duration: period.duration,
        })),
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
      const { periods, model } = request.body;

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
