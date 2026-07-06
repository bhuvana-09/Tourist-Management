/**
 * AI Service:
 * 
 * Architecture Note:
 * This wraps Google's Generative AI SDK, exposing a centralized, swappable wrapper
 * generateContent(prompt, options) rather than letting various features call the SDK directly.
 * 
 * Timeout, Retry, and Fallback Strategy:
 * 1. Timeout: AI calls are raced against a promise timer (defaults to 10 seconds). If it resolves first, 
 *    the request is rejected with a timeout error.
 * 2. Retry: If a call fails (due to connection loss, API limits, or timeout), we catch it and try EXACTLY ONCE
 *    more before giving up.
 * 3. Graceful Fallback: If it still fails, the service catches the error, logs it, and returns `null`
 *    instead of letting the error bubble up to throw a 500. The caller controller will catch the `null`
 *    and return a friendly, graceful `aiUnavailable` response (200 OK) so the frontend doesn't crash.
 */

const { GoogleGenAI } = require('@google/genai');
const { GEMINI_API_KEY } = require('../config/env');

let aiClient = null;

if (GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
} else {
  console.warn('GEMINI_API_KEY is not defined in the environment. AI features will fallback gracefully.');
}

/**
 * Execute content generation using gemini-2.5-flash with timeout and retry logic.
 * 
 * @param {string} prompt - Input prompt text
 * @param {object} options - Custom configuration options
 * @param {number} options.timeoutMs - Timeout limit (default 10000ms)
 * @param {boolean} options.retryOnce - Retry on first attempt failure (default true)
 * @returns {Promise<string|null>} Generated raw text response or null on failure
 */
const generateContent = async (prompt, options = {}) => {
  const { timeoutMs = 12000, retryOnce = true } = options;

  if (!aiClient) {
    console.error('GoogleGenAI client is not initialized.');
    return null;
  }

  // Wrapper for a single SDK invocation raced against a timeout promise
  const executeAttempt = async () => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('AI generation request timed out'));
      }, timeoutMs);
    });

    try {
      const sdkPromise = aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const response = await Promise.race([sdkPromise, timeoutPromise]);
      clearTimeout(timeoutId);

      if (!response || !response.text) {
        throw new Error('AI returned an empty response');
      }

      return response.text();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  // Main flow with one retry attempt
  try {
    return await executeAttempt();
  } catch (error) {
    console.warn('AI attempt 1 failed:', error.message);

    if (retryOnce) {
      console.log('Retrying AI content generation (Attempt 2)...');
      try {
        return await executeAttempt();
      } catch (retryError) {
        console.error('AI attempt 2 failed (final retry):', retryError.message);
        return null; // Return null so controller can gracefully degrade
      }
    }

    return null; // Return null on retry skipped
  }
};

module.exports = {
  generateContent
};
