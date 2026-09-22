import React from 'react';
import { useNavigate } from 'react-router-dom';
import useEngineStore from '../store/useEngineStore';
import { runRecommendation } from '../services/api';
import { Button } from '../components/ui/Button';

export function AdvancedForm() {
  const { form } = useEngineStore();

  // Helper to update global Zustand state directly
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    useEngineStore.setState((state) => ({
      form: {
        ...state.form,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  return (
    <div className="mb-6 bg-gray-950/60 rounded-2xl border border-gray-800 animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden shadow-xl text-left">
      
      {/* ── Section 0: Product Identification ── */}
      <div className="p-5 border-b border-gray-800/80 bg-gray-900/40">
        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <span>🏷️</span> Product Identification & Name
        </h4>
        <div>
          <label className="block text-[11px] font-semibold text-gray-300 mb-1.5 uppercase tracking-wide">
            Custom Product Name (Shown in Recommendations)
          </label>
          <input
            type="text"
            name="product_name"
            placeholder="e.g. Artisanal Goat Paneer, Buffalo Mozzarella..."
            value={form.product_name || ''}
            onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 outline-none transition-colors placeholder-gray-600"
          />
          <p className="text-[10px] text-gray-500 mt-1">
            Specify a custom brand/commodity name to appear on your analysis and supplier reports.
          </p>
        </div>
      </div>

      {/* ── Section 1: Food Chemistry ── */}
      <div className="p-5 border-b border-gray-800/60">
        <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span>🧪</span> Product Chemistry
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Moisture Content</label>
            <div className="relative">
              <input
                type="number"
                name="moisture_content"
                placeholder="e.g. 55"
                min="0" max="100"
                value={form.moisture_content || ''}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 outline-none transition-colors"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-sm font-medium">%</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Oil / Fat Content</label>
            <div className="relative">
              <input
                type="number"
                name="fat_content"
                placeholder="e.g. 20"
                min="0" max="100"
                value={form.fat_content || ''}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 outline-none transition-colors"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-sm font-medium">%</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">pH Level</label>
            <input
              type="number"
              name="ph_level"
              placeholder="e.g. 6.5"
              min="0" max="14" step="0.1"
              value={form.ph_level || ''}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ── Section 2: Environment & Shelf Life ── */}
      <div className="p-5 border-b border-gray-800/60 bg-gray-900/20">
        <h4 className="text-xs font-bold text-sky-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span>⏱️</span> Shelf Life & Atmosphere
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Target Shelf Life</label>
            <div className="relative">
              <input
                type="number"
                name="desired_shelf_life"
                placeholder="e.g. 30"
                min="1"
                value={form.desired_shelf_life || ''}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 outline-none transition-colors"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-xs font-medium">Days</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Relative Humidity</label>
            <div className="relative">
              <input
                type="number"
                name="relative_humidity"
                placeholder="e.g. 80"
                min="0" max="100"
                value={form.relative_humidity || ''}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 outline-none transition-colors"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-sm font-medium">%</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Respiration Rate</label>
            <select
              name="respiration_rate"
              value={form.respiration_rate || ''}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 outline-none transition-colors appearance-none cursor-pointer"
            >
              <option value="">Select Rate...</option>
              <option value="none">None (Dead Tissue / Dairy)</option>
              <option value="low">Low (e.g. Apples, Root Veg)</option>
              <option value="medium">Medium (e.g. Tomatoes, Bananas)</option>
              <option value="high">High (e.g. Broccoli, Spinach)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Section 3: Logistics & Economics ── */}
      <div className="p-5">
        <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span>📦</span> Logistics & Supply Chain
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Transportation</label>
            <select
              name="transportation_conditions"
              value={form.transportation_conditions || ''}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 outline-none transition-colors appearance-none cursor-pointer"
            >
              <option value="">Select Mode...</option>
              <option value="standard">Standard / Ambient</option>
              <option value="reefer">Cold Chain (Reefer)</option>
              <option value="shock_absorbing">Shock-Absorbing (Fragile)</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Max MOQ</label>
            <div className="relative">
              <input
                type="number"
                name="max_moq"
                placeholder="e.g. 500"
                value={form.max_moq || ''}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 outline-none transition-colors"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-xs font-medium">Units</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Max Cost/Unit</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500 text-sm font-medium">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                name="max_cost"
                placeholder="0.00"
                value={form.max_cost || ''}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block pl-8 p-2.5 outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Recyclable Toggle */}
        <div className="pt-4 border-t border-gray-800/60">
          <label className="relative inline-flex items-center cursor-pointer group">
            <input 
              type="checkbox" 
              name="recyclable_only"
              checked={form.recyclable_only || false}
              onChange={handleChange}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 group-hover:after:scale-95"></div>
            <span className="ml-3 text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
              ♻️ Strictly Recyclable Materials Only
            </span>
          </label>
        </div>
      </div>

    </div>
  );
}

export default function AdvancedPage() {
  const navigate = useNavigate();
  const { form, ui, setResult, setLoading, setError, resetForm } = useEngineStore();

  async function handleRun() {
    if (!form.product_id && !form.product_name) {
      setError('Please select a dairy product or enter a custom product name first.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await runRecommendation({
        product_id:                form.product_id || 'custom',
        product_name:              form.product_name || undefined,
        storage_type:              form.storage_type || undefined,
        temperature_condition:     form.temperature_condition || undefined,
        moisture_content:          form.moisture_content || undefined,
        fat_content:               form.fat_content || undefined,
        ph_level:                  form.ph_level || undefined,
        desired_shelf_life:        form.desired_shelf_life || undefined,
        relative_humidity:         form.relative_humidity || undefined,
        respiration_rate:          form.respiration_rate || undefined,
        transportation_conditions: form.transportation_conditions || undefined,
        max_moq:                   form.max_moq || undefined,
        max_cost:                  form.max_cost || undefined,
        recyclable_only:           form.recyclable_only,
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
      <div className="w-full max-w-2xl mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6 cursor-pointer"
          id="back-to-home-btn"
        >
          ← Back to Engine
        </button>

        <div className="mb-2 flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Advanced Specification Engine</h1>
        </div>
        <p className="text-sm text-gray-400">
          Configure food chemistry, shelf life requirements, and supply-chain logistics for customized matching.
        </p>
      </div>

      <div className="w-full max-w-2xl">
        <AdvancedForm />

        <div className="flex flex-wrap gap-3 mt-4">
          <Button
            onClick={handleRun}
            disabled={ui.loading}
            className="flex-1 justify-center bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl shadow-lg border-none"
            id="advanced-run-btn"
          >
            {ui.loading ? (
              <><span className="animate-spin mr-2">⟳</span>Running Engine…</>
            ) : (
              '▶ Run Match Engine'
            )}
          </Button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 text-sm font-medium transition-all cursor-pointer"
          >
            Apply & Back
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="px-5 py-3 rounded-xl bg-gray-800 hover:bg-red-950/40 text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-800/50 text-sm font-medium transition-all cursor-pointer"
          >
            Reset
          </button>
        </div>

        {ui.error && (
          <p className="mt-4 text-sm text-red-400 bg-red-950/40 border border-red-800/50 rounded-xl px-4 py-3">
            {ui.error}
          </p>
        )}
      </div>
    </main>
  );
}