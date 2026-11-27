"use strict";
const axios = require("axios");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");


const SYSTEM_PROMPT =
  "You are AgroSence, a concise assistant for Indian farmers. Answer agriculture, farming, crop, market and government-scheme questions in under 120 words. If the question is unrelated to agriculture, politely reply that you can only help with agriculture-related queries.";

// Models are retired regularly (2.0 flash is gone, 2.5 flash shuts down 2026-12-01). Try the configured one first, then current fallbacks.
const modelChain = () => [...new Set([env.gemini.model, "gemini-4-hydrogen", "gemini-3.5-flash-lite", "gemini-2.5-flash-lite"].filter(Boolean))];

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const headers = () => ({ "Content-Type": "application/json", "x-goog-api-key": env.gemini.apiKey });
const NO_ANSWER = "I'm not sure how to respond to that.";

/** Interactions API (current): text is in steps[type=model_output].content[type=text].text */
async function callInteractions(model, message) {
  const { data } = await axios.post(
    `${GEMINI_BASE}/interactions`,
    { model, system_instruction: SYSTEM_PROMPT, input: message, generation_config: { max_output_tokens: 800 }, store: false },
    { headers: { ...headers(), "Api-Revision": "2026-05-20" }, timeout: 20000 }
  );
  const text = (data.steps || [])
    .filter((st) => st.type === "model_output")
    .flatMap((st) => st.content || [])
    .filter((c) => c.type === "text" && c.text)
    .map((c) => c.text)
    .join("");
  return text || data.output_text || NO_ANSWER;
}

/** Legacy generateContent API (still supported by Google): used as a fallback. */
async function callGenerateContent(model, message) {
  const { data } = await axios.post(
    `${GEMINI_BASE}/models/${model}:generateContent`,
    {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ parts: [{ text: message }] }],
      generationConfig: { maxOutputTokens: 800 },
    },
    { headers: headers(), timeout: 20000 }
  );
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join("") || NO_ANSWER;
}

async function callGemini(model, message) {
  try {
    return await callInteractions(model, message);
  } catch (err) {
    const st = err.response?.status;
    console.error(`[gemini] interactions ${model} failed:`, st || err.message, err.response?.data?.error?.message || "");
    if (st && st !== 400 && st !== 404) throw err; // auth/quota/server errors won't change with another endpoint
    return callGenerateContent(model, message);
  }
}

async function getChatAnswer(message) {
  if (!env.gemini.apiKey) throw ApiError.unavailable("The assistant is not configured on the server");
  for (const model of modelChain()) {
    try {
      return await callGemini(model, message);
    } catch (err) {
      const status = err.response?.status;
      console.error(`[gemini] ${model} failed:`, status || err.message, err.response?.data?.error?.message || "");
      // Only move on to the next model when this one is unavailable to the key; auth/quota problems won't be fixed by another model.
      if (status !== 404 && status !== 403 && status !== 400) break;
    }
  }
  throw ApiError.unavailable("The assistant is temporarily unavailable");
}

async function wikiDescription(title) {
  try {
    const { data } = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, { timeout: 8000 });
    return data.extract || "No description available.";
  } catch {
    return "No description available.";
  }
}

async function identifyCrop(buffer, mimetype) {
  if (!env.plantId.apiKey) throw ApiError.unavailable("Crop detection is not configured on the server");
  let data;
  try {
    ({ data } = await axios.post(
      "https://api.plant.id/v2/identify",
      {
        api_key: env.plantId.apiKey,
        images: [`data:${mimetype};base64,${buffer.toString("base64")}`],
        modifiers: ["crops_fast", "similar_images"],
        plant_language: "en",
        plant_details: ["common_names", "url", "wiki_description", "taxonomy"],
      },
      { timeout: 30000 }
    ));
  } catch (err) {
    console.error("[plant.id] error:", err.response?.status || err.message);
    throw ApiError.unavailable("Crop detection service is temporarily unavailable");
  }
  const plant = data?.suggestions?.[0];
  if (!plant) throw ApiError.notFound("Crop not identified");
  return {
    scientificName: plant.plant_name,
    commonNames: plant.plant_details?.common_names || [],
    description: plant.plant_details?.wiki_description?.value || (await wikiDescription(plant.plant_name)),
  };
}

module.exports = { getChatAnswer, identifyCrop };
