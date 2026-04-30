/**
 * Database Seed Script for MongoDB Backend
 * Migrates competition, category, and promo code data from v0-luxero-win
 *
 * Usage:
 *   cd apps/api
 *   bun run seed.ts
 *
 * Prerequisites:
 *   MongoDB must be running (see docker-compose.yml)
 *   Copy .env.example to .env and set MONGODB_URI
 */

import mongoose from "mongoose";
import { Competition } from "./src/models/Competition";
import { Category } from "./src/models/Category";
import { PromoCode } from "./src/models/PromoCode";
import { User } from "./src/models/User";
import bcrypt from "bcryptjs";

// ============================================
// COMPETITIONS DATA (from v0-luxero-win)
// ============================================
const competitionsData = [
  {
    slug: "iphone-18-pro-max-512gb",
    title: "iPhone 18 Pro Max 512GB",
    shortDescription: "The most advanced iPhone ever with A20 chip",
    description: "iPhone 18 Pro Max features the revolutionary A20 Pro chip with 6-core GPU, 48MP camera system with 10x optical zoom, and aerospace-grade titanium frame. Includes 512GB storage.",
    category: "tech-luxury",
    status: "active",
    prizeTitle: "iPhone 18 Pro Max 512GB",
    prizeValue: 1999,
    prizeImageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80",
    ticketPrice: 3.99,
    maxTickets: 500,
    ticketsSold: 342,
    question: "What color iPhone 18 Pro Max would you prefer?",
    questionOptions: ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"],
    correctAnswer: 2,
    isFeatured: true,
    displayOrder: 1,
    isHeroFeatured: true,
    heroDisplayOrder: 1,
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80",
    originalPrice: 2199,
    drawDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    currency: "GBP",
    isReferralReward: false,
  },
  {
    slug: "samsung-galaxy-s26-ultra-1tb",
    title: "Samsung Galaxy S26 Ultra 1TB",
    shortDescription: "Galaxy AI reaches new heights",
    description: "Samsung Galaxy S26 Ultra with 200MP camera, S Pen built in, titanium frame, and Galaxy AI features. 1TB storage.",
    category: "tech-luxury",
    status: "active",
    prizeTitle: "Samsung Galaxy S26 Ultra 1TB",
    prizeValue: 1799,
    prizeImageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80",
    ticketPrice: 3.49,
    maxTickets: 515,
    ticketsSold: 287,
    question: "What draws you to the Galaxy S26 Ultra?",
    questionOptions: ["200MP Camera", "S Pen", "Galaxy AI", "Titanium Design"],
    correctAnswer: 0,
    isFeatured: true,
    displayOrder: 2,
    isHeroFeatured: true,
    heroDisplayOrder: 2,
    imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80",
    originalPrice: 1999,
    drawDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    currency: "GBP",
    isReferralReward: false,
  },
  {
    slug: "macbook-pro-16-m5-max-2tb",
    title: 'MacBook Pro 16" M5 Max',
    shortDescription: "The most powerful MacBook ever created",
    description: 'MacBook Pro 16-inch with M5 Max chip, 64GB unified memory, and 2TB SSD storage. Liquid Retina XDR display with ProMotion.',
    category: "tech-luxury",
    status: "ended",
    prizeTitle: 'MacBook Pro 16" M5 Max',
    prizeValue: 5499,
    prizeImageUrl: "https://images.unsplash.com/photo-1603344797033-f0f4f587ab60?w=800&q=80",
    ticketPrice: 9.99,
    maxTickets: 550,
    ticketsSold: 550,
    question: "What will you use your MacBook Pro for?",
    questionOptions: ["Video Editing", "Software Development", "Music Production", "All of the above"],
    correctAnswer: 3,
    isFeatured: true,
    displayOrder: 3,
    isHeroFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1603344797033-f0f4f587ab60?w=800&q=80",
    originalPrice: 5999,
    drawDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    currency: "GBP",
    isReferralReward: false,
  },
  {
    slug: "surface-pro-10-elite",
    title: "Microsoft Surface Pro 10 Elite",
    shortDescription: "The ultimate 2-in-1 productivity device",
    description: "Surface Pro 10 Elite with Intel Core Ultra 9 processor, 64GB RAM, 2TB SSD, 13\" PixelSense Flow display.",
    category: "tech-luxury",
    status: "active",
    prizeTitle: "Surface Pro 10 Elite",
    prizeValue: 3299,
    prizeImageUrl: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&q=80",
    ticketPrice: 6.99,
    maxTickets: 472,
    ticketsSold: 198,
    question: "What accessory would you pair with Surface Pro?",
    questionOptions: ["Surface Dial", "Type Cover", "Surface Slim Pen", "All of the above"],
    correctAnswer: 3,
    isFeatured: false,
    displayOrder: 4,
    isHeroFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&q=80",
    originalPrice: 3599,
    drawDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    currency: "GBP",
    isReferralReward: false,
  },
  {
    slug: "sony-playstation-6",
    title: "Sony PlayStation 6",
    shortDescription: "Next-gen gaming starts here",
    description: "PlayStation 6 with custom AMD GPU (24 TFLOPS), 32GB GDDR7 RAM, 2TB SSD, 8K gaming support.",
    category: "tech-luxury",
    status: "drawn",
    prizeTitle: "PlayStation 6",
    prizeValue: 599,
    prizeImageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80",
    ticketPrice: 1.99,
    maxTickets: 301,
    ticketsSold: 301,
    question: "What's your favorite PS6 game?",
    questionOptions: ["Spider-Man 3", "God of War Ragnarok", "Gran Turismo 8", "Horizon Forbidden West"],
    correctAnswer: 0,
    isFeatured: true,
    displayOrder: 5,
    isHeroFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80",
    originalPrice: 699,
    drawDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    currency: "GBP",
    isReferralReward: false,
  },
  {
    slug: "meta-quest-pro-3",
    title: "Meta Quest Pro 3",
    shortDescription: "Immersive mixed reality",
    description: "Meta Quest Pro 3 with 4K+ per eye displays, face/eye/hand tracking, mixed reality passthrough.",
    category: "tech-luxury",
    status: "active",
    prizeTitle: "Meta Quest Pro 3",
    prizeValue: 1599,
    prizeImageUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80",
    ticketPrice: 3.49,
    maxTickets: 458,
    ticketsSold: 156,
    question: "What VR experience interests you most?",
    questionOptions: ["Gaming", "Productivity", "Social", "Fitness"],
    correctAnswer: 0,
    isFeatured: false,
    displayOrder: 6,
    isHeroFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80",
    originalPrice: 1799,
    drawDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    currency: "GBP",
    isReferralReward: false,
  },
  {
    slug: "tesla-model-y-ultra",
    title: "Tesla Model Y Ultra Performance",
    shortDescription: "Electric performance SUV",
    description: "Tesla Model Y Ultra Performance with 0-60 in 2.5 seconds, 450-mile range, Tesla FSD hardware.",
    category: "automotive",
    status: "active",
    prizeTitle: "Tesla Model Y Ultra Performance",
    prizeValue: 94990,
    prizeImageUrl: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80",
    ticketPrice: 49.99,
    maxTickets: 190,
    ticketsSold: 87,
    question: "What Tesla feature excites you most?",
    questionOptions: ["Autopilot", "Acceleration", "Supercharging", "Tech Interior"],
    correctAnswer: 1,
    isFeatured: true,
    displayOrder: 7,
    isHeroFeatured: true,
    heroDisplayOrder: 3,
    imageUrl: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80",
    originalPrice: 99990,
    drawDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    currency: "GBP",
    isReferralReward: false,
  },
  {
    slug: "porsche-911-dakar-hybrid",
    title: "Porsche 911 Dakar Hybrid",
    shortDescription: "Off-road ready sports car",
    description: "Porsche 911 Dakar Hybrid with 3.0L turbo hybrid, 0-62 in 2.8 seconds, 300+ mile range.",
    category: "automotive",
    status: "ended",
    prizeTitle: "Porsche 911 Dakar Hybrid",
    prizeValue: 149990,
    prizeImageUrl: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80",
    ticketPrice: 79.99,
    maxTickets: 187,
    ticketsSold: 187,
    question: "What makes the 911 Dakar special?",
    questionOptions: ["Off-road Capability", "Hybrid Power", "Unique Suspension", "All of the above"],
    correctAnswer: 3,
    isFeatured: true,
    displayOrder: 8,
    isHeroFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80",
    originalPrice: 159990,
    drawDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    currency: "GBP",
    isReferralReward: false,
  },
  {
    slug: "apple-watch-ultra-3",
    title: "Apple Watch Ultra 3",
    shortDescription: "The most rugged Apple Watch",
    description: "Apple Watch Ultra 3 with 49mm titanium case, S10 SiP chip, 72-hour battery life.",
    category: "tech-luxury",
    status: "active",
    prizeTitle: "Apple Watch Ultra 3",
    prizeValue: 949,
    prizeImageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
    ticketPrice: 2.49,
    maxTickets: 380,
    ticketsSold: 203,
    question: "What activity will you track with your Apple Watch Ultra?",
    questionOptions: ["Running", "Swimming", "Hiking", "All of the above"],
    correctAnswer: 3,
    isFeatured: false,
    displayOrder: 9,
    isHeroFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80",
    originalPrice: 1099,
    drawDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    currency: "GBP",
    isReferralReward: false,
  },
  {
    slug: "tag-heuer-monaco-chronograph",
    title: "Tag Heuer Monaco Chronograph",
    shortDescription: "Racing heritage timepiece",
    description: "Tag Heuer Monaco Chronograph with 39mm steel case, automatic chronograph movement.",
    category: "watches",
    status: "active",
    prizeTitle: "Tag Heuer Monaco Chronograph",
    prizeValue: 7950,
    prizeImageUrl: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80",
    ticketPrice: 14.99,
    maxTickets: 530,
    ticketsSold: 178,
    question: "What dial color appeals to you?",
    questionOptions: ["Blue", "Black", "Grey", "Racing Green"],
    correctAnswer: 0,
    isFeatured: false,
    displayOrder: 10,
    isHeroFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80",
    originalPrice: 8950,
    drawDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    currency: "GBP",
    isReferralReward: false,
  },
  {
    slug: "sony-wh-2000xm6",
    title: "Sony WH-2000XM6 Headphones",
    shortDescription: "Industry-leading noise cancellation",
    description: "Sony WH-2000XM6 with 40-hour battery, LDAC codec, spatial audio.",
    category: "tech-luxury",
    status: "drawn",
    prizeTitle: "Sony WH-2000XM6",
    prizeValue: 449,
    prizeImageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80",
    ticketPrice: 1.49,
    maxTickets: 300,
    ticketsSold: 300,
    question: "What's your primary use for headphones?",
    questionOptions: ["Music", "Podcasts", "Work Calls", "Gaming"],
    correctAnswer: 0,
    isFeatured: false,
    displayOrder: 11,
    isHeroFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80",
    originalPrice: 499,
    drawDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    currency: "GBP",
    isReferralReward: false,
  },
  {
    slug: "dyson-ontrac-pro",
    title: "Dyson OnTrac Pro",
    shortDescription: "Premium ANC headphones",
    description: "Dyson OnTrac Pro with 55-hour battery, custom EQ settings, spatial audio.",
    category: "tech-luxury",
    status: "active",
    prizeTitle: "Dyson OnTrac Pro",
    prizeValue: 649,
    prizeImageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    ticketPrice: 1.99,
    maxTickets: 326,
    ticketsSold: 89,
    question: "What finish would you choose?",
    questionOptions: ["Ceramic/Copper", "Steel/Blue", "Gold/Rose Gold", "Matte Black"],
    correctAnswer: 0,
    isFeatured: false,
    displayOrder: 12,
    isHeroFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    originalPrice: 749,
    drawDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    currency: "GBP",
    isReferralReward: false,
  },
  {
    slug: "dji-air-3s",
    title: "DJI Air 3S Drone",
    shortDescription: "Professional aerial photography",
    description: "DJI Air 3S with 4K/60fps HDR video, 48MP photos, 45-min flight time.",
    category: "tech-luxury",
    status: "active",
    prizeTitle: "DJI Air 3S",
    prizeValue: 1899,
    prizeImageUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80",
    ticketPrice: 3.99,
    maxTickets: 476,
    ticketsSold: 234,
    question: "Where will you fly your drone?",
    questionOptions: ["Landscapes", "Real Estate", "Travel", "Racing"],
    correctAnswer: 0,
    isFeatured: false,
    displayOrder: 13,
    isHeroFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80",
    originalPrice: 2099,
    drawDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
    currency: "GBP",
    isReferralReward: false,
  },
  {
    slug: "nvidia-rtx-6090-ti",
    title: "NVIDIA RTX 6090 Ti Ultimate",
    shortDescription: "Peak PC gaming graphics",
    description: "NVIDIA RTX 6090 Ti with 24GB GDDR7, 4K/8K gaming, AI-powered DLSS 4.0.",
    category: "tech-luxury",
    status: "active",
    prizeTitle: "NVIDIA RTX 6090 Ti Ultimate",
    prizeValue: 2699,
    prizeImageUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80",
    ticketPrice: 5.99,
    maxTickets: 450,
    ticketsSold: 312,
    question: "What will you use the RTX 6090 Ti for?",
    questionOptions: ["Gaming", "Video Editing", "AI Work", "3D Rendering"],
    correctAnswer: 0,
    isFeatured: true,
    displayOrder: 14,
    isHeroFeatured: false,
    imageUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80",
    originalPrice: 2999,
    drawDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    currency: "GBP",
    isReferralReward: false,
  },
  {
    slug: "rolex-submariner-gold",
    title: "Rolex Submariner Gold",
    shortDescription: "Iconic dive watch in 18k gold",
    description: "Rolex Submariner Date in 18k yellow gold with black dial, Cerachrom bezel insert, and 41mm case.",
    category: "watches",
    status: "active",
    prizeTitle: "Rolex Submariner Gold",
    prizeValue: 24995,
    prizeImageUrl: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80",
    ticketPrice: 49.99,
    maxTickets: 500,
    ticketsSold: 423,
    question: "What's your preferred bracelet style?",
    questionOptions: ["Oyster", "Jubilee", "President", "Rubber B"],
    correctAnswer: 0,
    isFeatured: true,
    displayOrder: 15,
    isHeroFeatured: true,
    heroDisplayOrder: 4,
    imageUrl: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80",
    originalPrice: 27995,
    drawDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    currency: "GBP",
    isReferralReward: false,
  },
];

