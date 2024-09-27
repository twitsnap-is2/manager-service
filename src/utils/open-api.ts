import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { CustomError, errorSchema } from "./error.js";

function router() {
  return new OpenAPIHono({
    defaultHook: (result, c) => {
      if (!result.success) {
        const errors = {} as Record<string, string>;
        result.error.errors.forEach((e) => {
          if (errors[e.path.join(".")]) return;
          errors[e.path.join(".")] = e.message;
        });

        const error = new CustomError({
          title: "Invalid request " + c.req.method + " " + c.req.path,
          status: 400,
          detail: result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(",\n"),
          errors,
        });

        return c.json(error.toJSON(c), 400);
      }
    },
  });
}

/***
 * @Create An OpenAPI Route
 
 * @example 
 * const echoOpenAPI = openAPI.route("POST", "/{id}", {
 *  // group for swagger 
 *  group: "Echo", 
 *  // validate {id} in url
 *  params: z.object({ id: z.string() }), 
 *  // validate query params as number (e.g. /echo?page=1)
 *  query: z.object({ page: z.coerce.number() }), 
 *  // body json as application/json
 *  body: z.object({
 *    message: z.string(),
 *  }), 
 *  responses: {
 *    200: {
 *      // description for swagger
 *      description: "Respond a message",
 *      // response json as application/json
 *      schema: z.object({
 *        message: z.string(),
 *      }), 
 *    },
 *  },
 * });
 */
function route<
  TParams extends z.AnyZodObject | undefined,
  TQuery extends z.AnyZodObject | undefined,
  TBody extends z.ZodTypeAny | undefined,
  TResponses extends Record<number, { description: string; schema: z.ZodTypeAny }>
>(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  path: string,
  props: {
    group?: string;
    params?: TParams;
    query?: TQuery;
    body?: TBody;
    responses: TResponses;
  }
) {
  type ResponseComplete = {
    [K in keyof TResponses]: {
      description: string;
      content: {
        "application/json": {
          schema: TResponses[K] extends { schema: z.ZodTypeAny } ? TResponses[K]["schema"] : never;
        };
      };
    };
  };
  const responses = {} as ResponseComplete;

  Object.entries(props.responses).forEach(([key, value]) => {
    responses[key as never] = {
      description: value.description,
      content: { "application/json": { schema: value.schema as never } },
    };
  });

  return createRoute({
    path: path,
    tags: props.group ? [props.group] : undefined,
    method: method.toLowerCase() as never,
    security: [{ Bearer: [] }],
    request: {
      params: props?.params as TParams extends z.AnyZodObject ? TParams : undefined,
      query: props.query as TQuery extends z.AnyZodObject ? TQuery : undefined,
      body: (props.body
        ? {
            description: "Description",
            required: true,
            content: {
              "application/json": { schema: props.body },
            },
          }
        : undefined) as TBody extends z.ZodTypeAny
        ? { description: string; required: true; content: { "application/json": { schema: TBody } } }
        : undefined,
    },
    responses: {
      ...responses,
      500: {
        description: "Internal Server Error",
        required: true,
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
      },
    } as ResponseComplete,
  });
}

export const openAPI = {
  router,
  route,
};
