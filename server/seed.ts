import "dotenv/config";
import { db } from "./db";
import * as schema from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Seed brands
  const brands = await db.insert(schema.brands).values([
    {
      id: "brand-1",
      name: "Threads of Heritage",
      description: "Preserving Guatemalan textile traditions through ethical partnerships with indigenous artisans",
      origin: "Guatemala",
      philosophy: "We believe in honoring traditional craftsmanship while providing fair wages and sustainable livelihoods",
      sustainabilityPractices: ["Fair Trade Certified", "Natural Dyes Only", "Zero Waste Production", "Artisan Profit Sharing"],
      logoUrl: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400",
      website: "https://threadsofheritage.com",
      isVerified: true,
    },
    {
      id: "brand-2",
      name: "Desert Rose Collective",
      description: "Connecting global citizens with artisans across Morocco, Japan, and India",
      origin: "Morocco",
      philosophy: "Celebrating cultural diversity through mindful fashion and cross-cultural collaboration",
      sustainabilityPractices: ["Organic Materials", "Water Conservation", "Community Development", "Cultural Preservation"],
      logoUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?w=400",
      website: "https://desertrosecollective.com",
      isVerified: true,
    },
    {
      id: "brand-3",
      name: "Pajama Sutra",
      description: "Celebrating India's rich textile heritage through handloom cotton and natural dyeing traditions from Jaipur",
      origin: "India",
      philosophy: "Honoring the rhythms of slow fashion—where each garment is woven, dyed, and block-printed by hand, preserving centuries-old Rajasthani artistry",
      sustainabilityPractices: ["100% Handloom Cotton", "Natural Plant Dyes", "Zero Synthetic Chemicals", "Artisan Livelihoods", "78% Lower Carbon Emissions"],
      logoUrl: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400",
      website: "https://pajamasutra.com",
      isVerified: true,
    },
  ]).returning();
  console.log(`✓ Created ${brands.length} brands`);

  // Seed artisans
  const artisans = await db.insert(schema.artisans).values([
    {
      id: "artisan-1",
      name: "María Elena Tuyuc",
      country: "Guatemala",
      region: "Santiago Atitlán",
      craft: "Traditional Mayan backstrap weaving",
      bio: "Third-generation weaver specializing in jaspe (ikat) and brocade techniques passed down through her family",
      photoUrl: "https://images.unsplash.com/photo-1580752300992-559f8e0734e0?w=400",
      yearsOfExperience: 25,
    },
    {
      id: "artisan-2",
      name: "Fatima Benali",
      country: "Morocco",
      region: "Fes",
      craft: "Moroccan embroidery and zellij-inspired needlework",
      bio: "Master embroiderer known for intricate geometric patterns inspired by traditional Moroccan tilework",
      photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
      yearsOfExperience: 18,
    },
    {
      id: "artisan-3",
      name: "Kenji Yamamoto",
      country: "Japan",
      region: "Tokushima",
      craft: "Indigo dyeing (Aizome) and shibori resist techniques",
      bio: "Preserving centuries-old Japanese indigo fermentation methods and traditional shibori patterns",
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      yearsOfExperience: 30,
    },
    {
      id: "artisan-4",
      name: "Rajesh Kumar",
      country: "India",
      region: "Jaipur, Rajasthan",
      craft: "Hand block printing and natural dyeing",
      bio: "Master block printer carrying forward Jaipur's Bagru and Sanganeri traditions, carving teakwood blocks by hand and printing with natural indigo and madder root dyes",
      photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
      yearsOfExperience: 22,
    },
  ]).returning();
  console.log(`✓ Created ${artisans.length} artisans`);

  // Seed garments
  const garments = await db.insert(schema.garments).values([
    {
      id: "garment-1",
      brandId: "brand-1",
      artisanId: "artisan-1",
      name: "Huipil de Flores",
      description: "Traditional Guatemalan embroidered blouse featuring intricate floral brocade patterns handwoven on a backstrap loom",
      category: "clothing",
      price: "285.00",
      images: ["https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800"],
      origin: "Guatemala",
      materials: ["Organic cotton", "Natural plant dyes", "Hand-spun thread"],
      techniques: ["Backstrap loom weaving", "Brocade embroidery", "Natural dyeing"],
      isActive: true,
      isVerified: true,
    },
    {
      id: "garment-2",
      brandId: "brand-2",
      artisanId: "artisan-2",
      name: "Kaftan Azul",
      description: "Moroccan silk kaftan with geometric embroidery inspired by traditional zellij tilework from Fes",
      category: "clothing",
      price: "425.00",
      images: ["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800"],
      origin: "Morocco",
      materials: ["Organic silk", "Natural indigo dye", "Metallic thread accents"],
      techniques: ["Hand embroidery", "Geometric pattern work", "Natural dyeing"],
      isActive: true,
      isVerified: true,
    },
    {
      id: "garment-3",
      brandId: "brand-2",
      artisanId: "artisan-3",
      name: "Indigo Tenugui",
      description: "Japanese cotton scarf dyed with traditional indigo fermentation and featuring shibori resist patterns",
      category: "accessories",
      price: "98.00",
      images: ["https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800"],
      origin: "Japan",
      materials: ["Organic cotton", "Natural indigo (sukumo)", "Plant-based mordants"],
      techniques: ["Shibori tie-dye", "Indigo fermentation", "Multiple dip dyeing"],
      isActive: true,
      isVerified: true,
    },
    {
      id: "garment-4",
      brandId: "brand-3",
      artisanId: "artisan-4",
      name: "Lalita Kaftan",
      description: "Hand block printed kaftan with floral motifs in natural indigo and madder root dyes on handloom cotton",
      category: "clothing",
      price: "345.00",
      images: ["/attached_assets/WhatsApp Image 2025-10-09 at 14.54.21_72e0d38a_1760046869475.jpg"],
      origin: "India",
      materials: ["100% Handloom Cotton", "Natural Indigo", "Madder Root"],
      techniques: ["Hand Block Printing", "Natural Dyeing", "Handloom Weaving"],
      isActive: true,
      isVerified: true,
    },
  ]).returning();
  console.log(`✓ Created ${garments.length} garments`);

  // Seed NFC codes
  const nfcCodes = await db.insert(schema.nfcCodes).values([
    { id: "nfc-1", code: "SUB-GT-HDF-001", garmentId: "garment-1", isActive: true },
    { id: "nfc-2", code: "SUB-MA-KAZ-002", garmentId: "garment-2", isActive: true },
    { id: "nfc-3", code: "SUB-JP-ITG-003", garmentId: "garment-3", isActive: true },
    { id: "nfc-4", code: "SUB-IN-LKF-004", garmentId: "garment-4", isActive: true },
  ]).returning();
  console.log(`✓ Created ${nfcCodes.length} NFC codes`);

  // Seed impact metrics
  const impactMetrics = await db.insert(schema.impactMetrics).values([
    {
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
    },
    {
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
    },
    {
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
    },
    {
      id: "impact-4",
      garmentId: "garment-4",
      waterSaved: "1200",
      co2Offset: "15.6",
      artisansSupported: 60,
      supplyChainSteps: [
        { step: 1, title: "Handloom Weaving", location: "Jaipur, Rajasthan", date: "2024-01", description: "100% handloom cotton woven without electricity, reducing carbon emissions by 78%" },
        { step: 2, title: "Natural Dyeing", location: "Bagru, Rajasthan", date: "2024-02", description: "Dyed with natural indigo (Indigofera tinctoria) and madder root (Rubia cordifolia) using mineral mordants" },
        { step: 3, title: "Block Carving", location: "Jaipur, Rajasthan", date: "2024-03", description: "Teakwood blocks hand-carved with floral and geometric motifs" },
        { step: 4, title: "Hand Block Printing", location: "Sanganeri, Rajasthan", date: "2024-04", description: "Artisans press carved blocks rhythmically onto cotton stretched in sunlight" }
      ],
    },
  ]).returning();
  console.log(`✓ Created ${impactMetrics.length} impact metrics`);

  // Seed cultural content
  const culturalContent = await db.insert(schema.culturalContent).values([
    // Garment 1 cultural content
    {
      id: "cultural-1-1",
      garmentId: "garment-1",
      type: "history",
      title: "The Living Tradition of Guatemalan Huipiles",
      content: "Huipiles have been woven by Mayan women for over 2,000 years, serving as living documents of cultural identity, community belonging, and ancestral knowledge. Each region's huipil features distinct patterns and colors that tell stories of local mythology, natural landscapes, and historical events.",
      images: ["https://images.unsplash.com/photo-1609151050-82b4deab0b05?w=800"],
    },
    {
      id: "cultural-1-2",
      garmentId: "garment-1",
      type: "technique",
      title: "Backstrap Loom Weaving",
      content: "The backstrap loom (telar de cintura) allows weavers to create intricate brocade patterns while maintaining portability and intimate connection with their work. Weavers control tension with their bodies, making each piece a physical meditation and embodied knowledge transfer.",
      images: ["https://images.unsplash.com/photo-1577057157926-d34287292bb5?w=800"],
    },
    {
      id: "cultural-1-3",
      garmentId: "garment-1",
      type: "vocabulary",
      title: "Textile Terms in K'iche' Maya",
      content: "Jaspe (ikat dyeing) • Brocade (supplementary weft) • Randa (decorative joining stitch) • Corte (wraparound skirt) • Po't (ceremonial blouse)",
      images: [],
    },
    // Garment 2 cultural content
    {
      id: "cultural-2-1",
      garmentId: "garment-2",
      type: "history",
      title: "Moroccan Kaftans: From Royal Courts to Modern Revival",
      content: "Kaftans originated in ancient Mesopotamia and were adopted by Moroccan royalty in the 12th century. Today, contemporary Moroccan designers are reviving traditional embroidery techniques while creating modern silhouettes that honor ancestral craftsmanship.",
      images: ["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800"],
    },
    {
      id: "cultural-2-2",
      garmentId: "garment-2",
      type: "technique",
      title: "Zellij-Inspired Embroidery",
      content: "This kaftan's geometric patterns are inspired by zellij—the intricate mosaic tilework found in Moroccan architecture. Artisans translate these mathematical patterns into embroidery, creating wearable geometry that connects textile arts with architectural heritage.",
      images: ["https://images.unsplash.com/photo-1591522811280-a8759970b03f?w=800"],
    },
    {
      id: "cultural-2-3",
      garmentId: "garment-2",
      type: "vocabulary",
      title: "Moroccan Craft Vocabulary",
      content: "Zellij (mosaic tilework) • Takchita (formal kaftan with outer layer) • Sfifa (decorative braided trim) • Tarz (traditional embroidery style)",
      images: [],
    },
    // Garment 3 cultural content
    {
      id: "cultural-3-1",
      garmentId: "garment-3",
      type: "history",
      title: "Japan's Indigo Heritage",
      content: "Japanese indigo dyeing (aizome) dates back over 1,000 years to the Nara period. Tokushima became Japan's indigo capital during the Edo period, when its sukumo (fermented indigo) was prized nationwide. Today, only a few artisans maintain the labor-intensive tradition of natural indigo fermentation.",
      images: ["https://images.unsplash.com/photo-1563204424-9a75d57c0c23?w=800"],
    },
    {
      id: "cultural-3-2",
      garmentId: "garment-3",
      type: "technique",
      title: "Shibori Resist Dyeing",
      content: "Shibori encompasses dozens of techniques for creating patterns through binding, stitching, folding, and compressing fabric before dyeing. Each method creates distinct patterns—from the delicate spiderweb of kumo shibori to the precise pleats of arashi (storm) shibori.",
      images: ["https://images.unsplash.com/photo-1560415755-bd80d06eda60?w=800"],
    },
    {
      id: "cultural-3-3",
      garmentId: "garment-3",
      type: "vocabulary",
      title: "Japanese Dyeing Terms",
      content: "Aizome (indigo dyeing) • Sukumo (fermented indigo) • Shibori (resist dyeing) • Tenugui (cotton hand towel) • Arashi (storm pattern)",
      images: [],
    },
    // Garment 4 cultural content (Lalita Kaftan)
    {
      id: "cultural-4-1",
      garmentId: "garment-4",
      type: "history",
      title: "Jaipur's Block Printing Legacy",
      content: "Jaipur, often called the pink city, is a centuries-old hub of textile artistry—where block printing became a language of pattern and rhythm. The Lalita Kaftan draws from the Bagru and Sanganeri traditions, where artisans carve teakwood blocks by hand, dip them in plant dyes, and press them rhythmically onto cotton stretched in sunlight. This slow process, passed through generations, transforms each garment into a living archive of Rajasthan's artistic lineage—where soil, dye, and hand memory intertwine.",
      images: ["https://images.unsplash.com/photo-1609151050-82b4deab0b05?w=800"],
    },
    {
      id: "cultural-4-2",
      garmentId: "garment-4",
      type: "technique",
      title: "Hand Block Printing Symbolism",
      content: "Each motif on the Lalita Kaftan carries deep symbolic meaning rooted in Rajasthani culture. Floral vines represent prosperity and the life force (prana), geometric borders symbolize balance and protection, while natural indigo and madder hues echo the desert's twilight and sunrise. Artisans rhythmically press hand-carved teakwood blocks onto fabric, creating patterns that connect wearers to centuries of artistic tradition.",
      images: ["https://images.unsplash.com/photo-1577057157926-d34287292bb5?w=800"],
    },
    {
      id: "cultural-4-3",
      garmentId: "garment-4",
      type: "vocabulary",
      title: "Rajasthani Textile Vocabulary",
      content: "Bagru (village famous for natural dye block printing) • Sanganeri (floral block printing style from Sanganer) • Buti (small repeated motif) • Jaal (all-over net pattern) • Dabu (mud-resist printing technique)",
      images: [],
    },
  ]).returning();
  console.log(`✓ Created ${culturalContent.length} cultural content items`);

  // Seed care instructions
  const careInstructions = await db.insert(schema.careInstructions).values([
    {
      id: "care-1",
      garmentId: "garment-1",
      washingInstructions: "Hand wash in cold water with pH-neutral soap. Avoid wringing. Lay flat to dry away from direct sunlight.",
      materials: "100% organic cotton with natural plant-based dyes",
      specialCare: "Natural dyes may fade slightly over time, which is part of the garment's living character. Store folded in a cool, dry place.",
      repairGuidance: "Small tears can be mended using traditional darning techniques. Contact us for artisan repair services.",
    },
    {
      id: "care-2",
      garmentId: "garment-2",
      washingInstructions: "Dry clean only or hand wash in cold water with silk-safe detergent. Do not wring. Hang dry in shade.",
      materials: "100% organic silk with natural indigo and metallic thread embroidery",
      specialCare: "Store in breathable garment bag to protect from light and insects. Iron on low heat while slightly damp.",
      repairGuidance: "Embroidery repair requires specialized skills. We offer complimentary artisan repair for the first 5 years.",
    },
    {
      id: "care-3",
      garmentId: "garment-3",
      washingInstructions: "Hand wash in cold water. Indigo may bleed initially—wash separately. Hang dry.",
      materials: "100% organic cotton dyed with natural fermented indigo",
      specialCare: "Indigo develops richer color with wear and washing. Some color transfer is normal and part of the living dye tradition.",
      repairGuidance: "Cotton can be easily mended with basic sewing skills. Indigo re-dyeing services available to refresh color.",
    },
    {
      id: "care-4",
      garmentId: "garment-4",
      washingInstructions: "Hand wash separately in cold water with mild, pH-neutral soap. Do not bleach or soak for long periods. Line dry in shade to preserve plant pigments. Iron on low heat while slightly damp.",
      materials: "100% Handloom Cotton dyed with Natural Indigo (Indigofera tinctoria) and Madder Root (Rubia cordifolia). No synthetic chemicals or fixatives used.",
      specialCare: "Store away from direct sunlight when not in use. Color variations and fading are signs of natural dye's living character—each wash deepens the garment's story. Natural dyes are non-toxic and biodegradable.",
      repairGuidance: "Cotton fabric can be easily mended with basic stitching. For block print restoration or natural dye refresh services, contact Pajama Sutra artisan team.",
    },
  ]).returning();
  console.log(`✓ Created ${careInstructions.length} care instructions`);

  // Seed demo user
  const users = await db.insert(schema.users).values([
    {
      id: "user-1",
      email: "sarah.martinez@example.com",
      name: "Sarah Martinez",
      membershipTier: "gold",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    },
  ]).returning();
  console.log(`✓ Created ${users.length} users`);

  // Seed user stamps
  const userStamps = await db.insert(schema.stamps).values([
    { id: "stamp-1", userId: "user-1", garmentId: "garment-1", nfcCodeId: "nfc-1" },
    { id: "stamp-2", userId: "user-1", garmentId: "garment-2", nfcCodeId: "nfc-2" },
  ]).returning();
  console.log(`✓ Created ${userStamps.length} user stamps`);

  // Seed badges
  const badges = await db.insert(schema.badges).values([
    {
      id: "badge-1",
      name: "First Steps",
      description: "Collected your first ethical fashion stamp",
      iconUrl: "https://images.unsplash.com/photo-1606115915090-be18fea23ec7?w=200",
      requiredStamps: 1,
      rarity: "common",
    },
    {
      id: "badge-2",
      name: "Culture Keeper",
      description: "Collected 5 stamps from different artisan traditions",
      iconUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200",
      requiredStamps: 5,
      rarity: "rare",
    },
    {
      id: "badge-3",
      name: "Global Citizen",
      description: "Collected stamps from 3 different countries",
      iconUrl: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=200",
      requiredCountries: 3,
      rarity: "epic",
    },
  ]).returning();
  console.log(`✓ Created ${badges.length} badges`);

  // Seed user badges
  const userBadges = await db.insert(schema.userBadges).values([
    { id: "user-badge-1", userId: "user-1", badgeId: "badge-1" },
  ]).returning();
  console.log(`✓ Created ${userBadges.length} user badges`);

  console.log("Database seeding complete!");
}

seed()
  .then(() => {
    console.log("Exiting...");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
