import { ManagerService } from "./manager.service.js";
import { z } from "@hono/zod-openapi";
import { openAPI } from "../../utils/open-api.js";
import { CustomError, errorSchema } from "../../utils/error.js";

export const managerRouter = openAPI.router();

const managerService = new ManagerService();

const managerSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  isBlocked: z.boolean(),
});

const getAllServicesOpenAPI = openAPI.route("GET", "/", {
  group: "Manager Services",
  responses: {
    200: {
      description: "services fetched successfully",
      schema: z.array(managerSchema),
    },
  },
});

managerRouter.openapi(getAllServicesOpenAPI, async (c) => {
  const services = await managerService.getAllServices();

  return c.json(services);
});

const createServiceOpenAPI = openAPI.route("POST", "/", {
  group: "Manager Services",
  body: z.object({
    name: z.string(),
  }),

  responses: {
    201: {
      description: "service created successfully",
      schema: managerSchema.and(z.object({ APIKey: z.string() })),
    },
  },
});

managerRouter.openapi(createServiceOpenAPI, async (c) => {
  const body = c.req.valid("json");
  const service = await managerService.createService(body);

  return c.json(service, { status: 201 });
});

const blockServiceOpenAPI = openAPI.route("PUT", "/{id}/block", {
  group: "Manager Services",
  params: z.object({
    id: z.string(),
  }),

  responses: {
    200: {
      description: "service blocker successfully",
      schema: managerSchema,
    },
    404: {
      description: "service not found",
      schema: errorSchema,
    },
  },
});

managerRouter.openapi(blockServiceOpenAPI, async (c) => {
  const { id } = c.req.valid("param");
  const service = await managerService.blockService(id);

  return c.json(service, 200);
});

const unblockServiceOpenAPI = openAPI.route("PUT", "/{id}/unblock", {
  group: "Manager Services",
  params: z.object({
    id: z.string(),
  }),

  responses: {
    200: {
      description: "service unblocked successfully",
      schema: managerSchema,
    },
    404: {
      description: "service not found",
      schema: errorSchema,
    },
  },
});

managerRouter.openapi(unblockServiceOpenAPI, async (c) => {
  const { id } = c.req.valid("param");
  const service = await managerService.unblockService(id);

  return c.json(service, 200);
});

const deleteServiceOpenAPI = openAPI.route("DELETE", "/{id}", {
  group: "Manager Services",
  params: z.object({
    id: z.string(),
  }),

  responses: {
    200: {
      description: "service deleted successfully",
      schema: z.object({ ok: z.boolean() }),
    },
    404: {
      description: "service not found",
      schema: errorSchema,
    },
  },
});

managerRouter.openapi(deleteServiceOpenAPI, async (c) => {
  const { id } = c.req.valid("param");
  await managerService.deleteService(id);

  return c.json({ ok: true }, 200);
});

const validateAPIKeyOpenAPI = openAPI.route("POST", "/validate", {
  group: "Manager Services",
  body: z.object({
    APIKey: z.string(),
  }),
  responses: {
    200: {
      description: "API key is valid",
      schema: managerSchema,
    },
    503: {
      description: "API key is invalid",
      schema: errorSchema,
    },
  },
});

managerRouter.openapi(validateAPIKeyOpenAPI, async (c) => {
  const { APIKey } = c.req.valid("json");
  const bearer = c.req.header("Authorization");
  const requestingAPIKey = bearer?.split(" ").pop();
  if (!requestingAPIKey) {
    throw new CustomError({
      title: "Service Unavailable",
      detail: "API key is required",
      status: 503,
    });
  }

  await managerService.validateAPIKey(requestingAPIKey);
  const service = await managerService.validateAPIKey(APIKey);

  return c.json(service, 200);
});
