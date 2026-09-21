import { useNavigate } from 'react-router-dom';
import useEngineStore from '../store/useEngineStore';
import { runRecommendation } from '../services/api';
import { Button } from '../components/ui/Button';

/**
 * AdvancedPage — Route: /advanced
 * Dedicated page for advanced filter configuration.
 * Saves filters to the Zustand store (persisted), then either:
 *   - "Apply & Go Back" → back to /
 *   - "Run Engine" → directly runs recommendation → /results
 */
export default function AdvancedPage() {
  const navigate = useNavigate();
  const { form, ui, setFormField, setResult, setLoading, setError, resetForm } = useEngineStore();

  async function handleRun() {
    if (!form.product_id) {
      setError('Please select a product on the main page first.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await runRecommendation({
        product_id:      form.product_id,
        max_moq:         form.max_moq   || undefined,
        max_cost:        form.max_cost  || undefined,
        recyclable_only: form.recyclable_only,
      });
      setResult(result);
      navigate('/results');
    } catch (err) {
      const msg = err?.response?.data?.error ?? err?.message ?? 'Unknown error.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center px-4 py-16 font-sans">

      {/* ── Header ── */}
      <div className="w-full max-w-lg mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6"
          id="back-to-home-btn"
        >
          ← Back to Engine
        </button>

        <div className="mb-1 flex items-center gap-2">
          <span className="text-xl">⚙</span>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Advanced Filters</h1>
        </div>
        <p className="text-sm text-gray-500">
          Narrow the packaging search with supply chain constraints.
          These filters are saved automatically.
        </p>
      </div>

      {/* ── Filter Card ── */}
      <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">

        {/* MOQ */}
        <div>
          <label htmlFor="adv-max-moq" className="label">
            Maximum MOQ (units)
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Only show packaging materials whose minimum order quantity is at or below this number.
          </p>
          <input
            id="adv-max-moq"
            type="number"
            min={0}
            className="input-field"
            placeholder="e.g. 10 000"
            value={form.max_moq}
            onChange={(e) => setFormField('max_moq', e.target.value)}
          />
        </div>

        <div className="border-t border-gray-800" />

        {/* Cost ceiling */}
        <div>
          <label htmlFor="adv-max-cost" className="label">
            Maximum Cost per Unit (USD)
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Exclude packaging materials above this price point.
          </p>
          <input
            id="adv-max-cost"
            type="number"
            min={0}
            step={0.01}
            className="input-field"
            placeholder="e.g. 0.50"
            value={form.max_cost}
            onChange={(e) => setFormField('max_cost', e.target.value)}
          />
        </div>

        <div className="border-t border-gray-800" />

        {/* Recyclable toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-300">Recyclable materials only</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Filter out multi-layer non-recyclable packaging.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.recyclable_only}
            onClick={() => setFormField('recyclable_only', !form.recyclable_only)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              form.recyclable_only ? 'bg-emerald-500' : 'bg-gray-700'
            }`}
            id="recyclable-toggle"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                form.recyclable_only ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Active filter summary */}
        {(form.max_moq || form.max_cost || form.recyclable_only) && (
          <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-xl p-3 text-xs text-emerald-300 space-y-1">
            <p className="font-semibold text-emerald-400 mb-1">Active filters:</p>
            {form.max_moq         && <p>• MOQ ≤ {Number(form.max_moq).toLocaleString()} units</p>}
            {form.max_cost        && <p>• Cost ≤ ${form.max_cost} / unit</p>}
            {form.recyclable_only && <p>• Recyclable materials only</p>}
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="w-full max-w-lg mt-6 flex gap-3">
        {/* Run Engine directly from advanced page */}
        <Button
          onClick={handleRun}
          disabled={ui.loading}
          className="flex-1 justify-center bg-emerald-600 hover:bg-emerald-500 text-white border-none"
          id="advanced-run-btn"
        >
          {ui.loading ? (
            <><span className="animate-spin mr-2">⟳</span>Running…</>
          ) : (
            '▶ Run Engine'
          )}
        </Button>

        {/* Apply & go back */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 text-sm font-medium transition-all"
          id="apply-filters-btn"
        >
          Apply & Back
        </button>

        {/* Clear all */}
        <button
          type="button"
          onClick={() => {
            setFormField('max_moq', '');
            setFormField('max_cost', '');
            setFormField('recyclable_only', false);
          }}
          className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-red-950/40 text-gray-500 hover:text-red-400 border border-gray-700 hover:border-red-800/50 text-sm transition-all"
          id="clear-filters-btn"
        >
          Clear
        </button>
      </div>

      {ui.error && (
        <p className="mt-4 w-full max-w-lg text-sm text-red-400 bg-red-950/40 border border-red-800/50 rounded-lg px-4 py-2">
          {ui.error}
        </p>
      )}
    </main>
  );
}
