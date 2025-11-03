import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateCulturalContent, generateCraftDescription, enhanceArtisanStory } from "./openai";
import { 
  insertGarmentSchema, insertBrandSchema, insertArtisanSchema, 
  insertNfcCodeSchema, insertImpactMetricsSchema, insertCulturalContentSchema,
  insertCareInstructionsSchema, insertStampSchema, insertAnalyticsSchema
} from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("[startup][routes] Registering HTTP routes");
  // Garment routes
  app.get("/api/garments", async (req, res) => {
    try {
      const { category, brand, search } = req.query;
      const garments = await storage.getAllGarments({
        category: category as string,
        brand: brand as string,
        search: search as string,
      });
      res.json(garments);
    } catch (error) {
      console.error("Error fetching garments:", error);
      res.status(500).json({ message: "Failed to fetch garments" });
    }
  });

  app.get("/api/garments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const garment = await storage.getGarment(id);
      if (!garment) {
        return res.status(404).json({ message: "Garment not found" });
      }
      res.json(garment);
    } catch (error) {
      console.error("Error fetching garment:", error);
      res.status(500).json({ message: "Failed to fetch garment" });
    }
  });

  app.post("/api/garments", async (req, res) => {
    try {
      const validatedData = insertGarmentSchema.parse(req.body);
      const garment = await storage.createGarment(validatedData);
      res.status(201).json(garment);
    } catch (error) {
      console.error("Error creating garment:", error);
      res.status(400).json({ message: "Invalid garment data" });
    }
  });

  // NFC/QR scanning routes
  app.get("/api/scan/nfc/:uid", async (req, res) => {
    try {
      const { uid } = req.params;
      const garment = await storage.getGarmentByNfc(uid);
      
      if (!garment) {
        return res.status(404).json({ message: "Garment not found for this NFC tag" });
      }

      // Track scan analytics
      await storage.trackAnalytics({
        garmentId: garment.id,
        action: "scan",
        metadata: { scanType: "nfc", nfcUid: uid } as any,
      });

      res.json(garment);
    } catch (error) {
      console.error("Error scanning NFC:", error);
      res.status(500).json({ message: "Failed to scan NFC tag" });
    }
  });

  app.get("/api/scan/qr/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const garment = await storage.getGarmentByQr(code);
      
      if (!garment) {
        return res.status(404).json({ message: "Garment not found for this QR code" });
      }

      // Track scan analytics
      await storage.trackAnalytics({
        garmentId: garment.id,
        action: "scan",
        metadata: { scanType: "qr", qrCode: code } as any,
      });

      res.json(garment);
    } catch (error) {
      console.error("Error scanning QR code:", error);
      res.status(500).json({ message: "Failed to scan QR code" });
    }
  });

  // User passport routes
  app.get("/api/users/:userId/passport", async (req, res) => {
    try {
      const { userId } = req.params;
      const passport = await storage.getUserPassport(userId);
      res.json(passport);
    } catch (error) {
      console.error("Error fetching user passport:", error);
      res.status(500).json({ message: "Failed to fetch user passport" });
    }
  });

  // Stamp routes
  app.post("/api/stamps", async (req, res) => {
    try {
      const validatedData = insertStampSchema.parse(req.body);
      const stamp = await storage.createStamp(validatedData);
      
      // Track unlock analytics
      await storage.trackAnalytics({
        userId: stamp.userId,
        garmentId: stamp.garmentId,
        action: "view_passport",
        metadata: { stampId: stamp.id } as any,
      });

      res.status(201).json(stamp);
    } catch (error) {
      console.error("Error creating stamp:", error);
      res.status(400).json({ message: "Invalid stamp data" });
    }
  });

  // Badge routes
  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getAllBadges();
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  app.get("/api/users/:userId/badges", async (req, res) => {
    try {
      const { userId } = req.params;
      const userBadges = await storage.getUserBadges(userId);
      res.json(userBadges);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });

  // Brand routes
  app.get("/api/brands", async (req, res) => {
    try {
      const brands = await storage.getAllBrands();
      res.json(brands);
    } catch (error) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ message: "Failed to fetch brands" });
    }
  });

  app.post("/api/brands", async (req, res) => {
    try {
      const validatedData = insertBrandSchema.parse(req.body);
      const brand = await storage.createBrand(validatedData);
      res.status(201).json(brand);
    } catch (error) {
      console.error("Error creating brand:", error);
      res.status(400).json({ message: "Invalid brand data" });
    }
  });

  // Artisan routes
  app.post("/api/artisans", async (req, res) => {
    try {
      const validatedData = insertArtisanSchema.parse(req.body);
      const artisan = await storage.createArtisan(validatedData);
      res.status(201).json(artisan);
    } catch (error) {
      console.error("Error creating artisan:", error);
      res.status(400).json({ message: "Invalid artisan data" });
    }
  });

  // AI content generation routes
  app.post("/api/generate/cultural-content", async (req, res) => {
    try {
      const { garmentName, origin, craftTechnique, artisanName, materials, culturalContext } = req.body;
      
      const content = await generateCulturalContent({
        garmentName,
        origin,
        craftTechnique,
        artisanName,
        materials,
        culturalContext,
      });
      
      res.json(content);
    } catch (error) {
      console.error("Error generating cultural content:", error);
      res.status(500).json({ message: "Failed to generate cultural content" });
    }
  });

  app.post("/api/generate/craft-description", async (req, res) => {
    try {
      const { technique, origin } = req.body;
      const description = await generateCraftDescription(technique, origin);
      res.json({ description });
    } catch (error) {
      console.error("Error generating craft description:", error);
      res.status(500).json({ message: "Failed to generate craft description" });
    }
  });

  app.post("/api/generate/artisan-story", async (req, res) => {
    try {
      const { artisanName, craft, location, experience } = req.body;
      const story = await enhanceArtisanStory(artisanName, craft, location, experience);
      res.json({ story });
    } catch (error) {
      console.error("Error enhancing artisan story:", error);
      res.status(500).json({ message: "Failed to enhance artisan story" });
    }
  });

  // Impact metrics routes
  app.post("/api/impact-metrics", async (req, res) => {
    try {
      const validatedData = insertImpactMetricsSchema.parse(req.body);
      const metrics = await storage.createImpactMetrics(validatedData);
      res.status(201).json(metrics);
    } catch (error) {
      console.error("Error creating impact metrics:", error);
      res.status(400).json({ message: "Invalid impact metrics data" });
    }
  });

  // Cultural content routes
  app.post("/api/cultural-content", async (req, res) => {
    try {
      const validatedData = insertCulturalContentSchema.parse(req.body);
      const content = await storage.createCulturalContent(validatedData);
      res.status(201).json(content);
    } catch (error) {
      console.error("Error creating cultural content:", error);
      res.status(400).json({ message: "Invalid cultural content data" });
    }
  });

  // Care instructions routes
  app.post("/api/care-instructions", async (req, res) => {
    try {
      const validatedData = insertCareInstructionsSchema.parse(req.body);
      const instructions = await storage.createCareInstructions(validatedData);
      res.status(201).json(instructions);
    } catch (error) {
      console.error("Error creating care instructions:", error);
      res.status(400).json({ message: "Invalid care instructions data" });
    }
  });

  // NFC/QR code generation routes
  app.post("/api/nfc-codes", async (req, res) => {
    try {
      const validatedData = insertNfcCodeSchema.parse(req.body);
      const nfcCode = await storage.createNfcCode(validatedData);
      res.status(201).json(nfcCode);
    } catch (error) {
      console.error("Error creating NFC code:", error);
      res.status(400).json({ message: "Invalid NFC code data" });
    }
  });

  // Analytics routes
  app.post("/api/analytics", async (req, res) => {
    try {
      const validatedData = insertAnalyticsSchema.parse(req.body);
      const analytics = await storage.trackAnalytics(validatedData);
      res.status(201).json(analytics);
    } catch (error) {
      console.error("Error tracking analytics:", error);
      res.status(400).json({ message: "Invalid analytics data" });
    }
  });

  app.get("/api/garments/:garmentId/analytics", async (req, res) => {
    try {
      const { garmentId } = req.params;
      const analytics = await storage.getGarmentAnalytics(garmentId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching garment analytics:", error);
      res.status(500).json({ message: "Failed to fetch garment analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
