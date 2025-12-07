import fastify from "fastify";
import { prisma } from "./lib/prisma";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import scalar from "@scalar/fastify-api-reference";
import {
  serializerCompiler,
  jsonSchemaTransform,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "./env";
import { barberShopRoutes } from "./routes/barbershop";
import { hairRoutes } from "./routes/hair";
import { barberRoutes } from "./routes/barber";
import { avaliationsRoutes } from "./routes/avaliations";

export const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(cors, {
  origin: "*",
});

app.register(jwt, {
  secret: env.JWT_SECRET,
});

app.register(swagger, {
  openapi: {
    info: {
      title: "API Barbearia",
      version: "1.0.0",
    },
  },
  transform: jsonSchemaTransform,
});

app.register(scalar, {
  routePrefix: "/docs",
});

app.register(barberShopRoutes, {
  prefix: "/barbershop",
});

app.register(hairRoutes, {
  prefix: "/hair",
});

app.register(barberRoutes, {
  prefix: "/barber",
});

app.register(barberRoutes, {
  prefix: "/barber",
});

app.register(avaliationsRoutes, {
  prefix: "/avaliations",
});

app.get("/", async (request, reply) => {
  const response = await prisma.barberShop.findMany();
  console.log(response);

  return { hello: "world" };
});