// ============================================
// CATEGORIES DATA (from v0-luxero-win)
// ============================================
const categoriesData = [
  {
    slug: "tech-luxury",
    name: "Tech & Luxury",
    description: "Premium electronics and luxury tech gadgets",
    isActive: true,
    displayOrder: 1,
  },
  {
    slug: "automotive",
    name: "Automotive",
    description: "Luxury cars and automotive experiences",
    isActive: true,
    displayOrder: 2,
  },
  {
    slug: "watches",
    name: "Luxury Watches",
    description: "Premium timepieces from top brands",
    isActive: true,
    displayOrder: 3,
  },
  {
    slug: "instant-wins",
    name: "Instant Wins",
    description: "Win instantly with every ticket purchase",
    isActive: true,
    displayOrder: 4,
  },
];

// ============================================
// PROMO CODES DATA (from v0-luxero-win)
// ============================================
const promoCodesData = [
  {
    code: "WELCOME10",
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 20,
    maxUses: 200,
    currentUses: 45,
    maxUsesPerUser: 2,
    isActive: true,
    validFrom: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    code: "LUXERO20",
    discountType: "percentage",
    discountValue: 20,
    minOrderValue: 50,
    maxUses: 100,
    currentUses: 23,
    maxUsesPerUser: 1,
    isActive: true,
    validFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  },
  {
    code: "FIVER",
    discountType: "fixed",
    discountValue: 5,
    minOrderValue: 25,
    maxUses: 150,
    currentUses: 67,
    maxUsesPerUser: 3,
    isActive: true,
    validFrom: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
  },
  {
    code: "VIP50",
    discountType: "percentage",
    discountValue: 25,
    minOrderValue: 100,
    maxUses: 50,
    currentUses: 12,
    maxUsesPerUser: 1,
    isActive: true,
    validFrom: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    validUntil: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
  },
  {
    code: "NEWUSER",
    discountType: "percentage",
    discountValue: 15,
    minOrderValue: 30,
    maxUses: 500,
    currentUses: 189,
    maxUsesPerUser: 1,
    isActive: true,
    validFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    validUntil: null,
  },
];

