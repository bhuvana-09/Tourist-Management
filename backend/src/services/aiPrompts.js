/**
 * AI Prompts Generator:
 * 
 * Instructions to Gemini:
 * When querying for structured outputs, we explicitly instruct Gemini to return 
 * RAW JSON ONLY, without markdown code fences (e.g. ```json ... ```), preamble, or conclusion text.
 * This makes parsing more predictable and resilient.
 */

/**
 * Build prompt for personalized destination recommendations based on booking history
 * 
 * @param {Array} userBookings - User's booking history
 * @param {Array} destinationsCatalog - Entire available destination catalog
 * @returns {string} The formatted prompt text
 */
const buildRecommendationsPrompt = (userBookings = [], destinationsCatalog = []) => {
  const historyText = userBookings.length > 0 
    ? userBookings.map(b => `- Visited "${b.packageName || b.packageId?.packageName}" in destination: "${b.destinationId?.name || b.packageName}"`).join('\n')
    : 'No travel history yet (brand new traveler).';

  const catalogText = destinationsCatalog.map(d => `- ID: "${d._id.toString()}", Name: "${d.name}", Location: "${d.location}", Description: "${d.description}", Tags: [${d.tags.join(', ')}]`).join('\n');

  return `You are a personalized travel recommendation AI.
Your task is to recommend up to 3 travel destinations from our REAL catalog that best match the traveler's past preferences.

### Traveler Booking History:
${historyText}

### Real Available Destination Catalog:
${catalogText}

### Requirements:
1. You must ONLY recommend destinations listed in the "Real Available Destination Catalog" above.
2. Under no circumstances should you invent or hallucinate new destinations or use IDs not present in the catalog.
3. Recommend between 1 and 3 destinations. If the user has no history, suggest generally popular/highest-rated destinations from the list.
4. Output your response as a RAW JSON array of objects. Do NOT wrap it in markdown code block fences (do not include \`\`\`json or \`\`\`), do not write any introductory or trailing text.

### Target Output JSON Schema:
[
  {
    "id": "must be the exact MongoDB _id string of the recommended destination",
    "reason": "a brief 1-2 sentence personalized rationale explaining why we recommend this destination based on their history"
  }
]`;
};

/**
 * Build prompt for generating a day-by-day travel itinerary preview
 * 
 * @param {object} destination - Target destination details
 * @param {number} days - Duration in days
 * @param {string} budget - Budget tier ('budget', 'mid-range', 'luxury')
 * @returns {string} The formatted prompt text
 */
const buildItineraryPrompt = (destination, days, budget) => {
  return `You are an expert tour guide planner.
Create a customized day-by-day travel itinerary preview for the following destination:

Destination Name: "${destination.name}"
Location: "${destination.location}"
Description: "${destination.description}"
Category Tags: [${destination.tags.join(', ')}]

Trip Parameters:
- Number of Days: ${days}
- Budget Tier: "${budget}" (budget / mid-range / luxury)

### Requirements:
1. Provide a detailed, realistic activity plan for each day (from Day 1 to Day ${days}) tailored to the destination and budget tier.
2. Return your output as a RAW JSON object. Do NOT wrap the JSON in markdown code blocks (\`\`\`json ... \`\`\`), do not write any pre-amble, headers, or conversational text.

### Target Output JSON Schema:
{
  "days": [
    {
      "dayNumber": 1,
      "title": "Short title describing the day's theme",
      "activities": "Detailed description of planned activities, travel tips, and spots to visit for Day 1."
    }
  ]
}`;
};

module.exports = {
  buildRecommendationsPrompt,
  buildItineraryPrompt
};
