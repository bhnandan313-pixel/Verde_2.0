"""
app.py
======
Flask API server for the dairy packaging recommendation engine.

Exposes a single POST endpoint that accepts a commodity ID and
optimisation priority, then returns the best-fit packaging material.

Usage:
    python app.py
    → Runs on http://127.0.0.1:5000

Endpoint:
    POST /api/recommend
    Body: { "commodity_id": "DC001", "priority": "maximize_shelf_life" }
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from recommendation_engine import get_packaging_recommendation

app = Flask(__name__)
CORS(app)  # Enable CORS for all origins (local dev testing)


@app.route("/api/recommend", methods=["POST"])
def recommend():
    """Accept a JSON payload and return a packaging recommendation.

    Expected JSON body:
        {
            "commodity_id": str,   — e.g. "DC001"
            "priority": str        — one of: "maximize_shelf_life",
                                              "minimize_cost",
                                              "epr_compliance"
        }

    Returns:
        JSON response from the recommendation engine, including
        the top material, failure modes, and filter summary.
    """
    # --- Parse incoming JSON ---
    body = request.get_json(silent=True)

    if body is None:
        return jsonify({
            "status": "error",
            "message": "Request body must be valid JSON.",
        }), 400

    commodity_id = body.get("commodity_id")
    priority = body.get("priority")

    # --- Validate required fields ---
    missing = []
    if not commodity_id:
        missing.append("commodity_id")
    if not priority:
        missing.append("priority")

    if missing:
        return jsonify({
            "status": "error",
            "message": f"Missing required field(s): {', '.join(missing)}.",
        }), 400

    # --- Run the recommendation pipeline ---
    result = get_packaging_recommendation(commodity_id, priority)

    # Map engine status to HTTP status codes
    status_code_map = {
        "success": 200,
        "warning": 200,
        "error": 422,
    }
    http_status = status_code_map.get(result.get("status"), 500)

    return jsonify(result), http_status


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
