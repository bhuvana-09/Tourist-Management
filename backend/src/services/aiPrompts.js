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

/**
 * Build chat support agent prompt
 */
const buildChatPrompt = (messageHistory = [], userMessage = "", destinationCatalog = []) => {
  const catalogText = destinationCatalog.map(d => `- Name: "${d.name}", Location: "${d.location}", Tags: [${d.tags.join(', ')}], Description: "${d.description}"`).join('\n');
  const chatHistoryText = messageHistory.map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');

  return `You are a friendly, helpful AI travel assistant chatbot for our booking platform "Tourist Management System".
Your role is to answer user questions about travel planning, bookings, packing advice, and our destination catalog.

### Platform Destinations Catalog:
${catalogText}

### Grounding Guidelines:
- If a user asks about what packages or destinations we offer, refer strictly to the destinations in our catalog listed above.
- Always remain professional, polite, and travel-focused.
- If the user asks about something completely unrelated to travel or our booking services (e.g. math equations, writing unrelated software, etc.), politely decline and steer the conversation back to travel.
- Keep your answers relatively concise, helpful, and direct.

### Current Conversation Thread:
${chatHistoryText}
User: ${userMessage}
Assistant:`;
};

/**
 * Build budget breakdown optimizer prompt
 */
const buildBudgetPrompt = (destination, days, totalBudget, travelers) => {
  return `You are a travel financial planner.
Analyze and suggest a smart budget percentage/amount breakdown for the following trip:

Destination Name: "${destination.name}"
Location: "${destination.location}"
Trip Details:
- Duration: ${days} days
- Travelers Count: ${travelers}
- Total Budget: ${totalBudget} USD

### Requirements:
1. Provide a realistic budget distribution across four categories: "Accommodation", "Food & Dining", "Transport & Transit", and "Sightseeing & Activities".
2. The sum of the amount values in the breakdown MUST sum up to exactly ${totalBudget}.
3. The sum of the percentage values MUST sum up to exactly 100.
4. Output your response as a RAW JSON object. Do NOT wrap the JSON in markdown code blocks (\`\`\`json ... \`\`\`), do not write any pre-amble, headers, or conversational text.

### Target Output JSON Schema:
{
  "totalBudget": ${totalBudget},
  "breakdown": [
    {
      "category": "Accommodation",
      "percentage": 40,
      "amount": 400,
      "description": "Short explanation justifying this expense distribution based on the destination."
    }
  ]
}`;
};

/**
 * Build packing list generator prompt
 */
const buildPackingListPrompt = (destination, days, season) => {
  return `You are a packing assistant.
Generate a categorized packing checklist for:

Destination Name: "${destination.name}"
Location: "${destination.location}"
Trip Details:
- Length: ${days} days
- Climate/Season: "${season}" (e.g. summer, winter, rainy, spring)

### Requirements:
1. Compile items specifically tailored to the destination climate, activities, and duration.
2. Group the items into logical categories (e.g. "Essential Documents", "Clothing", "Toiletries & Health", "Gear & Electronics").
3. Return your response as a RAW JSON object. Do NOT wrap the JSON in markdown code blocks (\`\`\`json ... \`\`\`), do not write any pre-amble, headers, or conversational text.

### Target Output JSON Schema:
{
  "categories": [
    {
      "name": "Clothing",
      "items": [
        "Pack 4 quick-dry t-shirts",
        "Light jacket for cool evenings"
      ]
    }
  ]
}`;
};

/**
 * Build travel tips prompt
 */
const buildTravelTipsPrompt = (destination) => {
  return `You are a travel safety and local culture expert.
Provide a list of 3-5 practical, destination-specific insider travel tips for:

Destination Name: "${destination.name}"
Location: "${destination.location}"
Category Tags: [${destination.tags.join(', ')}]

### Requirements:
1. Focus on local etiquette, transport warnings, cultural norms, safety, or hidden gems.
2. Output your response as a RAW JSON object. Do NOT wrap the JSON in markdown code blocks (\`\`\`json ... \`\`\`), do not write any pre-amble, headers, or conversational text.

### Target Output JSON Schema:
{
  "tips": [
    {
      "title": "Insider tip title",
      "description": "Detailed explanation of the tip (dos and don'ts, scams to avoid, local phrases, etc.)."
    }
  ]
}`;
};

/**
 * Build FAQ generation prompt based on real reviews feedback
 */
const buildFAQPrompt = (destination, reviews = []) => {
  const reviewsText = reviews.length > 0
    ? reviews.map(r => `- [Rating: ${r.rating}/5]: "${r.comment}"`).join('\n')
    : 'No customer reviews submitted yet.';

  return `You are an editor for our destination FAQ portal.
Generate a list of 3 to 5 relevant, grounded Frequently Asked Questions (FAQ) with answers for:

Destination Name: "${destination.name}"
Location: "${destination.location}"
Description: "${destination.description}"

### Real Travelers Feedback/Reviews:
${reviewsText}

### Requirements:
1. Base the questions and answers on the destination's details and, crucially, address any themes, concerns, highlights, or tips mentioned in the "Real Travelers Feedback/Reviews" section.
2. If there are no reviews, generate general helpful FAQs based on the destination's description.
3. Keep the questions direct and answers brief, helpful, and informative.
4. Output your response as a RAW JSON array of objects. Do NOT wrap the JSON in markdown code blocks (\`\`\`json ... \`\`\`), do not write any pre-amble, headers, or conversational text.

### Target Output JSON Schema:
[
  {
    "question": "Does this destination have good transport options?",
    "answer": "Yes, travelers mentioned that local taxis are cheap, but walking is the best way to explore the core areas."
  }
]`;
};

/**
 * Build sentiment analysis prompt for a review message
 */
const buildSentimentPrompt = (reviewText) => {
  return `You are a sentiment analysis classifier.
Analyze the sentiment of the following customer review message:

Review text: "${reviewText}"

### Requirements:
1. Classify the overall sentiment into exactly one of these labels: "positive", "neutral", or "negative".
2. Provide a confidence score (from 0.0 representing low confidence to 1.0 representing maximum confidence).
3. Output your response as a RAW JSON object. Do NOT wrap the JSON in markdown code blocks (\`\`\`json ... \`\`\`), do not write any pre-amble, headers, or conversational text.

### Target Output JSON Schema:
{
  "label": "positive",
  "score": 0.95
}`;
};

/**
 * Build review synthesis summary prompt for a destination catalog
 */
const buildReviewSummaryPrompt = (reviews = []) => {
  const reviewsText = reviews.length > 0
    ? reviews.map((r, i) => `Review ${i + 1}: "${r.text}"`).join('\n')
    : 'No customer reviews submitted yet.';

  return `You are a travel editor assistant.
Analyze the following traveler reviews and compile a concise 2-3 sentence summary summarizing what travelers are actually saying about this destination.

### Customer Reviews:
${reviewsText}

### Requirements:
1. Sift through highlights, key strengths, common complaints, or local advices mentioned in the traveler reviews.
2. Return ONLY the plain text summary. Do not include markdown headers, bullet points, prefixes (like "Summary:"), or conversational text.`;
};

module.exports = {
  buildRecommendationsPrompt,
  buildItineraryPrompt,
  buildChatPrompt,
  buildBudgetPrompt,
  buildPackingListPrompt,
  buildTravelTipsPrompt,
  buildFAQPrompt,
  buildSentimentPrompt,
  buildReviewSummaryPrompt
};
