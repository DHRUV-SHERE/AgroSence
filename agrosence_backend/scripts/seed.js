"use strict";
// Usage: npm run seed   (connects to MONGO_URI from .env - run only when you intend to write to that database)
const env = require("../src/config/env");
const db = require("../src/config/db");
const Scheme = require("../src/models/Scheme");
const Resource = require("../src/models/Resource");
const { ensureAdmin } = require("../src/services/userService");

const img = (t) => `https://placehold.co/600x400/e8f5e9/2e7d32?text=${encodeURIComponent(t)}`;

const schemes = [
  { name: "PM-KISAN Samman Nidhi", description: "Income support of Rs 6,000 per year to farmer families, paid in three instalments.", eligibility: "Small and marginal landholding farmer families.", benefits: "Rs 6,000 per year directly to bank account.", state: "All States", applyLink: "https://pmkisan.gov.in/" },
  { name: "Pradhan Mantri Fasal Bima Yojana", description: "Crop insurance against non-preventable natural risks.", eligibility: "All farmers growing notified crops.", benefits: "Insurance cover and financial support on crop loss.", state: "All States", applyLink: "https://pmfby.gov.in/" },
  { name: "Kisan Credit Card", description: "Short-term credit for cultivation and allied needs at subsidised interest.", eligibility: "Farmers, tenant farmers, sharecroppers and SHGs.", benefits: "Collateral-free credit with interest subvention.", state: "All States", applyLink: "https://www.myscheme.gov.in/schemes/kcc" },
  { name: "Soil Health Card Scheme", description: "Soil testing and nutrient recommendations for every farm.", eligibility: "All farmers.", benefits: "Free soil health card with crop-wise fertiliser advice.", state: "All States", applyLink: "https://soilhealth.dac.gov.in/" },
  { name: "Gujarat Krushi Vikas Yojana", description: "State support for modern farm equipment and drip irrigation.", eligibility: "Registered farmers of Gujarat.", benefits: "Subsidy on drip/sprinkler systems and farm machinery.", state: "Gujarat", applyLink: "https://ikhedut.gujarat.gov.in/" },
];

const resources = [
  { name: "Urea", description: "Nitrogen fertiliser that promotes leafy green growth.", purpose: "Supply nitrogen to crops", advantages: "High nitrogen content (46%), fast acting, widely available", popularbrand: "IFFCO, NFL, Krishak Bharati", howtouse: "Apply in split doses, 2-3 times during crop growth, followed by irrigation.", image: img("Urea"), link: "https://www.iffco.in/" },
  { name: "DAP", description: "Di-ammonium phosphate, rich in phosphorus and nitrogen.", purpose: "Root development and early growth", advantages: "Boosts root growth and flowering", popularbrand: "IFFCO, Coromandel, Paradeep", howtouse: "Apply as basal dose at sowing, mixed into the soil.", image: img("DAP"), link: "https://www.iffco.in/" },
  { name: "Neem Oil", description: "Organic bio-pesticide extracted from neem seeds.", purpose: "Control sucking pests and fungal diseases", advantages: "Eco-friendly, safe for beneficial insects", popularbrand: "Parry's, Multiplex, Godrej Agrovet", howtouse: "Mix 3-5 ml per litre of water and spray in the evening.", image: img("Neem Oil"), link: "https://www.godrejagrovet.com/" },
  { name: "Drip Irrigation Kit", description: "Water-saving irrigation delivering water at the root zone.", purpose: "Efficient irrigation", advantages: "Saves 40-60% water, reduces weeds, improves yield", popularbrand: "Jain Irrigation, Netafim", howtouse: "Lay laterals along crop rows, connect to filter and pump, run 1-2 hours daily.", image: img("Drip Kit"), link: "https://www.jains.com/" },
];

/** Inserts samples only into empty collections. Returns counts. */
async function seedSamples() {
  const out = { schemes: 0, resources: 0 };
  if ((await Scheme.estimatedDocumentCount()) === 0) out.schemes = (await Scheme.insertMany(schemes)).length;
  if ((await Resource.estimatedDocumentCount()) === 0) out.resources = (await Resource.insertMany(resources)).length;
  return out;
}

async function main() {
  if (!env.mongoUri) throw new Error("MONGO_URI is not set");
  const host = (env.mongoUri.match(/@([^/?]+)/) || [, "local"])[1];
  console.log(`[seed] target database host: ${host}`);
  await db.connectOnce();
  const admin = await ensureAdmin();
  const counts = await seedSamples();
  console.log("[seed] admin created/promoted:", Boolean(admin), "| inserted:", counts);
  await db.disconnect();
}

module.exports = { seedSamples, schemes, resources };
if (require.main === module) {
  main().catch((e) => {
    console.error("[seed] failed:", e.message);
    process.exit(1);
  });
}
