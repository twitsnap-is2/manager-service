import { NotificationsService } from "./notifications.service.js";
import { z } from "@hono/zod-openapi";
import { openAPI } from "../../utils/open-api.js";

export const notificationsRouter = openAPI.router();

const notificationsService = new NotificationsService();
