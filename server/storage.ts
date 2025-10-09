import { 
  users, brands, artisans, garments, nfcCodes, impactMetrics, 
  culturalContent, careInstructions, stamps, badges, userBadges, 
  passportUnlocks, analytics,
  type User, type Brand, type Artisan, type Garment, type GarmentWithDetails,
  type NfcCode, type ImpactMetrics, type CulturalContent, type CareInstructions,
  type Stamp, type Badge, type UserBadge, type PassportUnlock, type Analytics,
  type UserPassport, type InsertUser, type InsertBrand, type InsertArtisan,
  type InsertGarment, type InsertNfcCode, type InsertImpactMetrics,
  type InsertCulturalContent, type InsertCareInstructions, type InsertStamp,
  type InsertBadge, type InsertPassportUnlock, type InsertAnalytics
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserPassport(userId: string): Promise<UserPassport>;

  // Brand operations
  getBrand(id: string): Promise<Brand | undefined>;
  createBrand(brand: InsertBrand): Promise<Brand>;
  getAllBrands(): Promise<Brand[]>;

  // Artisan operations
  getArtisan(id: string): Promise<Artisan | undefined>;
  createArtisan(artisan: InsertArtisan): Promise<Artisan>;

  // Garment operations
  getGarment(id: string): Promise<GarmentWithDetails | undefined>;
  createGarment(garment: InsertGarment): Promise<Garment>;
  getAllGarments(filters?: { category?: string; brand?: string; search?: string }): Promise<GarmentWithDetails[]>;
  getGarmentByNfc(nfcUid: string): Promise<GarmentWithDetails | undefined>;
  getGarmentByQr(qrCode: string): Promise<GarmentWithDetails | undefined>;

  // NFC/QR operations
  createNfcCode(nfcCode: InsertNfcCode): Promise<NfcCode>;
  
  // Impact operations
  createImpactMetrics(metrics: InsertImpactMetrics): Promise<ImpactMetrics>;
  
  // Cultural content operations
  createCulturalContent(content: InsertCulturalContent): Promise<CulturalContent>;
  getCulturalContentByGarment(garmentId: string): Promise<CulturalContent[]>;
  
  // Care instructions operations
  createCareInstructions(instructions: InsertCareInstructions): Promise<CareInstructions>;
  
  // Stamp operations
  createStamp(stamp: InsertStamp): Promise<Stamp>;
  getUserStamps(userId: string): Promise<Array<Stamp & { garment: GarmentWithDetails }>>;
  
  // Badge operations
  getAllBadges(): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  awardBadge(userId: string, badgeId: string): Promise<UserBadge>;
  getUserBadges(userId: string): Promise<Array<UserBadge & { badge: Badge }>>;
  
  // Passport unlock operations
  createPassportUnlock(unlock: InsertPassportUnlock): Promise<PassportUnlock>;
  
  // Analytics operations
  trackAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getGarmentAnalytics(garmentId: string): Promise<Analytics[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private brands: Map<string, Brand> = new Map();
  private artisans: Map<string, Artisan> = new Map();
  private garments: Map<string, Garment> = new Map();
  private nfcCodes: Map<string, NfcCode> = new Map();
  private impactMetrics: Map<string, ImpactMetrics> = new Map();
  private culturalContent: Map<string, CulturalContent[]> = new Map();
  private careInstructions: Map<string, CareInstructions> = new Map();
  private stamps: Map<string, Stamp[]> = new Map();
  private badges: Map<string, Badge> = new Map();
  private userBadges: Map<string, UserBadge[]> = new Map();
  private passportUnlocks: Map<string, PassportUnlock[]> = new Map();
  private analytics: Map<string, Analytics[]> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed sample data for demo
    const sampleBrand: Brand = {
      id: "brand-1",
      name: "Ethical Threads Co.",
      description: "Connecting traditional artisans with conscious consumers",
      website: "https://ethicalthreads.com",
      logo: null,
      isVerified: true,
      createdAt: new Date(),
    };
    this.brands.set(sampleBrand.id, sampleBrand);

    const sampleArtisan: Artisan = {
      id: "artisan-1",
      name: "María Elena Tzi",
      bio: "Master weaver from Santiago Atitlán, Guatemala. 7th generation artisan specializing in traditional Mayan textiles.",
      profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
      location: "Santiago Atitlán, Guatemala",
      craft: "Backstrap Loom Weaving",
      experience: 35,
      generation: 7,
      isVerified: true,
      createdAt: new Date(),
    };
    this.artisans.set(sampleArtisan.id, sampleArtisan);

    const sampleBadges: Badge[] = [
      {
        id: "badge-1",
        name: "Cultural Archivist",
        description: "Explored 5+ different artisan communities",
        icon: "book-reader",
        requirement: { type: "communities", threshold: 5 },
        createdAt: new Date(),
      },
      {
        id: "badge-2",
        name: "Soil Saver",
        description: "Saved 1000+ liters of water through sustainable choices",
        icon: "tint",
        requirement: { type: "water_saved", threshold: 1000 },
        createdAt: new Date(),
      },
      {
        id: "badge-3",
        name: "Natural Dye",
        description: "Purchased 5+ garments using natural dyes",
        icon: "leaf",
        requirement: { type: "natural_dyes", threshold: 5 },
        createdAt: new Date(),
      }
    ];
    sampleBadges.forEach(badge => this.badges.set(badge.id, badge));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async getUserPassport(userId: string): Promise<UserPassport> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");

    const userStamps = await this.getUserStamps(userId);
    const userBadges = await this.getUserBadges(userId);

    const totalImpact = userStamps.reduce((acc, stamp) => {
      const metrics = stamp.garment.impactMetrics;
      if (metrics) {
        acc.waterSaved += Number(metrics.waterSaved || 0);
        acc.co2Offset += Number(metrics.co2Offset || 0);
        acc.artisansSupported += metrics.artisansSupported || 0;
      }
      return acc;
    }, { waterSaved: 0, co2Offset: 0, artisansSupported: 0, countriesExplored: 0 });

    const countries = new Set(userStamps.map(stamp => stamp.garment.origin));
    totalImpact.countriesExplored = countries.size;

    return {
      user,
      stamps: userStamps,
      badges: userBadges,
      totalImpact
    };
  }

  async getBrand(id: string): Promise<Brand | undefined> {
    return this.brands.get(id);
  }

  async createBrand(insertBrand: InsertBrand): Promise<Brand> {
    const id = randomUUID();
    const brand: Brand = { ...insertBrand, id, createdAt: new Date() };
    this.brands.set(id, brand);
    return brand;
  }

  async getAllBrands(): Promise<Brand[]> {
    return Array.from(this.brands.values());
  }

  async getArtisan(id: string): Promise<Artisan | undefined> {
    return this.artisans.get(id);
  }

  async createArtisan(insertArtisan: InsertArtisan): Promise<Artisan> {
    const id = randomUUID();
    const artisan: Artisan = { ...insertArtisan, id, createdAt: new Date() };
    this.artisans.set(id, artisan);
    return artisan;
  }

  async getGarment(id: string): Promise<GarmentWithDetails | undefined> {
    const garment = this.garments.get(id);
    if (!garment) return undefined;

    const brand = this.brands.get(garment.brandId);
    const artisan = this.artisans.get(garment.artisanId);
    const impactMetrics = Array.from(this.impactMetrics.values()).find(m => m.garmentId === id);
    const culturalContent = this.culturalContent.get(id) || [];
    const careInstructions = Array.from(this.careInstructions.values()).find(c => c.garmentId === id);
    const nfcCode = Array.from(this.nfcCodes.values()).find(n => n.garmentId === id);

    if (!brand || !artisan) return undefined;

    return {
      ...garment,
      brand,
      artisan,
      impactMetrics: impactMetrics || null,
      culturalContent,
      careInstructions: careInstructions || null,
      nfcCode: nfcCode || null,
    };
  }

  async createGarment(insertGarment: InsertGarment): Promise<Garment> {
    const id = randomUUID();
    const garment: Garment = { ...insertGarment, id, createdAt: new Date() };
    this.garments.set(id, garment);
    return garment;
  }

  async getAllGarments(filters?: { category?: string; brand?: string; search?: string }): Promise<GarmentWithDetails[]> {
    let garments = Array.from(this.garments.values());

    if (filters?.category) {
      garments = garments.filter(g => g.category === filters.category);
    }

    if (filters?.brand) {
      garments = garments.filter(g => g.brandId === filters.brand);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      garments = garments.filter(g => 
        g.name.toLowerCase().includes(search) || 
        g.description?.toLowerCase().includes(search) ||
        g.origin.toLowerCase().includes(search)
      );
    }

    const garmentDetails = await Promise.all(
      garments.map(async garment => {
        const details = await this.getGarment(garment.id);
        return details!;
      })
    );

    return garmentDetails.filter(Boolean);
  }

  async getGarmentByNfc(nfcUid: string): Promise<GarmentWithDetails | undefined> {
    const nfcCode = Array.from(this.nfcCodes.values()).find(n => n.nfcUid === nfcUid);
    if (!nfcCode) return undefined;
    return this.getGarment(nfcCode.garmentId);
  }

  async getGarmentByQr(qrCode: string): Promise<GarmentWithDetails | undefined> {
    const nfc = Array.from(this.nfcCodes.values()).find(n => n.qrCode === qrCode);
    if (!nfc) return undefined;
    return this.getGarment(nfc.garmentId);
  }

  async createNfcCode(insertNfcCode: InsertNfcCode): Promise<NfcCode> {
    const id = randomUUID();
    const nfcCode: NfcCode = { ...insertNfcCode, id, createdAt: new Date() };
    this.nfcCodes.set(id, nfcCode);
    return nfcCode;
  }

  async createImpactMetrics(insertMetrics: InsertImpactMetrics): Promise<ImpactMetrics> {
    const id = randomUUID();
    const metrics: ImpactMetrics = { ...insertMetrics, id, createdAt: new Date() };
    this.impactMetrics.set(id, metrics);
    return metrics;
  }

  async createCulturalContent(insertContent: InsertCulturalContent): Promise<CulturalContent> {
    const id = randomUUID();
    const content: CulturalContent = { ...insertContent, id, createdAt: new Date() };
    
    const existing = this.culturalContent.get(content.garmentId) || [];
    existing.push(content);
    this.culturalContent.set(content.garmentId, existing);
    
    return content;
  }

  async getCulturalContentByGarment(garmentId: string): Promise<CulturalContent[]> {
    return this.culturalContent.get(garmentId) || [];
  }

  async createCareInstructions(insertInstructions: InsertCareInstructions): Promise<CareInstructions> {
    const id = randomUUID();
    const instructions: CareInstructions = { ...insertInstructions, id, createdAt: new Date() };
    this.careInstructions.set(id, instructions);
    return instructions;
  }

  async createStamp(insertStamp: InsertStamp): Promise<Stamp> {
    const id = randomUUID();
    const stamp: Stamp = { ...insertStamp, id, unlockedAt: new Date() };
    
    const userStamps = this.stamps.get(stamp.userId) || [];
    userStamps.push(stamp);
    this.stamps.set(stamp.userId, userStamps);
    
    return stamp;
  }

  async getUserStamps(userId: string): Promise<Array<Stamp & { garment: GarmentWithDetails }>> {
    const userStamps = this.stamps.get(userId) || [];
    const stampsWithGarments = await Promise.all(
      userStamps.map(async stamp => {
        const garment = await this.getGarment(stamp.garmentId);
        return { ...stamp, garment: garment! };
      })
    );
    return stampsWithGarments.filter(s => s.garment);
  }

  async getAllBadges(): Promise<Badge[]> {
    return Array.from(this.badges.values());
  }

  async createBadge(insertBadge: InsertBadge): Promise<Badge> {
    const id = randomUUID();
    const badge: Badge = { ...insertBadge, id, createdAt: new Date() };
    this.badges.set(id, badge);
    return badge;
  }

  async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    const id = randomUUID();
    const userBadge: UserBadge = { id, userId, badgeId, earnedAt: new Date() };
    
    const existing = this.userBadges.get(userId) || [];
    existing.push(userBadge);
    this.userBadges.set(userId, existing);
    
    return userBadge;
  }

  async getUserBadges(userId: string): Promise<Array<UserBadge & { badge: Badge }>> {
    const userBadges = this.userBadges.get(userId) || [];
    return userBadges.map(ub => ({
      ...ub,
      badge: this.badges.get(ub.badgeId)!
    })).filter(ub => ub.badge);
  }

  async createPassportUnlock(insertUnlock: InsertPassportUnlock): Promise<PassportUnlock> {
    const id = randomUUID();
    const unlock: PassportUnlock = { ...insertUnlock, id, unlockedAt: new Date() };
    
    const userUnlocks = this.passportUnlocks.get(unlock.userId) || [];
    userUnlocks.push(unlock);
    this.passportUnlocks.set(unlock.userId, userUnlocks);
    
    return unlock;
  }

  async trackAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = randomUUID();
    const analytics: Analytics = { ...insertAnalytics, id, timestamp: new Date() };
    
    const garmentAnalytics = this.analytics.get(analytics.garmentId || 'global') || [];
    garmentAnalytics.push(analytics);
    this.analytics.set(analytics.garmentId || 'global', garmentAnalytics);
    
    return analytics;
  }

  async getGarmentAnalytics(garmentId: string): Promise<Analytics[]> {
    return this.analytics.get(garmentId) || [];
  }
}

export const storage = new MemStorage();
