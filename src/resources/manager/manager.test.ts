import { describe, expect, test } from "vitest";
import { app } from "../../index.js";

describe("POST /manager", () => {
  test("Correctly create a service", async () => {
    const res = await app.request("/manager", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "service" }),
    });
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({
      id: expect.any(String),
      name: "service",
      createdAt: expect.any(String),
      isBlocked: false,
      APIKey: expect.any(String),
    });
  });
});

describe("GET /manager", () => {
  test("Get service", async () => {
    const res = await app.request("/manager", {});
    expect(res.status).toBe(200);
  });
});

describe("PUT /manager/:id/block", () => {
  test("Block service", async () => {
    const service = await app.request("/manager", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "service" }),
    });
    const serviceId = (await service.json()).id;
    const res = await app.request(`/manager/${serviceId}/block`, {
      method: "PUT",
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      APIKey: expect.any(String),
      createdAt: expect.any(String),
      id: serviceId,
      isBlocked: true,
      name: "service",
    });
  });

  test("Block service that does not exist", async () => {
    const res = await app.request(`/manager/123/block`, {
      method: "PUT",
    });
    expect(res.status).toBe(404);
  });
});

describe("PUT /manager/:id/unblock", () => {
  test("Unblock service", async () => {
    const service = await app.request("/manager", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "service" }),
    });
    const serviceId = (await service.json()).id;
    await app.request(`/manager/${serviceId}/block`, {
      method: "PUT",
    });
    const res = await app.request(`/manager/${serviceId}/unblock`, {
      method: "PUT",
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      APIKey: expect.any(String),
      createdAt: expect.any(String),
      id: serviceId,
      isBlocked: false,
      name: "service",
    });
  });
});

describe("DELETE /manager/:id", () => {
  test("Delete service", async () => {
    const service = await app.request("/manager", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "service" }),
    });
    const serviceId = (await service.json()).id;
    const res = await app.request(`/manager/${serviceId}`, {
      method: "DELETE",
    });
    expect(res.status).toBe(200);
  });

  test("Delete service that does not exist", async () => {
    const res = await app.request(`/manager/123`, {
      method: "DELETE",
    });
    expect(res.status).toBe(404);
  });
});
