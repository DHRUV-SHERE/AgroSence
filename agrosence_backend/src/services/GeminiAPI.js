require("dotenv").config();
const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const getGeminiResponse = async (userMessage) => {
    try {
        // Check if the message is agriculture-related
        if (
            !/\b(hi|hello|farming|agriculture|crop|crops|soil|harvest|fertilizer|irrigation|pesticide|organic|yield|weather|climate|plantation|seeds|manure|plowing|sowing|tillage|greenhouse|tractor|combine|threshing|sprayer|disease|mulching|drainage|compost|livestock|horticulture|aquaculture|agronomy|cultivation|insecticide|herbicide|fungicide|paddy|wheat|maize|barley|millet|sorghum|sugarcane|cotton|legumes|pulses|tuber|planting|germination|transplanting|irrigate|sprinkler|drip|green manure|vermicompost|biofertilizer|barn|cattle|goat|sheep|poultry|dairy|fodder|grazing|harrow|rotavator|silage|pasture|weather forecast|soil testing|crop rotation|intercropping|weeding|nursery|farm|farmer|agribusiness|market|yield|extension|subsidy|scheme|loan|mandi|cold storage|warehousing|minikit|kharif|rabi|zayed|seed treatment|fertigation|pest control|agro|spraying|climatic|crop failure|land|acreage|landholding|land reform|irrigated|unirrigated|monsoon|drought|flood|agrochemicals|biopesticides|genetically modified|gm crops|tissue culture|agriculture university)\b/i.test(userMessage)
          ) {
            return "I'm only programmed to respond to agriculture-related queries.";
          }          

        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: userMessage }] }],
                generationConfig: { maxOutputTokens: 100 } // Limit response length
            },
            {
                headers: { "Content-Type": "application/json" },
            }
        );

        const botReply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to respond to that.";
        return botReply;
    } catch (error) {
        console.error("Error in Gemini API:", error.response?.data || error.message);
        return "Sorry, I couldn't process your request.";
    }
};

module.exports = getGeminiResponse;
