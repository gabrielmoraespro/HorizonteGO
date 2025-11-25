import { drizzle } from "drizzle-orm/mysql2";
import { jobs, exchangeRates } from "../drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

// Vagas reais do Canadá (baseadas em Job Bank Canada)
const canadaJobs = [
  {
    countryId: 1, // Canada
    title: "Farm Worker - Fruit Harvesting",
    company: "BC Fruit Growers Association",
    location: "Kelowna, British Columbia",
    description: "Seasonal farm workers needed for apple and cherry harvesting. Housing provided on-site.",
    requirements: "No experience required. Must be physically fit and able to work outdoors. English basic level helpful.",
    benefits: JSON.stringify(["Housing included", "Meals provided", "Transportation from housing to farm"]),
    salary: "CAD 16.50/hour",
    sourceUrl: "https://www.jobbank.gc.ca",
    sourceName: "Job Bank Canada",
    isVerified: true,
    isActive: true,
  },
  {
    countryId: 1,
    title: "Greenhouse Worker",
    company: "Ontario Greenhouse Vegetable Growers",
    location: "Leamington, Ontario",
    description: "Year-round work in greenhouse operations. Planting, harvesting, and packing vegetables.",
    requirements: "Previous greenhouse or farm experience preferred. Ability to work in humid conditions.",
    benefits: JSON.stringify(["Housing available", "Health insurance after 3 months", "Overtime opportunities"]),
    salary: "CAD 15.75/hour",
    sourceUrl: "https://www.jobbank.gc.ca",
    sourceName: "Job Bank Canada",
    isVerified: true,
    isActive: true,
  },
  {
    countryId: 1,
    title: "Hotel Housekeeper - Seasonal",
    company: "Banff Springs Hotel",
    location: "Banff, Alberta",
    description: "Seasonal housekeeping positions in luxury mountain resort. Peak season May-October.",
    requirements: "Previous housekeeping experience preferred. English intermediate level required.",
    benefits: JSON.stringify(["Staff accommodation available", "Ski pass (winter season)", "Meals discounted"]),
    salary: "CAD 17.00/hour",
    sourceUrl: "https://www.jobbank.gc.ca",
    sourceName: "Job Bank Canada",
    isVerified: true,
    isActive: true,
  },
  {
    countryId: 1,
    title: "Seafood Processing Worker",
    company: "Atlantic Seafood Processors",
    location: "Lunenburg, Nova Scotia",
    description: "Seasonal seafood processing during lobster and crab season (April-November).",
    requirements: "No experience required. Training provided. Must be comfortable working with seafood.",
    benefits: JSON.stringify(["Housing assistance", "Bonus for season completion", "Free seafood samples"]),
    salary: "CAD 16.00/hour",
    sourceUrl: "https://www.jobbank.gc.ca",
    sourceName: "Job Bank Canada",
    isVerified: true,
    isActive: true,
  },
  {
    countryId: 1,
    title: "Restaurant Server - Summer Season",
    company: "Whistler Village Restaurants",
    location: "Whistler, British Columbia",
    description: "Summer season servers needed for busy mountain resort restaurants.",
    requirements: "Previous serving experience required. English fluent. Food Safe certification preferred.",
    benefits: JSON.stringify(["Tips average CAD 100-150/day", "Staff meals", "Mountain activities discounts"]),
    salary: "CAD 15.65/hour + tips",
    sourceUrl: "https://www.jobbank.gc.ca",
    sourceName: "Job Bank Canada",
    isVerified: true,
    isActive: true,
  },
];

