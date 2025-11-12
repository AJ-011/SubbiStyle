import type { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../supabase";
import { db } from "../db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  role: "shopper" | "brand";
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthenticatedUser;
  }
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring("Bearer ".length);
  }

  const tokenFromCookie = req.cookies?.sb_access_token;
  if (typeof tokenFromCookie === "string" && tokenFromCookie.length > 0) {
    return tokenFromCookie;
  }

  return null;
}

export async function authenticateRequest(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const token = extractToken(req);
  if (!token) {
    return next();
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    return next();
  }

  const userId = data.user.id;

  let [profile] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId));

  const metadataRole =
    (data.user.user_metadata?.role as "shopper" | "brand" | undefined) ??
    "shopper";

  if (!profile) {
    const nameFromMetadata =
      typeof data.user.user_metadata?.name === "string"
        ? (data.user.user_metadata?.name as string)
        : null;

    const fallbackName = data.user.email
      ? data.user.email.split("@")[0]
      : "Subbi User";

    const [inserted] = await db
      .insert(schema.users)
      .values({
        id: userId,
        email: data.user.email ?? null,
        name: nameFromMetadata ?? fallbackName,
        role: metadataRole,
      })
      .returning();

    profile = inserted;
  }

  req.user = {
    id: userId,
    email: data.user.email ?? null,
    role: (profile?.role as "shopper" | "brand" | undefined) ?? metadataRole,
  };

  return next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  return next();
}

export function requireRole(role: "shopper" | "brand") {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    return next();
  };
}
