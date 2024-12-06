import { afterAll, beforeAll } from "vitest";
import { execSync } from "child_process";
import { db } from "../utils/db.js";

execSync("npx prisma migrate reset --force");
