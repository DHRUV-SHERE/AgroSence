"use strict";
const axios = require("axios");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");


async function getChatAnswer(message) {
  if (!env.gemini.apiKey) throw ApiError.unavailable("The assistant is not configured on the server");
  try {
    const { data } = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${env.gemini.model}:generateContent`,
      {
        systemInstruction: { parts: [{ text: "You are AgroSence, a concise assistant for Indian farmers. Answer agriculture, farming, crop, market and government-scheme questions in under 120 words. If the question is unrelated to agriculture, politely reply that you can only help with agriculture-related queries." }] },
        contents: [{ parts: [{ text: message }] }],
        generationConfig: { maxOutputTokens: 800, temperature: 0.4, thinkingConfig: { thinkingBudget: 0 } },
      },
      { headers: { "Content-Type": "application/json", "x-goog-api-key": env.gemini.apiKey }, timeout: 20000 }
    );
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to respond to that.";
  } catch (err) {
    console.error("[gemini] error:", err.response?.status || err.message, err.response?.data?.error?.message || "");
    throw ApiError.unavailable("The assistant is temporarily unavailable");
  }
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
