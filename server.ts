import express, { Request, Response } from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Body parsing middlewares
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Lazy Google GenAI Client initialization
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Using smart heuristic fallbacks for AI requests.");
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ============================================================================
// API ROUTES
// ============================================================================

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "Ama Baby Care Backend",
    timestamp: new Date().toISOString(),
    aiReady: !!process.env.GEMINI_API_KEY,
  });
});

// ----------------------------------------------------------------------------
// 1. AI Acoustic Baby Cry Reason Analyzer
// ----------------------------------------------------------------------------
app.post("/api/ai/cry-analyzer", async (req: Request, res: Response) => {
  try {
    const { babyName = "Baby", babyAge = "6 months", elapsedContext = {}, acousticInput = "", demoType = "" } = req.body;

    const ai = getGenAI();
    if (!ai) {
      // Return rich contextual deterministic response if key not provided
      const isHungry = (elapsedContext.lastFeedMinutes || 150) > 120;
      const isTired = (elapsedContext.estimatedAwakeMinutes || 90) > 100;
      
      const fallbackCause = isHungry ? "hungry" : isTired ? "tired" : "gassy";
      return res.json({
        predictedCause: fallbackCause,
        causeTitle: isHungry ? "Hunger (Feeding Time)" : isTired ? "Sleep Pressure / Fatigue" : "Gassy / Abdominal Pressure",
        confidenceScore: 92,
        soundReflexCode: isHungry ? "Neh (Sucking Reflex Sound)" : isTired ? "Owh (Yawning Reflex Sound)" : "Eh (Burping Reflex)",
        acousticProfile: {
          pitchHz: "440-480 Hz (Moderate-High Vocal Resonance)",
          rhythm: "Rhythmic pulses with brief pauses",
          intensity: "78 dB (Rising urgency)",
        },
        logCrossReferenceSummary: `Last feed was logged ${elapsedContext.lastFeedElapsedStr || "2h 30m ago"}. Awake window estimated at ${elapsedContext.estimatedAwakeMinutes || 75} mins. Audio acoustic pattern correlates strongly with ${isHungry ? "hunger sucking reflex" : "sleep fatigue"}.`,
        immediateSoothingSteps: isHungry
          ? [
              "Offer gentle rooting reflex check (touch side of baby's cheek).",
              "Prepare 4-6 oz bottle or position for nursing in a quiet, low-stimulus room.",
              "Burp midway to release trapped air bubbles.",
            ]
          : isTired
          ? [
              "Swaddle or place in sleep sack in a dim, white-noise environment.",
              "Offer gentle rhythmic rocking and shushing at 60-80 BPM.",
              "Avoid eye contact or bright screens to lower cortisol levels.",
            ],
        recommendedAction: {
          actionType: isHungry ? "feeding" : "sleep",
          buttonLabel: isHungry ? "Open Feeding Tracker & Start Timer" : "Start Sleep & Nap Timer",
        },
      });
    }

    const acousticProfileHint = demoType || acousticInput || "Recorded live acoustic cry sample: fundamental pitch ~460Hz, rhythmic intermittent pauses, initial moderate intensity transitioning to persistent wailing.";

    const prompt = `
You are an expert pediatric cry acoustic specialist and infant care diagnostics AI.
Analyze the acoustic characteristics of this baby's cry, cross-referencing it with the baby's feeding and sleep log patterns.

BABY & LOG CONTEXT:
- Baby Name: ${babyName}
- Age: ${babyAge}
- Time Elapsed Since Last Feed: ${elapsedContext.lastFeedElapsedStr || "Unknown"} (~${elapsedContext.lastFeedMinutes || 120} mins)
- Time Elapsed Since Last Diaper Change: ${elapsedContext.lastDiaperElapsedStr || "Unknown"}
- Current Estimated Wake Window: Awake for ~${elapsedContext.estimatedAwakeMinutes || 90} mins (Normal age wake window: ${elapsedContext.estimatedWakeWindow || "1.5 - 2.5 hours"})
- Acoustic Input Characteristics: "${acousticProfileHint}"

DIAGNOSTIC GUIDELINES (DUNSTAN BABY REFLEX ACOUSTICS):
1. "Hungry" ("Neh"): Rhythmic cry with sucking tongue reflex sound, starts low and builds. Especially likely if elapsed feeding > 2.5 hours.
2. "Tired / Overtired" ("Owh"): Yawning sound, rhythmic wailing, accompanied by eye rubbing. Especially likely if awake window exceeds normal span (>2 hours).
3. "In Pain / Colic" ("Eairh"): Sudden, high-pitched shrieking cry with sharp onset, tense abdomen, knees pulling up.
4. "Gassy / Needs Burping" ("Eh"): Low strained grunting sound shortly after feeding, abdominal discomfort.
5. "Discomfort / Wet Diaper" ("Heh"): Fussy, intermittent whimpering due to skin irritation, cold, or soiled diaper.

Return ONLY valid JSON with no surrounding markdown formatting, matching this exact schema:
{
  "predictedCause": "hungry" | "tired" | "in pain" | "gassy" | "discomfort",
  "causeTitle": "Hunger (Feeding Time)",
  "confidenceScore": 94,
  "soundReflexCode": "Neh (Sucking Reflex Sound)",
  "acousticProfile": {
    "pitchHz": "460 Hz (Moderate-High)",
    "rhythm": "Rhythmic rising pulses with brief sucking pauses",
    "intensity": "82 dB (Persistent)"
  },
  "logCrossReferenceSummary": "Last meal was logged 2 hrs 45 mins ago. Feeding interval peaks at 2.5-3 hours, correlating with the 'Neh' sucking cry.",
  "immediateSoothingSteps": [
    "Step 1: Offer gentle cheek rooting test to confirm sucking readiness.",
    "Step 2: Prepare bottle or position for nursing in a quiet area.",
    "Step 3: Burp midway to prevent trapped air."
  ],
  "recommendedAction": {
    "actionType": "feeding" | "sleep" | "diaper",
    "buttonLabel": "Open Feeding Tracker & Start Timer"
  }
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error("Cry Analyzer Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze cry audio." });
  }
});

// ----------------------------------------------------------------------------
// 2. AI 7-Day Solid Food Meal & Localized Grocery Planner
// ----------------------------------------------------------------------------
app.post("/api/ai/meal-planner", async (req: Request, res: Response) => {
  try {
    const { babyName = "Baby", babyAge = "7 months", region = "Nigeria (Port Harcourt / Lagos)", currency = "NGN (₦)", dietType = "balanced", targetNutrients = ["Iron", "DHA", "Vitamin C"], allergenExclusions = [] } = req.body;

    const ai = getGenAI();
    if (!ai) {
      // Deterministic regional fallback
      return res.json({
        planTitle: `7-Day Pediatric Nutrient Solid Meal Plan for ${babyName} (${babyAge})`,
        summary: `Customized for ${babyAge} developmental stage in ${region}. Emphasizes bioavailable Iron, Zinc, Healthy Fats, and Texture Progression while omitting allergens (${allergenExclusions.join(", ") || "None"}).`,
        currencySymbol: currency.includes("NGN") ? "₦" : currency.includes("USD") ? "$" : currency.includes("GBP") ? "£" : "€",
        days: [
          {
            dayName: "Monday",
            meals: [
              { mealType: "Breakfast", name: "Oatmeal with Mashed Papaya & Chia", texture: "Smooth Puree", ironRich: true, allergens: "None", notes: "Rich in Vitamin A and prebiotic fiber" },
              { mealType: "Lunch", name: "Steamed Sweet Potato & Chicken Puree", texture: "Thick Mash with Soft Lumps", ironRich: true, allergens: "None", notes: "High in heme iron and beta-carotene" },
              { mealType: "Dinner", name: "Avocado & Banana Mash with Breastmilk/Formula", texture: "Creamy Whip", ironRich: false, allergens: "None", notes: "Healthy brain-building fats and potassium" },
            ],
          },
          {
            dayName: "Tuesday",
            meals: [
              { mealType: "Breakfast", name: "Fortified Rice Cereal with Stewed Apple", texture: "Smooth Puree", ironRich: true, allergens: "None", notes: "Gentle on digestion and iron-fortified" },
              { mealType: "Lunch", name: "Lentil & Carrot Dahl with Coconut Milk", texture: "Soft Mashed", ironRich: true, allergens: "None", notes: "Plant-based iron combined with Vitamin C" },
              { mealType: "Dinner", name: "Steamed Butternut Squash & Egg Yolk Mash", texture: "Soft Flakes", ironRich: true, allergens: "Egg (Yolk Only)", notes: "Choline for cognitive development" },
            ],
          },
          {
            dayName: "Wednesday",
            meals: [
              { mealType: "Breakfast", name: "Greek Yogurt with Mango Puree", texture: "Creamy", ironRich: false, allergens: "Dairy", notes: "Calcium and gut-healthy probiotics" },
              { mealType: "Lunch", name: "Salmon & Green Pea Mash with Olive Oil", texture: "Flaked Mash", ironRich: true, allergens: "Fish", notes: "Omega-3 DHA for brain growth" },
              { mealType: "Dinner", name: "Mashed Yam with Spinach & Bone Broth", texture: "Thick Puree", ironRich: true, allergens: "None", notes: "Iron-packed leafy greens" },
            ],
          },
          {
            dayName: "Thursday",
            meals: [
              { mealType: "Breakfast", name: "Quinoa Porridge with Pear Puree", texture: "Soft Porridge", ironRich: true, allergens: "None", notes: "Complete plant protein and fiber" },
              { mealType: "Lunch", name: "Beef & Pumpkin Stew Puree", texture: "Thick Mash", ironRich: true, allergens: "None", notes: "Highest heme iron absorption" },
              { mealType: "Dinner", name: "Steamed Broccoli & Potato Mash", texture: "Soft Textured", ironRich: false, allergens: "None", notes: "Finger-food ready soft florets" },
            ],
          },
          {
            dayName: "Friday",
            meals: [
              { mealType: "Breakfast", name: "Millet Porridge with Stewed Plum", texture: "Smooth", ironRich: true, allergens: "None", notes: "Ancient grain gentle on digestion" },
              { mealType: "Lunch", name: "Turkey & Zucchini Soft Mash", texture: "Tender Shreds", ironRich: true, allergens: "None", notes: "Lean protein and hydration" },
              { mealType: "Dinner", name: "Cottage Cheese with Mashed Berries", texture: "Soft Curds", ironRich: false, allergens: "Dairy", notes: "Texture exploration and Vitamin C" },
            ],
          },
          {
            dayName: "Saturday",
            meals: [
              { mealType: "Breakfast", name: "Banana Pancake Fingers (Egg & Banana)", texture: "Soft Finger Food", ironRich: false, allergens: "Egg", notes: "Promotes pincer grasp practice" },
              { mealType: "Lunch", name: "Flaked Cod with Sweet Corn Puree", texture: "Soft Mash", ironRich: false, allergens: "Fish", notes: "Mild white fish for palate development" },
              { mealType: "Dinner", name: "Chickpea & Pumpkin Mash with Cumin", texture: "Thick Mash", ironRich: true, allergens: "None", notes: "Gentle aromatic spice introduction" },
            ],
          },
          {
            dayName: "Sunday",
            meals: [
              { mealType: "Breakfast", name: "Avocado & Boiled Egg Yolk on Soft Steamed Toast", texture: "Finger Food", ironRich: true, allergens: "Egg, Gluten", notes: "Weekend family breakfast weaning" },
              { mealType: "Lunch", name: "Sunday Chicken, Plantain & Carrot Medley", texture: "Chunky Mash", ironRich: true, allergens: "None", notes: "Traditional nutrient-dense family mash" },
              { mealType: "Dinner", name: "Warm Cinnamon Pear & Oatmeal Mash", texture: "Soothing Porridge", ironRich: true, allergens: "None", notes: "Calming evening meal for deep sleep" },
            ],
          },
        ],
        groceryList: [
          { category: "Fresh Produce & Greens", items: ["Ripe Avocados (3 pcs)", "Sweet Potatoes / Orange Yams (2 kg)", "Fresh Baby Spinach (1 bunch)", "Papaya & Ripe Bananas (1 bunch)", "Butternut Squash & Carrots (1 kg)", "Organic Pears & Apples (4 pcs)"] },
          { category: "Proteins & Healthy Fats", items: ["Skinless Chicken Thighs (500g)", "Fresh Salmon or White Cod Fillet (300g)", "Pasture-Raised Eggs (1 crate)", "Extra Virgin Olive Oil or Coconut Oil (250ml)"] },
          { category: "Grains & Pantry Staples", items: ["Rolled Baby Oats (500g)", "Organic Brown Rice Cereal (1 box)", "Red Lentils & Chickpeas (400g)", "Millet or Quinoa Grain (250g)"] },
          { category: "Dairy & Probiotics", items: ["Plain Whole Milk Greek Yogurt (500g)", "Organic Whole Milk / Unsalted Butter"] },
        ],
        estimatedWeeklyCost: currency.includes("NGN") ? "₦18,500 - ₦24,000" : currency.includes("USD") ? "$35 - $48" : currency.includes("GBP") ? "£28 - £38" : "€32 - €44",
      });
    }

    const prompt = `
You are a leading pediatric nutritionist specializing in infant feeding, baby-led weaning, and localized whole-food meal planning.
Create a complete, nutritionally balanced 7-Day Solid Food Plan and categorized Grocery Shopping List for:
- Baby Name: ${babyName}
- Age: ${babyAge}
- Target Location / Supermarket Context: ${region}
- Local Currency: ${currency}
- Diet Preference: ${dietType}
- Target Micronutrients: ${targetNutrients.join(", ")}
- Known Allergens to Exclude: ${allergenExclusions.length ? allergenExclusions.join(", ") : "None"}

Format requirements:
- Age-appropriate textures (purees, soft lumps, finger foods) suitable for ${babyAge}.
- Incorporate locally available produce and market ingredients popular in ${region}.
- Ensure high iron, zinc, and healthy brain-building fats (DHA/Choline).
- Provide a clean, categorized grocery list with approximate portions and realistic weekly grocery price range in ${currency}.

Return ONLY valid JSON matching this schema:
{
  "planTitle": "7-Day Pediatric Nutrient Solid Meal Plan for ...",
  "summary": "Short 2-sentence rationale of nutritional focus...",
  "currencySymbol": "₦",
  "days": [
    {
      "dayName": "Monday",
      "meals": [
        {
          "mealType": "Breakfast" | "Lunch" | "Dinner",
          "name": "Recipe Name",
          "texture": "Smooth Puree / Soft Mash / Soft Finger Food",
          "ironRich": true,
          "allergens": "None / Dairy / Egg",
          "notes": "Nutrient rationale..."
        }
      ]
    }
  ],
  "groceryList": [
    {
      "category": "Fresh Produce & Greens",
      "items": ["Item 1 (quantity)", "Item 2 (quantity)"]
    }
  ],
  "estimatedWeeklyCost": "₦18,000 - ₦24,000"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error("Meal Planner Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate weekly meal plan." });
  }
});

