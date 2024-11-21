import { serve } from "@hono/node-server";
import { logger as honoLogger } from "hono/logger";
import { logger } from "./utils/logger.js";
import { env } from "./env.js";
import { trimTrailingSlash } from "hono/trailing-slash";
import { managerRouter } from "./resources/manager/manager.router.js";
import { swaggerUI } from "@hono/swagger-ui";
import { openAPI } from "./utils/open-api.js";
import { errorHandler, handleCustomErrorJSON } from "./utils/error.js";

export const app = openAPI.router();

app.use(
  honoLogger((msg, ...rest) => {
    logger.info(msg, ...rest);
  })
);

app.onError(errorHandler);
app.use(handleCustomErrorJSON);

app.use(trimTrailingSlash());

app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Manager Service",
  },
});
app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "Bearer",
});

app.get("/swagger", swaggerUI({ url: "/openapi.json" }));

app.route("/manager", managerRouter);

serve({ fetch: app.fetch, port: env.PORT, hostname: env.HOSTNAME }, () => {
  console.log(`Running at: http://${env.HOSTNAME}:${env.PORT}`);
  console.log(`Swagger UI at: http://${env.HOSTNAME}:${env.PORT}/swagger`);
});
