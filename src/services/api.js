/**
 * src/services/api.js
 * ━━━━━━━━━━━━━━━━━━
 * API service layer for the dairy packaging recommendation system.
 * Communicates with the Flask backend at http://127.0.0.1:5000.
 */

const API_BASE_URL = "http://127.0.0.1:5000";

/**
 * Fetch a packaging recommendation from the backend.
 *
 * @param {string} commodityId  — The commodity identifier (e.g. "DC001").
 * @param {string} priority     — Optimisation axis: "maximize_shelf_life",
 *                                 "minimize_cost", or "epr_compliance".
 * @returns {Promise<Object>}   — The recommendation result from the engine.
 * @throws {Error}              — If the network request fails or the
 *                                 server responds with a non-OK status.
 */
export async function fetchRecommendation(commodityId, priority) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        commodity_id: commodityId,
        priority: priority,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message =
        errorData?.message ||
        `Server responded with status ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Re-throw with context if it's a network-level failure
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      throw new Error(
        "Unable to reach the recommendation server. Ensure the Flask backend is running on port 5000."
      );
    }
    throw error;
  }
}