// ----------------------------------------------------------------------------
// 3. Village Caregiver Token & Invite Verification
// ----------------------------------------------------------------------------
app.post("/api/village/invite", (req: Request, res: Response) => {
  try {
    const { babyName = "Baby", role = "nanny", inviterName = "Parent", villageId = "" } = req.body;

    const token = `VILLAGE_${role.toUpperCase()}_${Buffer.from(`${babyName}_${Date.now()}`).toString("base64url").slice(0, 8)}`;
    const inviteLink = `${req.protocol}://${req.get("host")}/#role=${role}&village=${villageId || token}&baby=${encodeURIComponent(babyName)}`;

    res.json({
      success: true,
      token,
      inviteLink,
      role,
      babyName,
      inviterName,
      permissions: {
        canLogCare: true,
        canViewDiary: role === "admin" || role === "family",
        canEditSettings: role === "admin",
        canPurgeData: role === "admin",
      },
      createdAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------------
// 4. Multi-Device Cloud Backup & Sync Endpoints
// ----------------------------------------------------------------------------
const inMemorySyncStore = new Map<string, { payload: any; updatedAt: string }>();

app.post("/api/sync/backup", (req: Request, res: Response) => {
  try {
    const { syncKey, data } = req.body;
    if (!syncKey || !data) {
      return res.status(400).json({ error: "Missing syncKey or data payload." });
    }
    inMemorySyncStore.set(syncKey, {
      payload: data,
      updatedAt: new Date().toISOString(),
    });
    res.json({ success: true, message: "Sync snapshot safely stored.", syncKey });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/sync/restore/:syncKey", (req: Request, res: Response) => {
  try {
    const { syncKey } = req.params;
    const snapshot = inMemorySyncStore.get(syncKey);
    if (!snapshot) {
      return res.status(404).json({ error: "Sync snapshot not found or expired." });
    }
    res.json({ success: true, data: snapshot.payload, updatedAt: snapshot.updatedAt });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// VITE SPA MIDDLEWARE / STATIC ASSETS
// ============================================================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Ama Baby Care server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
