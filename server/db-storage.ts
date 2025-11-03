import { eq, and, like, or, sql } from "drizzle-orm";
import { db } from "./db";
import * as schema from "@shared/schema";

console.log("[startup][db-storage] Module loaded");
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
  PassportUnlock,
  Analytics,
  InsertGarment,
  InsertBrand,
  InsertArtisan,
  InsertStamp,
  InsertAnalytics,
  InsertUser,
  InsertNfcCode,
  InsertImpactMetrics,
  InsertCulturalContent,
  InsertCareInstructions,
  InsertBadge,
  InsertPassportUnlock,
  GarmentWithDetails,
  UserPassport,
} from "@shared/schema";

export class DatabaseStorage {
  constructor() {
    console.log("[startup][db-storage] DatabaseStorage instantiated");
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));
    return user;
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(schema.users).values(data as any).returning();
    return user;
  }

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

  async getGarment(id: string): Promise<GarmentWithDetails | undefined> {
    const [garment] = await db
      .select()
      .from(schema.garments)
      .where(eq(schema.garments.id, id));

    if (!garment) return undefined;

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

  async getBrand(id: string): Promise<Brand | undefined> {
    const [brand] = await db
      .select()
      .from(schema.brands)
      .where(eq(schema.brands.id, id));
    return brand ?? undefined;
  }

  async createBrand(data: InsertBrand): Promise<Brand> {
    const [brand] = await db.insert(schema.brands).values(data as any).returning();
    return brand;
  }

  // Artisan methods
  async getAllArtisans(): Promise<Artisan[]> {
    return db.select().from(schema.artisans);
  }

  async getArtisan(id: string): Promise<Artisan | undefined> {
    const [artisan] = await db
      .select()
      .from(schema.artisans)
      .where(eq(schema.artisans.id, id));
    return artisan ?? undefined;
  }

  async createArtisan(data: InsertArtisan): Promise<Artisan> {
    const [artisan] = await db.insert(schema.artisans).values(data).returning();
    return artisan;
  }

  // NFC/QR Code methods
  async getGarmentByNfc(uid: string): Promise<GarmentWithDetails | undefined> {
    const [nfcCode] = await db
      .select()
      .from(schema.nfcCodes)
      .where(eq(schema.nfcCodes.nfcUid, uid));

    if (!nfcCode) return undefined;
    return this.getGarment(nfcCode.garmentId);
  }

  async getGarmentByQr(code: string): Promise<GarmentWithDetails | undefined> {
    const [nfcCode] = await db
      .select()
      .from(schema.nfcCodes)
      .where(eq(schema.nfcCodes.qrCode, code));

    if (!nfcCode) return undefined;
    return this.getGarment(nfcCode.garmentId);
  }

  async createNfcCode(data: InsertNfcCode): Promise<NfcCode> {
    const [record] = await db.insert(schema.nfcCodes).values(data as any).returning();
    return record;
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

  // Impact & auxiliary data
  async createImpactMetrics(data: InsertImpactMetrics): Promise<ImpactMetrics> {
    const [record] = await db
      .insert(schema.impactMetrics)
      .values(data as any)
      .returning();
    return record;
  }

  async createCulturalContent(
    data: InsertCulturalContent,
  ): Promise<CulturalContent> {
    const [record] = await db
      .insert(schema.culturalContent)
      .values(data as any)
      .returning();
    return record;
  }

  async getCulturalContentByGarment(
    garmentId: string,
  ): Promise<CulturalContent[]> {
    return db
      .select()
      .from(schema.culturalContent)
      .where(eq(schema.culturalContent.garmentId, garmentId));
  }

  async createCareInstructions(
    data: InsertCareInstructions,
  ): Promise<CareInstructions> {
    const [record] = await db
      .insert(schema.careInstructions)
      .values(data as any)
      .returning();
    return record;
  }

  // User Passport methods
  async getUserStamps(
    userId: string,
  ): Promise<Array<Stamp & { garment: GarmentWithDetails }>> {
    const userStamps = await db
      .select()
      .from(schema.stamps)
      .where(eq(schema.stamps.userId, userId));

    const enriched = await Promise.all(
      userStamps.map(async (stamp) => {
        const garment = await this.getGarment(stamp.garmentId);
        if (!garment) {
          return null;
        }
        return {
          ...stamp,
          garment,
        };
      }),
    );

    return enriched.filter(
      (entry): entry is Stamp & { garment: GarmentWithDetails } =>
        entry !== null,
    );
  }

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

  async createBadge(data: InsertBadge): Promise<Badge> {
    const [badge] = await db
      .insert(schema.badges)
      .values(data as any)
      .returning();
    return badge;
  }

  async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    const [userBadge] = await db
      .insert(schema.userBadges)
      .values({ userId, badgeId } as any)
      .returning();
    return userBadge;
  }

  async getUserBadges(
    userId: string,
  ): Promise<Array<UserBadge & { badge: Badge }>> {
    const entries = await db
      .select()
      .from(schema.userBadges)
      .where(eq(schema.userBadges.userId, userId));

    const enriched = await Promise.all(
      entries.map(async (entry) => {
        const [badge] = await db
          .select()
          .from(schema.badges)
          .where(eq(schema.badges.id, entry.badgeId));
        return {
          ...entry,
          badge,
        };
      }),
    );

    return enriched.filter(
      (entry): entry is UserBadge & { badge: Badge } => Boolean(entry.badge),
    );
  }

  // Analytics methods
  async trackAnalytics(data: InsertAnalytics): Promise<Analytics> {
    const [analytics] = await db
      .insert(schema.analytics)
      .values({
        ...data,
        userId: data.userId ?? null,
        garmentId: data.garmentId ?? null,
        metadata: data.metadata ?? null,
      })
      .returning();

    return analytics;
  }

  async getGarmentAnalytics(garmentId: string): Promise<Analytics[]> {
    return db
      .select()
      .from(schema.analytics)
      .where(eq(schema.analytics.garmentId, garmentId));
  }

  async createPassportUnlock(
    data: InsertPassportUnlock,
  ): Promise<PassportUnlock> {
    const [unlock] = await db
      .insert(schema.passportUnlocks)
      .values(data as any)
      .returning();
    return unlock;
  }
}

export const dbStorage = new DatabaseStorage();
console.log("[startup][db-storage] Ready");

