/**
 * Comprehensive MongoDB Seed Script for Luxero
 * Mirrors the v0 seed data structure (Supabase/Postgres) into MongoDB
 *
 * Usage:
 *   bun run lib/db/seed.ts
 */

import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://luxeroadmin:luxero_secure_pass_2024@localhost:27018/luxero?authSource=admin";

// ============================================
// HELPERS
// ============================================
function randomDate(daysBack = 90) {
  const now = Date.now();
  const ago = daysBack * 24 * 60 * 60 * 1000;
  return new Date(now - Math.random() * ago);
}

// ============================================
// SCHEMAS (mirror of backend models)
// ============================================
const categorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    label: { type: String, required: true },
    iconName: { type: String, required: true, default: "Trophy" },
    description: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const competitionSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    shortDescription: { type: String },
    description: { type: String },
    category: { type: String, index: true },
    status: {
      type: String,
      default: "draft",
      enum: ["draft", "active", "ended", "drawn", "cancelled"],
      index: true,
    },
    prizeTitle: { type: String },
    prizeValue: { type: Number, required: true },
    prizeImageUrl: { type: String },
    ticketPrice: { type: Number, required: true },
    maxTickets: { type: Number, required: true },
    ticketsSold: { type: Number, default: 0 },
    maxTicketsPerUser: { type: Number, default: 100 },
    question: { type: String },
    questionOptions: [{ type: String }],
    correctAnswer: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    drawDate: { type: Date, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    displayOrder: { type: Number, default: 0 },
    isHeroFeatured: { type: Boolean, default: false },
    heroDisplayOrder: { type: Number },
    heroImageUrl: { type: String },
    originalPrice: { type: Number },
    imageUrl: { type: String },
    currency: { type: String, default: "GBP" },
  },
  { timestamps: true }
);

