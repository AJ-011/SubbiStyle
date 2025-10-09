import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, decimal, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  name: varchar("name").notNull(),
  profileImage: text("profile_image"),
  membershipTier: varchar("membership_tier", { enum: ["silver", "gold", "platinum"] }).default("silver"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Brands table
export const brands = pgTable("brands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  website: varchar("website"),
  logo: text("logo"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Artisans table
export const artisans = pgTable("artisans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  bio: text("bio"),
  profileImage: text("profile_image"),
  location: varchar("location").notNull(),
  craft: varchar("craft").notNull(),
  experience: integer("experience"), // years of experience
  generation: integer("generation"), // nth generation artisan
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Garments table
export const garments = pgTable("garments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  brandId: varchar("brand_id").references(() => brands.id).notNull(),
  artisanId: varchar("artisan_id").references(() => artisans.id).notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category", { enum: ["clothing", "accessories", "textiles", "jewelry"] }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  images: jsonb("images").$type<string[]>().default([]),
  origin: varchar("origin").notNull(),
  materials: jsonb("materials").$type<string[]>().default([]),
  techniques: jsonb("techniques").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// NFC/QR Codes table
export const nfcCodes = pgTable("nfc_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  garmentId: varchar("garment_id").references(() => garments.id).notNull(),
  nfcUid: varchar("nfc_uid").unique(),
  qrCode: varchar("qr_code").unique(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Impact Metrics table
export const impactMetrics = pgTable("impact_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  garmentId: varchar("garment_id").references(() => garments.id).notNull(),
  waterSaved: decimal("water_saved", { precision: 10, scale: 2 }), // liters
  co2Offset: decimal("co2_offset", { precision: 10, scale: 2 }), // kg
  artisansSupported: integer("artisans_supported"),
  supplyChainSteps: jsonb("supply_chain_steps").$type<Array<{
    step: number;
    title: string;
    location: string;
    date: string;
    description: string;
  }>>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cultural Content table
export const culturalContent = pgTable("cultural_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  garmentId: varchar("garment_id").references(() => garments.id).notNull(),
  contentType: varchar("content_type", { 
    enum: ["recipe", "music", "video", "myth", "vocabulary", "technique", "history"] 
  }).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  content: jsonb("content").$type<{
    text?: string;
    mediaUrl?: string;
    ingredients?: string[];
    instructions?: string[];
    vocabulary?: Array<{ word: string; definition: string; }>;
    [key: string]: any;
  }>(),
  isAiGenerated: boolean("is_ai_generated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Care Instructions table
export const careInstructions = pgTable("care_instructions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  garmentId: varchar("garment_id").references(() => garments.id).notNull(),
  washingInstructions: text("washing_instructions"),
  dryingInstructions: text("drying_instructions"),
  storageTips: text("storage_tips"),
  repairTips: text("repair_tips"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Stamps table (represents user's unlocked garment passports)
export const stamps = pgTable("stamps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  garmentId: varchar("garment_id").references(() => garments.id).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  scanLocation: varchar("scan_location"),
});

// Badges table
export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon").notNull(),
  requirement: jsonb("requirement").$type<{
    type: "stamp_count" | "water_saved" | "communities" | "craft_types" | "natural_dyes";
    threshold: number;
    criteria?: string;
  }>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Badges table (junction table)
export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  badgeId: varchar("badge_id").references(() => badges.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Passport Unlocks table (tracking which passport sections users have viewed)
export const passportUnlocks = pgTable("passport_unlocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  garmentId: varchar("garment_id").references(() => garments.id).notNull(),
  section: varchar("section", { enum: ["impact", "care", "culture"] }).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

// Analytics table for tracking engagement
export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  garmentId: varchar("garment_id").references(() => garments.id),
  action: varchar("action", { 
    enum: ["scan", "view_passport", "view_impact", "view_care", "view_culture", "share", "purchase"] 
  }).notNull(),
  metadata: jsonb("metadata").$type<{ [key: string]: any }>(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertBrandSchema = createInsertSchema(brands).omit({ id: true, createdAt: true });
export const insertArtisanSchema = createInsertSchema(artisans).omit({ id: true, createdAt: true });
export const insertGarmentSchema = createInsertSchema(garments).omit({ id: true, createdAt: true });
export const insertNfcCodeSchema = createInsertSchema(nfcCodes).omit({ id: true, createdAt: true });
export const insertImpactMetricsSchema = createInsertSchema(impactMetrics).omit({ id: true, createdAt: true });
export const insertCulturalContentSchema = createInsertSchema(culturalContent).omit({ id: true, createdAt: true });
export const insertCareInstructionsSchema = createInsertSchema(careInstructions).omit({ id: true, createdAt: true });
export const insertStampSchema = createInsertSchema(stamps).omit({ id: true, unlockedAt: true });
export const insertBadgeSchema = createInsertSchema(badges).omit({ id: true, createdAt: true });
export const insertPassportUnlockSchema = createInsertSchema(passportUnlocks).omit({ id: true, unlockedAt: true });
export const insertAnalyticsSchema = createInsertSchema(analytics).omit({ id: true, timestamp: true });

// Types
export type User = typeof users.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type Artisan = typeof artisans.$inferSelect;
export type Garment = typeof garments.$inferSelect;
export type NfcCode = typeof nfcCodes.$inferSelect;
export type ImpactMetrics = typeof impactMetrics.$inferSelect;
export type CulturalContent = typeof culturalContent.$inferSelect;
export type CareInstructions = typeof careInstructions.$inferSelect;
export type Stamp = typeof stamps.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type PassportUnlock = typeof passportUnlocks.$inferSelect;
export type Analytics = typeof analytics.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type InsertArtisan = z.infer<typeof insertArtisanSchema>;
export type InsertGarment = z.infer<typeof insertGarmentSchema>;
export type InsertNfcCode = z.infer<typeof insertNfcCodeSchema>;
export type InsertImpactMetrics = z.infer<typeof insertImpactMetricsSchema>;
export type InsertCulturalContent = z.infer<typeof insertCulturalContentSchema>;
export type InsertCareInstructions = z.infer<typeof insertCareInstructionsSchema>;
export type InsertStamp = z.infer<typeof insertStampSchema>;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type InsertPassportUnlock = z.infer<typeof insertPassportUnlockSchema>;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;

// Extended types for API responses
export type GarmentWithDetails = Garment & {
  brand: Brand;
  artisan: Artisan;
  impactMetrics: ImpactMetrics | null;
  culturalContent: CulturalContent[];
  careInstructions: CareInstructions | null;
  nfcCode: NfcCode | null;
};

export type UserPassport = {
  user: User;
  stamps: Array<Stamp & { garment: GarmentWithDetails }>;
  badges: Array<UserBadge & { badge: Badge }>;
  totalImpact: {
    waterSaved: number;
    co2Offset: number;
    artisansSupported: number;
    countriesExplored: number;
  };
};
