import { StatusCode } from "hono/utils/http-status";
import { CustomError } from "../../utils/error.js";
import { logger } from "../../utils/logger.js";
import { db } from "../../utils/db.js";
import { randomUUID } from "crypto";

export class ManagerService {
  async getAllServices() {
    return await db.service.findMany({
      select: { id: true, name: true, createdAt: true, isBlocked: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async createService(body: { name: string }) {
    const service = await db.service.create({
      data: {
        name: body.name,
        APIKey: randomUUID(),
      },
    });

    return service;
  }

  async blockService(id: string) {
    const service = await db.service.findUnique({ where: { id } });

    if (!service) {
      throw new CustomError({
        status: 404,
        title: "Service not found",
        detail: "Service not found",
      });
    }

    const updatedService = await db.service.update({
      where: { id },
      data: { isBlocked: true },
    });

    return updatedService;
  }

  async unblockService(id: string) {
    const service = await db.service.findUnique({ where: { id } });

    if (!service) {
      throw new CustomError({
        status: 404,
        title: "Service not found",
        detail: "Service not found",
      });
    }

    const updatedService = await db.service.update({
      where: { id },
      data: { isBlocked: false },
    });

    return updatedService;
  }

  async deleteService(id: string) {
    const service = await db.service.findUnique({ where: { id } });

    if (!service) {
      throw new CustomError({
        status: 404,
        title: "Service not found",
        detail: "Service not found",
      });
    }

    await db.service.delete({ where: { id } });
  }

  async validateAPIKey(APIKey: string) {
    const [service] = await db.service.findMany({
      where: { APIKey, isBlocked: false },
    });

    if (!service) {
      throw new CustomError({
        status: 503,
        title: "Service not available",
        detail: "Service not available",
      });
    }
    return service;
  }
}
