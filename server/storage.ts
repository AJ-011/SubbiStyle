import type {
  User,
  Brand,
  Artisan,
  Garment,
  GarmentWithDetails,
  NfcCode,
  ImpactMetrics,
  CulturalContent,
  CareInstructions,
  Stamp,
  Badge,
  UserBadge,
  PassportUnlock,
  Analytics,
  UserPassport,
  InsertUser,
  InsertBrand,
  InsertArtisan,
  InsertGarment,
  InsertNfcCode,
  InsertImpactMetrics,
  InsertCulturalContent,
  InsertCareInstructions,
  InsertStamp,
  InsertBadge,
  InsertPassportUnlock,
  InsertAnalytics,
} from "@shared/schema";
import { dbStorage } from "./db-storage";

console.log("[startup][storage] Module loaded");

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
  getAllGarments(filters?: {
    category?: string;
    brand?: string;
    search?: string;
  }): Promise<GarmentWithDetails[]>;
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
  createCareInstructions(
    instructions: InsertCareInstructions,
  ): Promise<CareInstructions>;

  // Stamp operations
  createStamp(stamp: InsertStamp): Promise<Stamp>;
  getUserStamps(
    userId: string,
  ): Promise<Array<Stamp & { garment: GarmentWithDetails }>>;

  // Badge operations
  getAllBadges(): Promise<Badge[]>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  awardBadge(userId: string, badgeId: string): Promise<UserBadge>;
  getUserBadges(
    userId: string,
  ): Promise<Array<UserBadge & { badge: Badge }>>;

  // Passport unlock operations
  createPassportUnlock(unlock: InsertPassportUnlock): Promise<PassportUnlock>;

  // Analytics operations
  trackAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getGarmentAnalytics(garmentId: string): Promise<Analytics[]>;
}

// TODO: ensure DatabaseStorage implements all methods from IStorage.
export const storage: IStorage = dbStorage;
console.log("[startup][storage] Using database storage backend");


