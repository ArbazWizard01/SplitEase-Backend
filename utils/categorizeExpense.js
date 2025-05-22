const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function categorizeExpense(description) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        generationConfig: {
          temperature: 1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 20,
          responseMimeType: "text/plain",
        },
        contents: [
          {
            role: "user",
            parts: [{ text: description }],
          },
        ],
        systemInstruction: {
          role: "user",
          parts: [
            {
              text: `You are an expense categorization assistant. Given an expense description, return the most appropriate category from the following list:

- Food
- Housing
- Transportation
- Entertainment
- Travel
- Health
- Shopping
- Gifts
- Education
- Others

Rules:

Output only the category name — no explanation. If the description is unclear or doesn’t match, return Miscellaneous.`,
            },
          ],
        },
      }
    );

    const output =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return output || "Others";
  } catch (error) {
    console.error(
      "Error categorizing expense:",
      error.response?.data || error.message
    );
    return "Others";
  }
}

module.exports = categorizeExpense;
