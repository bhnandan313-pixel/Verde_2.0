import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

/** Fetch all dairy products (for dropdown population). */
export async function fetchProducts() {
  const { data } = await client.get('/products');
  return data;
}

/** Fetch a single dairy product by ID. */
export async function fetchProduct(productId) {
  const { data } = await client.get(`/products/${productId}`);
  return data;
}

// ---------------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------------

/** Fetch all packaging materials. */
export async function fetchMaterials() {
  const { data } = await client.get('/materials');
  return data;
}

// ---------------------------------------------------------------------------
// Recommendation Engine
// ---------------------------------------------------------------------------

/**
 * Run the recommendation engine.
 *
 * @param {object} params
 * @param {string}  params.product_id       - Required dairy product ID.
 * @param {number}  [params.max_moq]        - Optional MOQ ceiling.
 * @param {number}  [params.max_cost]       - Optional cost ceiling (USD).
 * @param {boolean} [params.recyclable_only]- Optional recyclable filter.
 * @returns {Promise<{ product: object, matches: object[], failures: object[] }>}
 */
export async function runRecommendation(params) {
  const payload = { ...params };
  const stringFields = [
    'product_name',
    'storage_type',
    'temperature_condition',
    'respiration_rate',
    'transportation_conditions'
  ];
  stringFields.forEach((field) => {
    if (payload[field] === '' || payload[field] === null) delete payload[field];
  });

  const numericFields = [
    'max_moq',
    'max_cost',
    'moisture_content',
    'fat_content',
    'ph_level',
    'desired_shelf_life',
    'relative_humidity'
  ];
  numericFields.forEach((field) => {
    if (payload[field] === '' || payload[field] === null || payload[field] === undefined) {
      delete payload[field];
    } else {
      payload[field] = Number(payload[field]);
    }
  });

  const { data } = await client.post('/recommend', payload);
  return data;
}

// ---------------------------------------------------------------------------
// Sourcing Engine
// ---------------------------------------------------------------------------

/**
 * Run the supplier sourcing engine for a given material.
 *
 * @param {object} params
 * @param {string}  params.material_id - Required packaging material ID.
 * @param {number}  [params.user_moq]  - Your intended order quantity.
 * @param {number}  [params.max_tier]  - Max acceptable supplier tier (1=best).
 * @returns {Promise<{ material: object, matches: object[], rejected: object[] }>}
 */
export async function runSourcing(params) {
  const payload = { ...params };
  if (payload.user_moq !== undefined && payload.user_moq !== '')
    payload.user_moq = Number(payload.user_moq);
  else delete payload.user_moq;
  if (payload.max_tier !== undefined && payload.max_tier !== '')
    payload.max_tier = Number(payload.max_tier);
  else delete payload.max_tier;

  const { data } = await client.post('/sourcing', payload);
  return data;
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export async function checkHealth() {
  const { data } = await client.get('/health');
  return data;
}

export default client;