const winnerSchema = new mongoose.Schema(
  {
    competitionId: { type: mongoose.Schema.Types.ObjectId, ref: "Competition" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
    ticketNumber: { type: Number, required: true },
    prizeTitle: { type: String },
    prizeValue: { type: Number },
    prizeImageUrl: { type: String },
    displayName: { type: String },
    location: { type: String },
    testimonial: { type: String },
    winnerPhotoUrl: { type: String },
    showFullName: { type: Boolean, default: false },
    claimed: { type: Boolean, default: false },
    claimedAt: { type: Date },
    drawnAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
const Competition = mongoose.model("Competition", competitionSchema);
const Winner = mongoose.model("Winner", winnerSchema);

// ============================================
// SEED DATA (from v0, adapted for MongoDB)
// ============================================
const categoriesData = [
  {
    slug: "tech-luxury",
    name: "Tech & Luxury",
    label: "Tech & Luxury",
    iconName: "Smartphone",
    description: "Premium electronics and luxury tech gadgets",
    displayOrder: 1,
  },
  {
    slug: "automotive",
    name: "Automotive",
    label: "Automotive",
    iconName: "Car",
    description: "Luxury cars and automotive experiences",
    displayOrder: 2,
  },
  {
    slug: "watches",
    name: "Luxury Watches",
    label: "Luxury Watches",
    iconName: "Watch",
    description: "Premium timepieces from top brands",
    displayOrder: 3,
  },
  {
    slug: "instant-wins",
    name: "Instant Wins",
    label: "Instant Wins",
    iconName: "Zap",
    description: "Win instantly with every ticket purchase",
    displayOrder: 4,
  },
];

const competitionsData = [
  {
    slug: "iphone-18-pro-max-512gb",
    title: "iPhone 18 Pro Max 512GB",
    shortDescription: "The most advanced iPhone ever with A20 chip",
    description: "iPhone 18 Pro Max features the revolutionary A20 Pro chip with 6-core GPU, 48MP camera system with 10x optical zoom, and aerospace-grade titanium frame.",
    category: "tech-luxury",
    status: "active",
    prizeTitle: "iPhone 18 Pro Max 512GB",
    prizeValue: 1999.0,
    prizeImageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80",
    ticketPrice: 3.99,
    maxTickets: 500,
    question: "What color iPhone 18 Pro Max would you prefer?",
    questionOptions: ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"],
    correctAnswer: 2,
    isFeatured: true,
    displayOrder: 1,
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80",
    originalPrice: 2199.0,
  },
  {
    slug: "samsung-galaxy-s26-ultra-1tb",
    title: "Samsung Galaxy S26 Ultra 1TB",
    shortDescription: "Galaxy AI reaches new heights",
    description: "Samsung Galaxy S26 Ultra with 200MP camera, S Pen built in, titanium frame, and Galaxy AI features.",
    category: "tech-luxury",
    status: "active",
    prizeTitle: "Samsung Galaxy S26 Ultra 1TB",
    prizeValue: 1799.0,
    prizeImageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80",
    ticketPrice: 3.49,
    maxTickets: 515,
    question: "What draws you to the Galaxy S26 Ultra?",
    questionOptions: ["200MP Camera", "S Pen", "Galaxy AI", "Titanium Design"],
    correctAnswer: 0,
    isFeatured: true,
    displayOrder: 2,
    imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80",
  },
  {
    slug: "macbook-pro-16-m5-max-2tb",
    title: 'MacBook Pro 16" M5 Max',
    shortDescription: "The most powerful MacBook ever created",
    description: 'MacBook Pro 16-inch with M5 Max chip, 64GB unified memory, and 2TB SSD storage.',
    category: "tech-luxury",
    status: "ended",
    prizeTitle: 'MacBook Pro 16" M5 Max',
    prizeValue: 5499.0,
    prizeImageUrl: "https://images.unsplash.com/photo-1603344797033-f0f4f587ab60?w=800&q=80",
    ticketPrice: 9.99,
    maxTickets: 550,
    question: "What will you use your MacBook Pro for?",
    questionOptions: ["Video Editing", "Software Development", "Music Production", "All of the above"],
    correctAnswer: 3,
    isFeatured: true,
    displayOrder: 3,
    imageUrl: "https://images.unsplash.com/photo-1603344797033-f0f4f587ab60?w=800&q=80",
  },
  {
    slug: "surface-pro-10-elite",
    title: "Microsoft Surface Pro 10 Elite",
    shortDescription: "The ultimate 2-in-1 productivity device",
    description: "Surface Pro 10 Elite with Intel Core Ultra 9 processor, 64GB RAM, 2TB SSD.",
    category: "tech-luxury",
    status: "active",
    prizeTitle: "Surface Pro 10 Elite",
    prizeValue: 3299.0,
    prizeImageUrl: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&q=80",
    ticketPrice: 6.99,
    maxTickets: 472,
    question: "What accessory would you pair with Surface Pro?",
    questionOptions: ["Surface Dial", "Type Cover", "Surface Slim Pen", "All of the above"],
    correctAnswer: 3,
    isFeatured: false,
    displayOrder: 4,
    imageUrl: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&q=80",
  },
  {
    slug: "sony-playstation-6",
    title: "Sony PlayStation 6",
    shortDescription: "Next-gen gaming starts here",
    description: "PlayStation 6 with custom AMD GPU (24 TFLOPS), 32GB GDDR7 RAM, 2TB SSD.",
    category: "tech-luxury",
    status: "drawn",
    prizeTitle: "PlayStation 6",
    prizeValue: 599.0,
    prizeImageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80",
    ticketPrice: 1.99,
    maxTickets: 301,
    question: "What's your favorite PS6 game?",
    questionOptions: ["Spider-Man 3", "God of War Ragnarok", "Gran Turismo 8", "Horizon Forbidden West"],
    correctAnswer: 0,
    isFeatured: true,
    displayOrder: 5,
    imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80",
  },
  {
    slug: "meta-quest-pro-3",
    title: "Meta Quest Pro 3",
    shortDescription: "Immersive mixed reality",
    description: "Meta Quest Pro 3 with 4K+ per eye displays, face/eye/hand tracking.",
    category: "tech-luxury",
    status: "active",
    prizeTitle: "Meta Quest Pro 3",
    prizeValue: 1599.0,
    prizeImageUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80",
    ticketPrice: 3.49,
    maxTickets: 458,
    question: "What VR experience interests you most?",
    questionOptions: ["Gaming", "Productivity", "Social", "Fitness"],
    correctAnswer: 0,
    isFeatured: false,
    displayOrder: 6,
    imageUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80",
  },
  {
    slug: "tesla-model-y-ultra",
    title: "Tesla Model Y Ultra Performance",
    shortDescription: "Electric performance SUV",
    description: "Tesla Model Y Ultra Performance with 0-60 in 2.5 seconds, 450-mile range.",
    category: "automotive",
    status: "active",
    prizeTitle: "Tesla Model Y Ultra Performance",
    prizeValue: 94990.0,
    prizeImageUrl: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80",
    ticketPrice: 49.99,
    maxTickets: 190,
    question: "What Tesla feature excites you most?",
    questionOptions: ["Autopilot", "Acceleration", "Supercharging", "Tech Interior"],
    correctAnswer: 1,
    isFeatured: true,
    displayOrder: 7,
    imageUrl: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80",
  },
  {
    slug: "porsche-911-dakar-hybrid",
    title: "Porsche 911 Dakar Hybrid",
    shortDescription: "Off-road ready sports car",
    description: "Porsche 911 Dakar Hybrid with 3.0L turbo hybrid, 0-62 in 2.8 seconds.",
    category: "automotive",
    status: "ended",
    prizeTitle: "Porsche 911 Dakar Hybrid",
    prizeValue: 149990.0,
    prizeImageUrl: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80",
    ticketPrice: 79.99,
    maxTickets: 187,
    question: "What makes the 911 Dakar special?",
    questionOptions: ["Off-road Capability", "Hybrid Power", "Unique Suspension", "All of the above"],
    correctAnswer: 3,
    isFeatured: true,
    displayOrder: 8,
    imageUrl: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80",
  },
  {
    slug: "apple-watch-ultra-3",
    title: "Apple Watch Ultra 3",
    shortDescription: "The most rugged Apple Watch",
    description: "Apple Watch Ultra 3 with 49mm titanium case, S10 SiP chip, 72-hour battery life.",
    category: "tech-luxury",
    status: "active",
    prizeTitle: "Apple Watch Ultra 3",
    prizeValue: 949.0,
    prizeImageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
    ticketPrice: 2.49,
    maxTickets: 380,
    question: "What activity will you track with your Apple Watch Ultra?",
    questionOptions: ["Running", "Swimming", "Hiking", "All of the above"],
    correctAnswer: 3,
    isFeatured: false,
    displayOrder: 9,
    imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
  },
  {
    slug: "tag-heuer-monaco-chronograph",
    title: "Tag Heuer Monaco Chronograph",
    shortDescription: "Racing heritage timepiece",
    description: "Tag Heuer Monaco Chronograph with 39mm steel case, automatic chronograph movement.",
    category: "watches",
    status: "active",
    prizeTitle: "Tag Heuer Monaco Chronograph",
    prizeValue: 7950.0,
    prizeImageUrl: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80",
    ticketPrice: 14.99,
    maxTickets: 530,
    question: "What dial color appeals to you?",
    questionOptions: ["Blue", "Black", "Grey", "Racing Green"],
    correctAnswer: 0,
    isFeatured: false,
    displayOrder: 10,
    imageUrl: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80",
  },
  {
    slug: "sony-wh-2000xm6",
    title: "Sony WH-2000XM6 Headphones",
    shortDescription: "Industry-leading noise cancellation",
    description: "Sony WH-2000XM6 with 40-hour battery, LDAC codec, spatial audio.",
    category: "tech-luxury",
    status: "drawn",
    prizeTitle: "Sony WH-2000XM6",
    prizeValue: 449.0,
    prizeImageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80",
    ticketPrice: 1.49,
    maxTickets: 300,
    question: "What's your primary use for headphones?",
    questionOptions: ["Music", "Podcasts", "Work Calls", "Gaming"],
    correctAnswer: 0,
    isFeatured: false,
    displayOrder: 11,
    imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80",
  },
  {
    slug: "dyson-ontrac-pro",
    title: "Dyson OnTrac Pro",
    shortDescription: "Premium ANC headphones",
    description: "Dyson OnTrac Pro with 55-hour battery, custom EQ settings, spatial audio.",
    category: "tech-luxury",
    status: "active",
    prizeTitle: "Dyson OnTrac Pro",
    prizeValue: 649.0,
    prizeImageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    ticketPrice: 1.99,
    maxTickets: 326,
    question: "What finish would you choose?",
    questionOptions: ["Ceramic/Copper", "Steel/Blue", "Gold/Rose Gold", "Matte Black"],
    correctAnswer: 0,
    isFeatured: false,
    displayOrder: 12,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
  },
  {
    slug: "dji-air-3s",
    title: "DJI Air 3S Drone",
    shortDescription: "Professional aerial photography",
    description: "DJI Air 3S with 4K/60fps HDR video, 48MP photos, 45-min flight time.",
    category: "tech-luxury",
    status: "active",
    prizeTitle: "DJI Air 3S",
    prizeValue: 1899.0,
    prizeImageUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80",
    ticketPrice: 3.99,
    maxTickets: 476,
    question: "Where will you fly your drone?",
    questionOptions: ["Landscapes", "Real Estate", "Travel", "Racing"],
    correctAnswer: 0,
    isFeatured: false,
    displayOrder: 13,
    imageUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80",
  },
  {
    slug: "nvidia-rtx-6090-ti",
    title: "NVIDIA RTX 6090 Ti Ultimate",
    shortDescription: "Peak PC gaming graphics",
    description: "NVIDIA RTX 6090 Ti with 24GB GDDR7, 4K/8K gaming, AI-powered DLSS 4.0.",
    category: "tech-luxury",
    status: "active",
    prizeTitle: "NVIDIA RTX 6090 Ti Ultimate",
    prizeValue: 2699.0,
    prizeImageUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80",
    ticketPrice: 5.99,
    maxTickets: 450,
    question: "What will you use the RTX 6090 Ti for?",
    questionOptions: ["Gaming", "Video Editing", "AI Work", "3D Rendering"],
    correctAnswer: 0,
    isFeatured: true,
    displayOrder: 14,
    imageUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80",
  },
  {
    slug: "rolex-submariner-gold",
    title: "Rolex Submariner Gold",
    shortDescription: "Iconic dive watch in 18k gold",
    description: "Rolex Submariner Date in 18k yellow gold with black dial, Cerachrom bezel insert.",
    category: "watches",
    status: "active",
    prizeTitle: "Rolex Submariner Gold",
    prizeValue: 24995.0,
    prizeImageUrl: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80",
    ticketPrice: 49.99,
    maxTickets: 500,
    question: "What's your preferred bracelet style?",
    questionOptions: ["Oyster", "Jubilee", "President", "Rubber B"],
    correctAnswer: 0,
    isFeatured: true,
    displayOrder: 15,
    imageUrl: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80",
  },
  // Instant Wins competitions
  {
    slug: "instant-airpods-pro-3",
    title: "AirPods Pro 3 - Instant Win",
    shortDescription: "Win AirPods Pro 3 instantly with every ticket",
    description: "Instant win! AirPods Pro 3 with active noise cancellation, personalised spatial audio, and 6-hour battery life.",
    category: "instant-wins",
    status: "active",
    prizeTitle: "AirPods Pro 3",
    prizeValue: 249.0,
    prizeImageUrl: "https://images.unsplash.com/photo-1606220588913-b3aacb4d46f6?w=800&q=80",
    ticketPrice: 0.99,
    maxTickets: 250,
    question: "Which ear tip size?",
    questionOptions: ["Small", "Medium", "Large", "Mix"],
    correctAnswer: 0,
    isFeatured: false,
    displayOrder: 16,
    imageUrl: "https://images.unsplash.com/photo-1606220588913-b3aacb4d46f6?w=800&q=80",
  },
  {
    slug: "instant-ps5-voucher",
    title: "£50 PS5 Store Voucher - Instant Win",
    shortDescription: "Win a PS5 store credit voucher instantly",
    description: "Instant win! £50 PS5 Store voucher. Use it on games, add-ons, or subscriptions.",
    category: "instant-wins",
    status: "active",
    prizeTitle: "£50 PS5 Store Voucher",
    prizeValue: 50.0,
    prizeImageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80",
    ticketPrice: 0.99,
    maxTickets: 500,
    question: "What's your favourite genre?",
    questionOptions: ["Action", "RPG", "Sports", "Indie"],
    correctAnswer: 0,
    isFeatured: false,
    displayOrder: 17,
    imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80",
  },
  {
    slug: "instant-amazon-gift-25",
    title: "£25 Amazon Gift Card - Instant Win",
    shortDescription: "Win an Amazon gift card instantly",
    description: "Instant win! £25 Amazon gift card. Use on anything from electronics to everyday essentials.",
    category: "instant-wins",
    status: "active",
    prizeTitle: "£25 Amazon Gift Card",
    prizeValue: 25.0,
    prizeImageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    ticketPrice: 0.99,
    maxTickets: 300,
    question: "Favourite shopping category?",
    questionOptions: ["Electronics", "Books", "Home", "Fashion"],
    correctAnswer: 0,
    isFeatured: false,
    displayOrder: 18,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
  },
  {
    slug: "instant-steam-credit",
    title: "£10 Steam Credit - Instant Win",
    shortDescription: "Win Steam wallet credit instantly",
    description: "Instant win! £10 Steam wallet credit. Get games, DLC, or in-game purchases.",
    category: "instant-wins",
    status: "active",
    prizeTitle: "£10 Steam Credit",
    prizeValue: 10.0,
    prizeImageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80",
    ticketPrice: 0.99,
    maxTickets: 400,
    question: "Favourite game type?",
    questionOptions: ["Multiplayer", "Single Player", "Indie", "VR"],
    correctAnswer: 0,
    isFeatured: false,
    displayOrder: 19,
    imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80",
  },
];

const winnersData = [
  {
    displayName: "James M.",
    location: "London",
    prizeTitle: 'MacBook Pro 16" M5 Max',
    prizeValue: 5499.0,
    prizeImageUrl: "https://images.unsplash.com/photo-1603344797033-f0f4f587ab60?w=800&q=80",
    testimonial: "I can't believe I won the MacBook Pro! The whole experience was amazing. Thank you Luxero!",
    winnerPhotoUrl: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    displayName: "Sarah K.",
    location: "Manchester",
    prizeTitle: "PlayStation 6",
    prizeValue: 599.0,
    prizeImageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80",
    testimonial: "Been playing every week for months and finally won! The transparency about odds is what kept me coming back.",
    winnerPhotoUrl: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    displayName: "Alex P.",
    location: "Birmingham",
    prizeTitle: "Sony WH-2000XM6",
    prizeValue: 449.0,
    prizeImageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80",
    testimonial: "The instant win feature is fantastic! Got AirPods on my first purchase. Couldn't be happier!",
    winnerPhotoUrl: "https://randomuser.me/api/portraits/men/22.jpg",
  },
];

// ============================================
// SEED FUNCTIONS
// ============================================
async function clearDatabase() {
  console.log("🗑️ Clearing existing data...");
  await Category.deleteMany({});
  await Competition.deleteMany({});
  await Winner.deleteMany({});
  console.log("  All collections cleared.\n");
}

async function seedCategories() {
  console.log("📂 Seeding categories...");
  for (const cat of categoriesData) {
    await Category.updateOne({ slug: cat.slug }, { $set: cat }, { upsert: true });
    console.log(`  ✓ ${cat.slug}`);
  }
}

async function seedCompetitions() {
  console.log("🏆 Seeding competitions...");
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const compIds: string[] = [];

  for (let i = 0; i < competitionsData.length; i++) {
    const comp = competitionsData[i];
    const position = i / competitionsData.length;
    const daysAgo = Math.floor(90 * (1 - position));
    const startDate = new Date(now - daysAgo * dayMs);
    const duration = 14 + Math.floor(Math.random() * 14);
    const endDate = new Date(startDate.getTime() + duration * dayMs);
    const drawDate = new Date(endDate.getTime() + 1 * dayMs);
    const ticketsSold = Math.floor(Math.random() * (comp.maxTickets * 0.85));

    const doc = await Competition.findOneAndUpdate(
      { slug: comp.slug },
      { $set: { ...comp, startDate, endDate, drawDate, ticketsSold } },
      { upsert: true, new: true }
    );
    if (doc) {
      compIds.push(doc._id.toString());
      console.log(`  ✓ ${comp.title} (${comp.status}, ${ticketsSold}/${comp.maxTickets} sold)`);
    }
  }
  return compIds;
}

async function seedWinners(compIds: string[]) {
  console.log("🏅 Seeding winners...");
  const drawnComps = competitionsData
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => c.status === "drawn" || c.status === "ended");

  let count = 0;
  for (let w = 0; w < winnersData.length; w++) {
    const winner = winnersData[w];
    const compIdx = drawnComps[w % drawnComps.length]?.i ?? 0;
    const compId = compIds[compIdx];
    const comp = competitionsData[compIdx];
    if (!compId || !comp) continue;
    const ticketNum = 1 + Math.floor(Math.random() * comp.maxTickets);
    await Winner.updateOne(
      { competitionId: compId },
      {
        $set: {
          competitionId: compId,
          ticketNumber: ticketNum,
          prizeTitle: winner.prizeTitle,
          prizeValue: winner.prizeValue,
          prizeImageUrl: winner.prizeImageUrl,
          displayName: winner.displayName,
          location: winner.location,
          testimonial: winner.testimonial,
          winnerPhotoUrl: winner.winnerPhotoUrl,
          showFullName: false,
          claimed: true,
          claimedAt: new Date(),
          drawnAt: randomDate(60),
        },
      },
      { upsert: true }
    );
    count++;
  }
  console.log(`  ✓ ${count} winners`);
}

// ============================================
// MAIN
// ============================================
async function seed() {
  console.log("\n🌱 Starting MongoDB seed...\n");
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");
    await clearDatabase();
    await seedCategories();
    const compIds = await seedCompetitions();
    await seedWinners(compIds);
    console.log("\n✅ Seed completed successfully!");
    console.log(`   ${categoriesData.length} categories`);
    console.log(`   ${competitionsData.length} competitions`);
    console.log("   " + String(winnersData.length) + " winners");
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();