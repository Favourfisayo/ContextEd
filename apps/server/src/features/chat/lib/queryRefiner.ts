import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

/**
 * Initialize a lightweight model for query refinement
 * We use a faster/cheaper model if available, or the same one
 */
function getRefinementModel() {
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash", // Fast model for refinement
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0.3, // Lower temperature for more deterministic output
  });
}

/**
 * Refine the user's query based on chat history
 * Transforms a conversational query into a standalone search query
 * 
 * Example:
 * History: "Tell me about photosynthesis."
 * User: "How does it work?"
 * Refined: "How does photosynthesis work process mechanism"
 */
export async function refineQuery(
  chatHistory: string,
  currentQuery: string
): Promise<string> {
  // If no history, the query is likely already standalone
  if (!chatHistory || chatHistory.trim().length === 0) {
    return currentQuery;
  }

  const model = getRefinementModel();
  
  const prompt = `
    Given the following conversation history and a follow-up question, rephrase the follow-up question to be a standalone search query.
    The query will be used to search a vector database for relevant course materials.
    
    Rules:
    1. Incorporate relevant context from the history (e.g. "it", "that") into the query.
    2. Keep it concise and focused on keywords.
    3. Do NOT answer the question.
    4. Do NOT add "search for" or "query".
    5. If the question is unrelated to the history, return it as is.
    
    Chat History:
    ${chatHistory}
    
    Follow-up Question:
    ${currentQuery}
    
    Standalone Search Query:
  `;

  try {
    const response = await model.invoke(prompt);
    const refinedQuery = response.content.toString().trim();
    
    // Fallback if model returns empty
    return refinedQuery || currentQuery;
  } catch (error) {
    console.warn("Failed to refine query, using original:", error);
    return currentQuery;
  }
}
