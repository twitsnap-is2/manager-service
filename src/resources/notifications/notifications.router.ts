import { NotificationsService } from "./notifications.service.js";
import { z } from "@hono/zod-openapi";
import { openAPI } from "../../utils/open-api.js";

export const notificationsRouter = openAPI.router();

const notificationsService = new NotificationsService();

const notificationsSchema = z.object({
  id: z.number(),
  type: z.string(),
  user_id: z.string(),
  title: z.string(),
  content: z.string().nullable().optional(),
  link: z.string().nullable().optional(),
  created_at: z.string().datetime(),
});

const getByUserIdOpenAPI = openAPI.route("GET", "/{user_id}", {
  group: "User notifications",
  params: z.object({
    user_id: z.string(),
  }),
  responses: {
    200: {
      description: "Notifications fetched successfully",
      schema: z.array(notificationsSchema),
    },
  },
});

notificationsRouter.openapi(getByUserIdOpenAPI, async (c) => {
  const { user_id } = c.req.valid("param");

  const notifications = await notificationsService.getByUserId(user_id);

  return c.json(notifications);
});

const sendMentionOpenAPI = openAPI.route("POST", "/mention", {
  group: "Send",
  body: z.object({
    userId: z.string(),
    username: z.string(),
    snapContent: z.string(),
    snapUrl: z.string(),
  }),
  responses: {
    200: {
      description: "Notification sent successfully",
      schema: z.object({
        id: z.number(),
      }),
    },
  },
});

notificationsRouter.openapi(sendMentionOpenAPI, async (c) => {
  const body = c.req.valid("json");

  const notificationId = await notificationsService.send({
    title: `@${body.username} mentioned you`,
    content: body.snapContent,
    link: body.snapUrl,
    type: "mention",
    userId: body.userId,
  });

  return c.json({ id: notificationId });
});

const sendDMOpenAPI = openAPI.route("POST", "/dm", {
  group: "Send",
  body: z.object({
    userId: z.string(),
    username: z.string(),
    message: z.string(),
    chatUrl: z.string(),
  }),
  responses: {
    200: {
      description: "Notification sent successfully",
      schema: z.object({
        id: z.number(),
      }),
    },
  },
});

notificationsRouter.openapi(sendDMOpenAPI, async (c) => {
  const body = c.req.valid("json");

  const notificationId = await notificationsService.send({
    title: `@${body.username} sent you a message`,
    content: body.message,
    link: body.chatUrl,
    type: "dm",
    userId: body.userId,
  });

  return c.json({ id: notificationId });
});

const sendFollowOpenAPI = openAPI.route("POST", "/follow", {
  group: "Send",
  body: z.object({
    userId: z.string(),
    username: z.string(),
  }),
  responses: {
    200: {
      description: "Notification sent successfully",
      schema: z.object({
        id: z.number(),
      }),
    },
  },
});

notificationsRouter.openapi(sendFollowOpenAPI, async (c) => {
  const body = c.req.valid("json");

  const notificationId = await notificationsService.send({
    title: `@${body.username} followed you`,
    type: "follow",
    userId: body.userId,
  });

  return c.json({ id: notificationId });
});

const uploadUserTokenOpenAPI = openAPI.route("POST", "/token", {
  group: "User notifications",
  body: z.object({
    userId: z.string(),
    token: z.string(),
  }),
  responses: {
    200: {
      description: "User token uploaded successfully",
      schema: z.object({
        success: z.boolean(),
      }),
    },
  },
});

notificationsRouter.openapi(uploadUserTokenOpenAPI, async (c) => {
  const body = c.req.valid("json");
  await notificationsService.uploadUserToken(body.userId, body.token);

  return c.json({ success: true });
});

const deleteUserTokenOpenAPI = openAPI.route("DELETE", "/token", {
  group: "User notifications",
  body: z.object({
    userId: z.string(),
    token: z.string(),
  }),
  responses: {
    200: {
      description: "User token deleted successfully",
      schema: z.object({
        success: z.boolean(),
      }),
    },
  },
});

notificationsRouter.openapi(deleteUserTokenOpenAPI, async (c) => {
  const body = c.req.valid("json");
  await notificationsService.deleteUserToken(body.userId, body.token);

  return c.json({ success: true });
});
