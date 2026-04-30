import { Hono } from "hono";
import { success } from "../lib/response";

const app = new Hono();

const STEPS = [
  {
    stepNumber: 1,
    title: "Browse Competitions",
    description: "Explore our luxury competitions and find a prize that excites you.",
    icon: "Search",
  },
  {
    stepNumber: 2,
    title: "Select Your Tickets",
    description: "Choose how many tickets you'd like — more tickets increase your chances.",
    icon: "Ticket",
  },
  {
    stepNumber: 3,
    title: "Complete Purchase",
    description: "Quick and secure checkout with card, Apple Pay or Google Pay.",
    icon: "CreditCard",
  },
  {
    stepNumber: 4,
    title: "Await the Draw",
    description: "Sit back and watch the countdown. Winners are selected at random.",
    icon: "Clock",
  },
  {
    stepNumber: 5,
    title: "Win & Celebrate",
    description: "Winners are notified by email and prizes dispatched within 14 days.",
    icon: "Trophy",
  },
  {
    stepNumber: 6,
    title: "Refer Friends",
    description: "Share your win and earn free tickets for every friend who enters.",
    icon: "Users",
  },
];

const FEATURES = [
  {
    title: "Verified Random Draws",
    description: "Every winner is selected using certified random number generation.",
    icon: "Shield",
  },
  {
    title: "Real Luxury Prizes",
    description: "Only authentic, high-value prizes from trusted brands and retailers.",
    icon: "Gem",
  },
  {
    title: "Instant Notifications",
    description: "Know immediately when you've won via email and your dashboard.",
    icon: "Bell",
  },
  {
    title: "Track Your Entries",
    description: "See all your tickets, draws, and wins in your personal dashboard.",
    icon: "BarChart",
  },
  {
    title: "Secure Payments",
    description: "Stripe-powered checkout with full fraud protection and encryption.",
    icon: "Lock",
  },
  {
    title: "Dedicated Support",
    description: "Our team is here to help every day during business hours.",
    icon: "Headphones",
  },
];

// GET /api/content/steps
app.get("/steps", async (c) => {
  return success(c, STEPS);
});

// GET /api/content/features
app.get("/features", async (c) => {
  return success(c, FEATURES);
});

export default app;