import { eq, and, like, or, sql } from "drizzle-orm";
import { db } from "./db";
import * as schema from "@shared/schema";
import type {
  Garment,
  Brand,
  Artisan,
  NfcCode,
  ImpactMetrics,
  CulturalContent,
  CareInstructions,
  Stamp,
  Badge,
  UserBadge,
  User,
  InsertGarment,
  InsertBrand,
  InsertArtisan,
  InsertStamp,
  GarmentWithDetails,
  UserPassport,
} from "@shared/schema";

export class DatabaseStorage {
  // Garment methods
  async getAllGarments(filters?: {
    category?: string;
    brand?: string;
    search?: string;
  }): Promise<GarmentWithDetails[]> {
    let query = db
      .select()
      .from(schema.garments)
      .$dynamic();

    const conditions = [];
    
    if (filters?.category) {
      conditions.push(eq(schema.garments.category, filters.category as any));
    }
    
    if (filters?.brand) {
      conditions.push(eq(schema.garments.brandId, filters.brand));
    }
    
    if (filters?.search) {
      conditions.push(
        or(
          like(schema.garments.name, `%${filters.search}%`),
          like(schema.garments.description, `%${filters.search}%`)
        )!
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const garments = await query;

    // Fetch related data for each garment
    const garmentDetails = await Promise.all(
      garments.map(async (garment) => {
        const [brand] = await db
          .select()
          .from(schema.brands)
          .where(eq(schema.brands.id, garment.brandId));

        const [artisan] = await db
          .select()
          .from(schema.artisans)
          .where(eq(schema.artisans.id, garment.artisanId));

        const [impactMetrics] = await db
          .select()
          .from(schema.impactMetrics)
          .where(eq(schema.impactMetrics.garmentId, garment.id));

        const culturalContent = await db
          .select()
          .from(schema.culturalContent)
          .where(eq(schema.culturalContent.garmentId, garment.id));

        const [careInstructions] = await db
          .select()
          .from(schema.careInstructions)
          .where(eq(schema.careInstructions.garmentId, garment.id));

        const [nfcCode] = await db
          .select()
          .from(schema.nfcCodes)
          .where(eq(schema.nfcCodes.garmentId, garment.id));

        return {
          ...garment,
          brand,
          artisan,
          impactMetrics,
          culturalContent,
          careInstructions,
          nfcCode: nfcCode || null,
        };
      })
    );

    return garmentDetails;
  }

  async getGarment(id: string): Promise<GarmentWithDetails | null> {
    const [garment] = await db
      .select()
      .from(schema.garments)
      .where(eq(schema.garments.id, id));

    if (!garment) return null;

    const [brand] = await db
      .select()
      .from(schema.brands)
      .where(eq(schema.brands.id, garment.brandId));

    const [artisan] = await db
      .select()
      .from(schema.artisans)
      .where(eq(schema.artisans.id, garment.artisanId));

    const [impactMetrics] = await db
      .select()
      .from(schema.impactMetrics)
      .where(eq(schema.impactMetrics.garmentId, garment.id));

    const culturalContent = await db
      .select()
      .from(schema.culturalContent)
      .where(eq(schema.culturalContent.garmentId, garment.id));

    const [careInstructions] = await db
      .select()
      .from(schema.careInstructions)
      .where(eq(schema.careInstructions.garmentId, garment.id));

    const [nfcCode] = await db
      .select()
      .from(schema.nfcCodes)
      .where(eq(schema.nfcCodes.garmentId, garment.id));

    return {
      ...garment,
      brand,
      artisan,
      impactMetrics,
      culturalContent,
      careInstructions,
      nfcCode: nfcCode || null,
    };
  }

  async createGarment(data: InsertGarment): Promise<Garment> {
    const [garment] = await db.insert(schema.garments).values(data as any).returning();
    return garment;
  }

  // Brand methods
  async getAllBrands(): Promise<Brand[]> {
    return db.select().from(schema.brands);
  }

  async getBrand(id: string): Promise<Brand | null> {
    const [brand] = await db
      .select()
      .from(schema.brands)
      .where(eq(schema.brands.id, id));
    return brand || null;
  }

  async createBrand(data: InsertBrand): Promise<Brand> {
    const [brand] = await db.insert(schema.brands).values(data as any).returning();
    return brand;
  }

  // Artisan methods
  async getAllArtisans(): Promise<Artisan[]> {
    return db.select().from(schema.artisans);
  }

  async getArtisan(id: string): Promise<Artisan | null> {
    const [artisan] = await db
      .select()
      .from(schema.artisans)
      .where(eq(schema.artisans.id, id));
    return artisan || null;
  }

  async createArtisan(data: InsertArtisan): Promise<Artisan> {
    const [artisan] = await db.insert(schema.artisans).values(data).returning();
    return artisan;
  }

  // NFC/QR Code methods
  async getGarmentByNfc(uid: string): Promise<GarmentWithDetails | null> {
    const [nfcCode] = await db
      .select()
      .from(schema.nfcCodes)
      .where(eq(schema.nfcCodes.nfcUid, uid));

    if (!nfcCode) return null;
    return this.getGarment(nfcCode.garmentId);
  }

  async getGarmentByQr(code: string): Promise<GarmentWithDetails | null> {
    const [nfcCode] = await db
      .select()
      .from(schema.nfcCodes)
      .where(eq(schema.nfcCodes.qrCode, code));

    if (!nfcCode) return null;
    return this.getGarment(nfcCode.garmentId);
  }

  async validateNfcCode(code: string): Promise<{ valid: boolean; garmentId?: string }> {
    const [nfcCode] = await db
      .select()
      .from(schema.nfcCodes)
      .where(and(
        eq(schema.nfcCodes.code, code),
        eq(schema.nfcCodes.isActive, true)
      ));

    return nfcCode
      ? { valid: true, garmentId: nfcCode.garmentId }
      : { valid: false };
  }

  // User Passport methods
  async getUserPassport(userId: string): Promise<UserPassport> {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!user) {
      throw new Error("User not found");
    }

    // Get user stamps with garment details
    const userStamps = await db
      .select()
      .from(schema.stamps)
      .where(eq(schema.stamps.userId, userId));

    const stamps = await Promise.all(
      userStamps.map(async (stamp) => {
        const garment = await this.getGarment(stamp.garmentId);
        return {
          ...stamp,
          garment: garment!,
        };
      })
    );

    // Get user badges
    const userBadges = await db
      .select()
      .from(schema.userBadges)
      .where(eq(schema.userBadges.userId, userId));

    const badges = await Promise.all(
      userBadges.map(async (userBadge) => {
        const [badge] = await db
          .select()
          .from(schema.badges)
          .where(eq(schema.badges.id, userBadge.badgeId));
        return {
          ...userBadge,
          badge,
        };
      })
    );

    // Calculate total impact
    const totalImpact = stamps.reduce(
      (acc, stamp) => {
        const metrics = stamp.garment.impactMetrics;
        if (metrics) {
          acc.waterSaved += Number(metrics.waterSaved || 0);
          acc.co2Offset += Number(metrics.co2Offset || 0);
          acc.artisansSupported += metrics.artisansSupported || 0;
        }
        return acc;
      },
      { waterSaved: 0, co2Offset: 0, artisansSupported: 0, countriesExplored: 0 }
    );

    // Count unique countries
    const countries = new Set(stamps.map((s) => s.garment.origin));
    totalImpact.countriesExplored = countries.size;

    return {
      user,
      stamps,
      badges,
      totalImpact,
    };
  }

  // Stamp methods
  async createStamp(data: InsertStamp): Promise<Stamp> {
    const [stamp] = await db.insert(schema.stamps).values(data).returning();
    return stamp;
  }

  // Badge methods
  async getAllBadges(): Promise<Badge[]> {
    return db.select().from(schema.badges);
  }

  // Analytics methods (placeholder for now)
  async trackAnalytics(data: any): Promise<void> {
    // TODO: Implement analytics tracking
    console.log("Analytics tracked:", data);
  }
}

export const dbStorage = new DatabaseStorage();
