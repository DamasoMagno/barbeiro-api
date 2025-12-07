import { app } from "./server";
import { env } from "./env";

app.listen({ port: env.PORT, host: env.HOST }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