// ============================================
// DEMO USERS (admin + test users)
// ============================================
const demoUsers = [
  { email: "admin@luxero.win", password: "Admin123!", isAdmin: true, isVerified: true, fullName: "Admin User" },
  { email: "demo@luxero.win", password: "Demo1234", isAdmin: false, isVerified: true, fullName: "Demo User" },
];

// ============================================
// CLEAR DATABASE
// ============================================
async function clearDatabase() {
  console.log("🗑️  Clearing existing data...");
  await Promise.all([
    Competition.deleteMany({}),
    Category.deleteMany({}),
    PromoCode.deleteMany({}),
    User.deleteMany({}),
  ]);
  console.log("  ✓ All collections cleared\n");
}

// ============================================
// SEED
// ============================================
async function seed() {
  try {
    console.log("🌱 Starting database seed...\n");

    const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/luxero";
    await mongoose.connect(MONGODB_URI);
    await clearDatabase();

    // Categories
    console.log("📂 Seeding categories...");
    for (const cat of categoriesData) {
      await Category.create(cat);
      console.log(`  ✓ ${cat.slug}`);
    }

    // Competitions
    console.log("\n🏆 Seeding competitions...");
    for (const comp of competitionsData) {
      await Competition.create(comp);
      console.log(`  ✓ ${comp.slug}`);
    }

    // Promo Codes
    console.log("\n🏷️  Seeding promo codes...");
    for (const promo of promoCodesData) {
      await PromoCode.create(promo);
      console.log(`  ✓ ${promo.code}`);
    }

    // Demo Users
    console.log("\n👤 Seeding demo users...");
    for (const user of demoUsers) {
      const hash = await bcrypt.hash(user.password, 12);
      await User.create({
        email: user.email,
        passwordHash: hash,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
      });
      console.log(`  ✓ ${user.email}`);
    }

    console.log("\n✅ Seed complete!");
    console.log(`
Summary:
  • ${categoriesData.length} categories
  • ${competitionsData.length} competitions
  • ${promoCodesData.length} promo codes
  • ${demoUsers.length} users

Demo accounts:
  • admin@luxero.win / Admin123! (admin)
  • demo@luxero.win / Demo1234 (user)
    `);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

seed();