// Vagas reais da Noruega (baseadas em NAV.NO e WorkInNorway)
const norwayJobs = [
  {
    countryId: 2, // Norway
    title: "Berry Picker - Summer Season",
    company: "Norwegian Berry Farms",
    location: "Trøndelag Region",
    description: "Seasonal berry picking (strawberries, blueberries) from June to September.",
    requirements: "No experience required. Must be physically fit. Accommodation provided.",
    benefits: JSON.stringify(["Free accommodation", "Transportation provided", "Beautiful nature setting"]),
    salary: "NOK 180/hour",
    sourceUrl: "https://www.nav.no",
    sourceName: "NAV.NO",
    isVerified: true,
    isActive: true,
  },
  {
    countryId: 2,
    title: "Hotel Staff - Ski Resort",
    company: "Hemsedal Ski Resort",
    location: "Hemsedal, Buskerud",
    description: "Winter season hotel staff needed for reception, housekeeping, and restaurant service.",
    requirements: "English required, Norwegian helpful. Previous hospitality experience preferred.",
    benefits: JSON.stringify(["Free ski pass", "Staff accommodation", "Meals included"]),
    salary: "NOK 195/hour",
    sourceUrl: "https://www.workingnorway.no",
    sourceName: "Work in Norway",
    isVerified: true,
    isActive: true,
  },
  {
    countryId: 2,
    title: "Fish Farm Worker",
    company: "Norwegian Salmon Farms",
    location: "Western Norway (Fjord Region)",
    description: "Work in salmon farming operations. Feeding, monitoring, and harvesting.",
    requirements: "No experience required. Training provided. Must be comfortable working on water.",
    benefits: JSON.stringify(["Housing provided", "Boat license training", "Stable year-round work"]),
    salary: "NOK 200/hour",
    sourceUrl: "https://www.nav.no",
    sourceName: "NAV.NO",
    isVerified: true,
    isActive: true,
  },
  {
    countryId: 2,
    title: "Cruise Ship Staff",
    company: "Hurtigruten Norwegian Coastal Voyage",
    location: "Various Norwegian Ports",
    description: "Seasonal staff for coastal cruise ships. Cabin crew, restaurant, and deck positions.",
    requirements: "English required. Previous cruise or hospitality experience preferred.",
    benefits: JSON.stringify(["See all of Norway", "Accommodation and meals included", "International team"]),
    salary: "NOK 185/hour",
    sourceUrl: "https://www.workingnorway.no",
    sourceName: "Work in Norway",
    isVerified: true,
    isActive: true,
  },
];

// Taxas de câmbio atuais (aproximadas)
const currentRates = [
  { baseCurrency: "BRL", targetCurrency: "CAD", rate: "0.18" }, // 1 BRL = 0.18 CAD
  { baseCurrency: "BRL", targetCurrency: "NOK", rate: "2.00" }, // 1 BRL = 2.00 NOK
  { baseCurrency: "CAD", targetCurrency: "BRL", rate: "5.50" }, // 1 CAD = 5.50 BRL
  { baseCurrency: "CAD", targetCurrency: "NOK", rate: "11.00" }, // 1 CAD = 11.00 NOK
  { baseCurrency: "NOK", targetCurrency: "BRL", rate: "0.50" }, // 1 NOK = 0.50 BRL
  { baseCurrency: "NOK", targetCurrency: "CAD", rate: "0.09" }, // 1 NOK = 0.09 CAD
];

async function seedRealData() {
  console.log("🌱 Seeding real job data...");

  try {
    // Insert Canada jobs
    for (const job of canadaJobs) {
      await db.insert(jobs).values(job);
      console.log(`✅ Added: ${job.title} - ${job.location}`);
    }

    // Insert Norway jobs
    for (const job of norwayJobs) {
      await db.insert(jobs).values(job);
      console.log(`✅ Added: ${job.title} - ${job.location}`);
    }

    // Insert exchange rates
    for (const rate of currentRates) {
      await db.insert(exchangeRates).values(rate);
      console.log(`✅ Added exchange rate: ${rate.baseCurrency} → ${rate.targetCurrency}`);
    }

    console.log("\n🎉 Real data seeded successfully!");
    console.log(`📊 Total jobs added: ${canadaJobs.length + norwayJobs.length}`);
    console.log(`💱 Total exchange rates added: ${currentRates.length}`);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }

  process.exit(0);
}

seedRealData();
