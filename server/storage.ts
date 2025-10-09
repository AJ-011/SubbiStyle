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

    // Seed sample garments
    const sampleGarment1: Garment = {
      id: "garment-1",
      name: "Huipil de Flores",
      origin: "Santiago Atitlán, Guatemala",
      description: "Traditional Mayan embroidered blouse featuring intricate floral patterns handwoven using backstrap loom techniques passed down through seven generations.",
      category: "clothing",
      brandId: "brand-1",
      artisanId: "artisan-1",
      price: "285.00",
      images: [
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800",
        "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800"
      ],
      materials: ["Natural Cotton", "Cochineal Dye", "Indigo", "Annatto"],
      techniques: ["Backstrap Loom Weaving", "Brocade Embroidery", "Natural Dyeing"],
      isActive: true,
      isVerified: true,
      createdAt: new Date(),
    };
    this.garments.set(sampleGarment1.id, sampleGarment1);

    // NFC code for garment 1
    const nfcCode1: NfcCode = {
      id: "nfc-1",
      garmentId: "garment-1",
      nfcUid: "04:5E:9A:B2:C3:D4",
      qrCode: "SUBBI-GTM-001",
      isActive: true,
      createdAt: new Date(),
    };
    this.nfcCodes.set(nfcCode1.id, nfcCode1);

    // Impact metrics for garment 1
    const impact1: ImpactMetrics = {
      id: "impact-1",
      garmentId: "garment-1",
      waterSaved: "2500",
      co2Offset: "12",
      artisansSupported: 3,
      supplyChainSteps: [
        { step: 1, title: "Cotton Harvest", location: "San Marcos, Guatemala", date: "2024-01", description: "Organic cotton harvested by local cooperative" },
        { step: 2, title: "Natural Dyeing", location: "Antigua, Guatemala", date: "2024-02", description: "Traditional natural dyes prepared from cochineal and indigo" },
        { step: 3, title: "Weaving", location: "Santiago Atitlán, Guatemala", date: "2024-03", description: "Handwoven by María Elena using backstrap loom" },
        { step: 4, title: "Embroidery", location: "Santiago Atitlán, Guatemala", date: "2024-04", description: "Intricate brocade patterns added by hand" }
      ],
      createdAt: new Date(),
    };
    this.impactMetrics.set(impact1.id, impact1);

    // Cultural content for garment 1
    const cultural1: CulturalContent[] = [
      {
        id: "cultural-1-1",
        garmentId: "garment-1",
        contentType: "history",
        title: "The Sacred Art of Backstrap Loom Weaving",
        description: "A journey through seven generations of Mayan textile tradition",
        content: {
          text: "The backstrap loom, called 'telar de cintura' in Spanish, has been used by Mayan women for over 2,000 years. This ancient technique connects the weaver directly to her ancestors, as each pattern tells a story of creation, nature, and community. María Elena learned from her grandmother, who learned from hers, maintaining an unbroken chain of knowledge that predates the Spanish conquest."
        },
        isAiGenerated: false,
        createdAt: new Date(),
      },
      {
        id: "cultural-1-2",
        garmentId: "garment-1",
        contentType: "technique",
        title: "Natural Dye Preparation",
        description: "Traditional methods for extracting colors from nature",
        content: {
          text: "The deep reds come from cochineal insects, carefully harvested from nopal cactus. Blues are extracted from indigo leaves through a fermentation process that takes weeks to perfect. Each color carries meaning: red for blood and life force, blue for water and sky.",
          mediaUrl: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800"
        },
        isAiGenerated: false,
        createdAt: new Date(),
      },
      {
        id: "cultural-1-3",
        garmentId: "garment-1",
        contentType: "vocabulary",
        title: "Mayan Weaving Terms",
        description: "Essential vocabulary from the Tz'utujil language",
        content: {
          vocabulary: [
            { word: "Tz'ute'", definition: "Traditional head covering worn during ceremonies" },
            { word: "Corte", definition: "Wraparound skirt woven in complex patterns" },
            { word: "Jaspe", definition: "Ikat dyeing technique creating feathered patterns" },
            { word: "Güipil", definition: "Traditional blouse (Spanish spelling)" }
          ]
        },
        isAiGenerated: false,
        createdAt: new Date(),
      }
    ];
    this.culturalContent.set("garment-1", cultural1);

    // Care instructions for garment 1
    const care1: CareInstructions = {
      id: "care-1",
      garmentId: "garment-1",
      washingInstructions: "Hand wash in cold water with mild, natural soap. Never use bleach or harsh detergents as they will fade natural dyes.",
      dryingInstructions: "Lay flat to dry in shade. Direct sunlight will fade the vibrant natural colors.",
      storageTips: "Store folded in a cool, dry place. Use cedar sachets to protect from moths. Avoid plastic bags which can trap moisture.",
      repairTips: "Small tears can be mended using matching thread and traditional darning techniques. For major repairs, consult with textile conservators familiar with backstrap loom weaving.",
      createdAt: new Date(),
    };
    this.careInstructions.set(care1.id, care1);

    // Add second garment - Moroccan Kaftan
    const sampleArtisan2: Artisan = {
      id: "artisan-2",
      name: "Fatima Benali",
      bio: "Master embroiderer from Fes, Morocco. Specializes in traditional zellij-inspired needlework.",
      profileImage: "https://images.unsplash.com/photo-1509099863731-ef4bff19e808?w=200&h=200",
      location: "Fes, Morocco",
      craft: "Traditional Embroidery",
      experience: 28,
      generation: 5,
      isVerified: true,
      createdAt: new Date(),
    };
    this.artisans.set(sampleArtisan2.id, sampleArtisan2);

    const sampleGarment2: Garment = {
      id: "garment-2",
      name: "Zellij Kaftan",
      origin: "Fes, Morocco",
      description: "Luxurious silk kaftan featuring intricate geometric embroidery inspired by traditional Moroccan tile work.",
      category: "clothing",
      brandId: "brand-1",
      artisanId: "artisan-2",
      price: "420.00",
      images: [
        "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=800",
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800"
      ],
      materials: ["Silk", "Gold Thread", "Silver Thread", "Natural Dyes"],
      techniques: ["Hand Embroidery", "Zellij Pattern Work", "Silk Weaving"],
      isActive: true,
      isVerified: true,
      createdAt: new Date(),
    };
    this.garments.set(sampleGarment2.id, sampleGarment2);

    const nfcCode2: NfcCode = {
      id: "nfc-2",
      garmentId: "garment-2",
      nfcUid: "04:7F:8B:A3:D2:E5",
      qrCode: "SUBBI-MOR-002",
      isActive: true,
      createdAt: new Date(),
    };
    this.nfcCodes.set(nfcCode2.id, nfcCode2);

    const impact2: ImpactMetrics = {
      id: "impact-2",
      garmentId: "garment-2",
      waterSaved: "3200",
      co2Offset: "18",
      artisansSupported: 5,
      supplyChainSteps: [
        { step: 1, title: "Silk Production", location: "Chefchaouen, Morocco", date: "2024-01", description: "Organic silk from local cooperative" },
        { step: 2, title: "Natural Dyeing", location: "Fes, Morocco", date: "2024-02", description: "Traditional plant-based dyes" },
        { step: 3, title: "Pattern Design", location: "Fes, Morocco", date: "2024-03", description: "Geometric zellij patterns mapped for embroidery" },
        { step: 4, title: "Hand Embroidery", location: "Fes, Morocco", date: "2024-05", description: "Intricate needlework by Fatima Benali" }
      ],
      createdAt: new Date(),
    };
    this.impactMetrics.set(impact2.id, impact2);

    const cultural2: CulturalContent[] = [
      {
        id: "cultural-2-1",
        garmentId: "garment-2",
        contentType: "history",
        title: "The Art of Zellij",
        description: "Islamic geometric patterns in textile form",
        content: {
          text: "Zellij, the intricate mosaic tilework that adorns Morocco's most beautiful buildings, has inspired textile artists for centuries. Each geometric pattern holds mathematical precision and spiritual meaning, representing the infinite nature of creation in Islamic art."
        },
        isAiGenerated: false,
        createdAt: new Date(),
      },
      {
        id: "cultural-2-2",
        garmentId: "garment-2",
        contentType: "technique",
        title: "Metallic Thread Embroidery",
        description: "Ancient techniques for working with gold and silver",
        content: {
          text: "The art of metallic thread embroidery, known as 'tarz,' requires exceptional skill. Each stitch must be carefully controlled to prevent the delicate gold and silver threads from breaking. The patterns emerge slowly, sometimes taking months to complete a single kaftan.",
          mediaUrl: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800"
        },
        isAiGenerated: false,
        createdAt: new Date(),
      },
      {
        id: "cultural-2-3",
        garmentId: "garment-2",
        contentType: "vocabulary",
        title: "Moroccan Textile Terms",
        description: "Essential vocabulary from Darija (Moroccan Arabic)",
        content: {
          vocabulary: [
            { word: "Tarz", definition: "Traditional metallic thread embroidery technique" },
            { word: "Zellij", definition: "Geometric mosaic tilework that inspired these patterns" },
            { word: "Caftan", definition: "Traditional Moroccan long robe (alternate spelling)" },
            { word: "Fassi", definition: "From Fes - referring to the city's artisan traditions" }
          ]
        },
        isAiGenerated: false,
        createdAt: new Date(),
      }
    ];
    this.culturalContent.set("garment-2", cultural2);

    const care2: CareInstructions = {
      id: "care-2",
      garmentId: "garment-2",
      washingInstructions: "Dry clean only. The delicate silk and metallic threads require professional care.",
      dryingInstructions: "Professional dry cleaning process will handle drying appropriately.",
      storageTips: "Hang on padded hanger in breathable garment bag. Store away from direct sunlight and humidity.",
      repairTips: "Consult with textile conservators for any repairs to preserve the integrity of the embroidery.",
      createdAt: new Date(),
    };
    this.careInstructions.set(care2.id, care2);

    // Add third brand - Japanese artisan cooperative
    const sampleBrand2: Brand = {
      id: "brand-2",
      name: "Kogei Collective",
      description: "Preserving traditional Japanese textile arts",
      website: "https://kogeicollective.jp",
      logo: null,
      isVerified: true,
      createdAt: new Date(),
    };
    this.brands.set(sampleBrand2.id, sampleBrand2);

    // Third artisan - Japanese indigo dyer
    const sampleArtisan3: Artisan = {
      id: "artisan-3",
      name: "Kenji Tanaka",
      bio: "Master indigo dyer from Tokushima, Japan. Specializes in traditional aizome (indigo dyeing) techniques.",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200",
      location: "Tokushima, Japan",
      craft: "Indigo Dyeing",
      experience: 42,
      generation: 6,
      isVerified: true,
      createdAt: new Date(),
    };
    this.artisans.set(sampleArtisan3.id, sampleArtisan3);

    // Garment 3 - Indigo scarf (accessories category)
    const sampleGarment3: Garment = {
      id: "garment-3",
      name: "Aizome Indigo Scarf",
      origin: "Tokushima, Japan",
      description: "Hand-dyed indigo scarf using traditional Japanese aizome fermentation techniques, creating unique patterns.",
      category: "accessories",
      brandId: "brand-2",
      artisanId: "artisan-3",
      price: "145.00",
      images: [
        "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800"
      ],
      materials: ["Organic Cotton", "Natural Indigo"],
      techniques: ["Aizome Fermentation", "Shibori Resist Dyeing"],
      isActive: true,
      isVerified: true,
      createdAt: new Date(),
    };
    this.garments.set(sampleGarment3.id, sampleGarment3);

    const nfcCode3: NfcCode = {
      id: "nfc-3",
      garmentId: "garment-3",
      qrCode: "SUBBI-JPN-003",
      isActive: true,
      createdAt: new Date(),
    };
    this.nfcCodes.set(nfcCode3.id, nfcCode3);

    const impact3: ImpactMetrics = {
      id: "impact-3",
      garmentId: "garment-3",
      waterSaved: "1800",
      co2Offset: "8",
      artisansSupported: 2,
      supplyChainSteps: [
        { step: 1, title: "Cotton Growing", location: "Tokushima, Japan", date: "2024-01", description: "Organic cotton cultivation" },
        { step: 2, title: "Indigo Fermentation", location: "Tokushima, Japan", date: "2024-02", description: "Traditional sukumo indigo preparation" },
        { step: 3, title: "Dyeing Process", location: "Tokushima, Japan", date: "2024-03", description: "Multiple dips to achieve deep blue color" },
        { step: 4, title: "Shibori Pattern", location: "Tokushima, Japan", date: "2024-04", description: "Hand-tied resist patterns" }
      ],
      createdAt: new Date(),
    };
    this.impactMetrics.set(impact3.id, impact3);

    const cultural3: CulturalContent[] = [
      {
        id: "cultural-3-1",
        garmentId: "garment-3",
        contentType: "history",
        title: "The Ancient Art of Aizome",
        description: "Japan's indigo dyeing tradition",
        content: {
          text: "Aizome, Japanese indigo dyeing, dates back over 1,000 years. The deep blue color was so valued that it became the color of the working class during the Edo period, earning Japan the nickname 'the country of blue.'"
        },
        isAiGenerated: false,
        createdAt: new Date(),
      },
      {
        id: "cultural-3-2",
        garmentId: "garment-3",
        contentType: "technique",
        title: "Fermentation Process",
        description: "Creating living indigo dye",
        content: {
          text: "Unlike chemical dyes, traditional aizome uses fermented indigo leaves. The dye vat is a living organism that must be 'fed' and maintained daily. The depth of color depends on how many times the fabric is dipped - each immersion adds another layer of blue."
        },
        isAiGenerated: false,
        createdAt: new Date(),
      },
      {
        id: "cultural-3-3",
        garmentId: "garment-3",
        contentType: "vocabulary",
        title: "Aizome Terminology",
        description: "Japanese indigo dyeing terms",
        content: {
          vocabulary: [
            { word: "Aizome", definition: "Indigo dyeing technique" },
            { word: "Sukumo", definition: "Fermented indigo leaves used to make dye" },
            { word: "Shibori", definition: "Tie-dye resist technique for creating patterns" },
            { word: "Japan Blue", definition: "The distinctive deep blue achieved through aizome" }
          ]
        },
        isAiGenerated: false,
        createdAt: new Date(),
      }
    ];
    this.culturalContent.set("garment-3", cultural3);

    const care3: CareInstructions = {
      id: "care-3",
      garmentId: "garment-3",
      washingInstructions: "Hand wash separately in cold water. Natural indigo may release some dye during first few washes.",
      dryingInstructions: "Air dry in shade. Direct sunlight will gradually fade the indigo over time.",
      storageTips: "Store away from light. Indigo is light-sensitive and will develop a beautiful patina with age.",
      repairTips: "Small tears can be mended with indigo-dyed thread. The scarf will develop character with use and repair.",
      createdAt: new Date(),
    };
    this.careInstructions.set(care3.id, care3);

    // Demo user with stamps
    const demoUser: User = {
      id: "user-1",
      name: "Sarah Martinez",
      email: "sarah@example.com",
      profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200",
      membershipTier: "gold",
      createdAt: new Date(),
    };
    this.users.set(demoUser.id, demoUser);

    // Create stamps for the demo user
    const stamp1: Stamp = {
      id: "stamp-1",
      userId: "user-1",
      garmentId: "garment-1",
      scanLocation: "New York, USA",
      unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    };
    const stamp2: Stamp = {
      id: "stamp-2",
      userId: "user-1",
      garmentId: "garment-2",
      scanLocation: "Paris, France",
      unlockedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    };
    this.stamps.set("user-1", [stamp1, stamp2]);

    // Award a badge to the demo user
    const userBadge1: UserBadge = {
      id: "user-badge-1",
      userId: "user-1",
      badgeId: "badge-2",
      earnedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    };
    this.userBadges.set("user-1", [userBadge1]);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      email: insertUser.email ?? null,
      profileImage: insertUser.profileImage ?? null,
      membershipTier: insertUser.membershipTier ?? null,
      createdAt: new Date() 
    };
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
    const brand: Brand = { 
      ...insertBrand, 
      id, 
      description: insertBrand.description ?? null,
      website: insertBrand.website ?? null,
      logo: insertBrand.logo ?? null,
      isVerified: insertBrand.isVerified ?? null,
      createdAt: new Date() 
    };
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
    const artisan: Artisan = { 
      ...insertArtisan, 
      id, 
      bio: insertArtisan.bio ?? null,
      profileImage: insertArtisan.profileImage ?? null,
      experience: insertArtisan.experience ?? null,
      generation: insertArtisan.generation ?? null,
      isVerified: insertArtisan.isVerified ?? null,
      createdAt: new Date() 
    };
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
    const garment: Garment = { 
      ...insertGarment, 
      id, 
      description: insertGarment.description ?? null,
      images: insertGarment.images ?? [],
      materials: insertGarment.materials ?? [],
      techniques: insertGarment.techniques ?? [],
      isActive: insertGarment.isActive ?? null,
      isVerified: insertGarment.isVerified ?? null,
      createdAt: new Date() 
    };
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
    const nfcCode: NfcCode = { 
      ...insertNfcCode, 
      id, 
      nfcUid: insertNfcCode.nfcUid ?? null,
      qrCode: insertNfcCode.qrCode ?? null,
      isActive: insertNfcCode.isActive ?? null,
      createdAt: new Date() 
    };
    this.nfcCodes.set(id, nfcCode);
    return nfcCode;
  }

  async createImpactMetrics(insertMetrics: InsertImpactMetrics): Promise<ImpactMetrics> {
    const id = randomUUID();
    const metrics: ImpactMetrics = { 
      ...insertMetrics, 
      id, 
      waterSaved: insertMetrics.waterSaved ?? null,
      co2Offset: insertMetrics.co2Offset ?? null,
      artisansSupported: insertMetrics.artisansSupported ?? null,
      supplyChainSteps: insertMetrics.supplyChainSteps ?? null,
      createdAt: new Date() 
    };
    this.impactMetrics.set(id, metrics);
    return metrics;
  }

  async createCulturalContent(insertContent: InsertCulturalContent): Promise<CulturalContent> {
    const id = randomUUID();
    const content: CulturalContent = { 
      ...insertContent, 
      id, 
      description: insertContent.description ?? null,
      content: insertContent.content ?? null,
      isAiGenerated: insertContent.isAiGenerated ?? null,
      createdAt: new Date() 
    };
    
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
    const instructions: CareInstructions = { 
      ...insertInstructions, 
      id, 
      washingInstructions: insertInstructions.washingInstructions ?? null,
      dryingInstructions: insertInstructions.dryingInstructions ?? null,
      storageTips: insertInstructions.storageTips ?? null,
      repairTips: insertInstructions.repairTips ?? null,
      createdAt: new Date() 
    };
    this.careInstructions.set(id, instructions);
    return instructions;
  }

  async createStamp(insertStamp: InsertStamp): Promise<Stamp> {
    const id = randomUUID();
    const stamp: Stamp = { 
      ...insertStamp, 
      id, 
      scanLocation: insertStamp.scanLocation ?? null,
      unlockedAt: new Date() 
    };
    
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
    const badge: Badge = { 
      ...insertBadge, 
      id, 
      description: insertBadge.description ?? null,
      createdAt: new Date() 
    };
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
    const analytics: Analytics = { 
      ...insertAnalytics, 
      id, 
      userId: insertAnalytics.userId ?? null,
      garmentId: insertAnalytics.garmentId ?? null,
      metadata: insertAnalytics.metadata ?? null,
      timestamp: new Date() 
    };
    
    const garmentAnalytics = this.analytics.get(analytics.garmentId || 'global') || [];
    garmentAnalytics.push(analytics);
    this.analytics.set(analytics.garmentId || 'global', garmentAnalytics);
    
    return analytics;
  }

  async getGarmentAnalytics(garmentId: string): Promise<Analytics[]> {
    return this.analytics.get(garmentId) || [];
  }
}

import { dbStorage } from "./db-storage";

// Use database storage instead of in-memory storage
export const storage: IStorage = dbStorage as any;
