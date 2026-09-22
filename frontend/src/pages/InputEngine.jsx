import React from 'react';
import { useNavigate } from 'react-router-dom';
import useEngineStore from '../store/useEngineStore';
import { runRecommendation } from '../services/api';
import { ExpandOnHover } from '../components/ui/ExpandOnHover';
import { AdvancedForm } from './AdvancedPage';

// High-quality Unsplash images matched to each of the 10 dairy commodities
const PRODUCTS = [
  {
    id: 'liquid_milk',
    title: 'Liquid Milk',
    icon: '🥛',
    description: 'Liquid, pH 6.7 · OTR ≤ 20 · WVTR ≤ 10 · High temp sensitivity · 14-day shelf life.',
    image: 'https://img.magnific.com/free-photo/fresh-milk-mug-jug-wooden-table_114579-18233.jpg?ga=GA1.1.1719514440.1780728336&semt=ais_hybrid&w=740&q=80'
  },
  {
    id: 'paneer',
    title: 'Paneer',
    icon: '🧊',
    description: 'Solid, pH 6.4 · 55% moisture · OTR ≤ 40 · WVTR ≤ 5 · High barrier class.',
    image: 'https://t4.ftcdn.net/jpg/06/32/64/95/360_F_632649552_4Gi6jOlnbDllG1qyjKo53lzdFDJNDfhq.jpg'
  },
  {
    id: 'ghee',
    title: 'Ghee',
    icon: '🫙',
    description: 'Liquid fat, pH 6.5 · Ultra-low moisture · OTR ≤ 10 · Very high barrier · 270-day life.',
    image: 'https://t3.ftcdn.net/jpg/08/36/29/96/360_F_836299683_A5daipMkHhg8Y7Botq85YVy5h9wLdeGj.jpg'
  },
  {
    id: 'cheddar_cheese',
    title: 'Cheddar Cheese',
    icon: '🧀',
    description: 'Solid, pH 5.2 · OTR ≤ 10 · WVTR ≤ 5 · Very high barrier · 180-day extended life.',
    image: 'https://static.vecteezy.com/system/resources/thumbnails/074/369/862/small/cheese-board-with-a-variety-of-cheeses-and-parsley-photo.jpg'
  },
  {
    id: 'greek_yogurt',
    title: 'Greek Yogurt',
    icon: '🥣',
    description: 'Paste, pH 4.0 · 80% moisture · OTR ≤ 20 · WVTR ≤ 5 · High barrier class.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVwlY9W_Up6G3E-zq2ltAouidvEUV-uBBvyakDprUVMw&s'
  },
  {
    id: 'dahi_curd',
    title: 'Dahi / Curd',
    icon: '🥛',
    description: 'Paste, pH 4.2 · 85% moisture · OTR ≤ 20 · WVTR ≤ 5 · 10-day shelf life.',
    image: 'https://t3.ftcdn.net/jpg/02/25/36/42/360_F_225364224_q8xAwAe1MAW4ftwo6oGcnV09pEz5O9t5.jpg'
  },
  {
    id: 'table_butter',
    title: 'Table Butter',
    icon: '🧈',
    description: 'Solid fat, pH 6.3 · 16% moisture · OTR ≤ 10 · WVTR ≤ 5 · 90-day chilled.',
    image: 'https://media.istockphoto.com/id/463055765/photo/butter.jpg?s=612x612&w=0&k=20&c=EoKa3KcOKS-ZhZd0I7c5sF1pjjhf4RJ959dR7BH7XeA='
  },
  {
    id: 'mozzarella_cheese',
    title: 'Mozzarella Cheese',
    icon: '🍕',
    description: 'Solid, pH 5.3 · 52% moisture · OTR ≤ 50 · Very low WVTR ≤ 3 · 30-day life.',
    image: ' https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQg46dfLSo2DFkZzC2RwiTOgX2VejHvrKXuNvSYSCmwvlwzXLSb0fE2-db&s=10'
  },
  {
    id: 'uht_cream',
    title: 'UHT Cream',
    icon: '🫗',
    description: 'Liquid, pH 6.6 · High fat · OTR ≤ 10 · WVTR ≤ 5 · 180-day ambient shelf life.',
    image: 'https://iorganicmilk.com/cdn/shop/articles/how-to-make-curd-or-dahi-at-home-thick-curd-recipe-iorganic-by-mak-biotek.jpg?v=1660135972'
  },
  {
    id: 'whole_milk_powder',
    title: 'Whole Milk Powder',
    icon: '🌾',
    description: 'Solid powder · Ultra-high barrier · OTR ≤ 1.0 · WVTR ≤ 0.5 · 365-day life.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlknCtq0v1Mq5cPYoa9JVqaughOpDgKPhMcFKtgiSB1AmHcn_Xjo5j3SAO&s=10'
  },
];

const TEMPERATURE_OPTIONS = [
  { id: '', label: 'Any Temp', icon: '🌐' },
  { id: 'Chilled Storage', label: 'Chilled (2–6°C)', icon: '❄️' },
  { id: 'Ambient Storage', label: 'Ambient', icon: '☀️' },
  { id: 'Frozen Storage', label: 'Frozen (-18°C)', icon: '🧊' },
];

const STORAGE_OPTIONS = [
  { id: '', label: 'Any Purpose', icon: '🌐' },
  { id: 'Temporary Storage', label: 'Temporary Storage', icon: '🔄' },
  { id: 'Long-Term Storage', label: 'Long-Term Storage', icon: '⏳' },
  { id: 'Transport', label: 'Transport / Transit', icon: '🚚' },
  { id: 'Retail Display', label: 'Retail Display', icon: '🏪' },
];

export default function InputEngine() {
  const navigate = useNavigate();
  const { form, setFormField, ui, setResult, setLoading, setError, resetForm, toggleAdvancedMode } = useEngineStore();

  const handleSelectProduct = (id) => {
    useEngineStore.setState((state) => ({
      form: { ...state.form, product_id: id }
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.product_id && !form.product_name) {
      setError('Please select a dairy product from the gallery or enter a custom product name in Advanced Filters.');
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
      const msg = err?.response?.data?.error ?? err?.message ?? 'Unknown error — is the backend running?';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const activeFilters = [
    form.product_name,
    form.moisture_content,
    form.fat_content,
    form.ph_level,
    form.desired_shelf_life,
    form.relative_humidity,
    form.respiration_rate,
    form.transportation_conditions,
    form.max_moq,
    form.max_cost,
    form.recyclable_only
  ].filter(Boolean).length;

  return (
    <main className="relative min-h-screen bg-gray-950 flex flex-col items-center font-sans overflow-x-hidden">
      
      {/* ── Top Navigation ── */}
      <header className="absolute top-0 left-0 w-full px-6 py-6 flex items-center justify-between z-50">
        <div className="flex items-center justify-center p-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg transition-transform hover:scale-105 duration-300 cursor-pointer">
          <img 
            src="/Gemini_Generated_Image_mlo79lmlo79lmlo7.png" 
            alt="Verde Logo" 
            className="h-9 w-9 object-cover rounded-xl"
            onError={(e) => e.target.src = 'https://placehold.co/100x100/10b981/ffffff?text=V'}
          />
          <span className="ml-3 mr-2 font-bold text-lg tracking-wide text-white">Verde</span>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <div className="relative flex flex-col items-center text-center w-full max-w-5xl py-24 px-4 group z-10">
        {/* Hover Grid */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out"
          style={{
            backgroundImage: `linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 80% at 50% 50%, #000 20%, transparent 100%)',
            maskImage: 'radial-gradient(ellipse 70% 80% at 50% 50%, #000 20%, transparent 100%)'
          }}
        />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center justify-center w-8 h-4 bg-gray-900 rounded-full shadow-sm border border-gray-800 mb-8 transition-transform group-hover:scale-110 duration-300">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.1] drop-shadow-md">
            Food packaging is chosen by <br className="hidden sm:block" /> guesswork, <br className="block sm:hidden"/>
            <span className="text-amber-500">costing money</span> and <span className="text-emerald-500">the planet.</span>
          </h1>
          <p className="mt-6 text-gray-400 max-w-xl text-lg">Hover to explore the commodity gallery and lock in your product constraints.</p>
        </div>
      </div>

      {/* ── Expand On Hover Product Showcase ── */}
      <section className="relative w-full max-w-[1400px] mx-auto px-4 pb-12 z-20">
        <ExpandOnHover 
          items={PRODUCTS} 
          onSelect={handleSelectProduct}
          selectedId={form.product_id}
          height="h-[400px] md:h-[500px]"
        />
      </section>
{/* ── Form Actions Container ── */}
      <div className="w-full max-w-lg px-4 pb-24 relative z-20 mt-4" id="engine-form">
        <div className="w-full bg-gray-900 rounded-xl shadow-2xl shadow-black/50 border border-gray-800 p-6">
          <form onSubmit={handleSubmit} noValidate>
            
            {/* Show selection status */}
            <div className="mb-6 pb-6 border-b border-gray-800 flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Target Commodity</p>
                <p className="text-lg font-bold text-white">
                  {form.product_id ? PRODUCTS.find(p => p.id === form.product_id)?.title : 'None Selected'}
                </p>
              </div>
              {form.product_id && (
                <div className="h-10 w-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  {PRODUCTS.find(p => p.id === form.product_id)?.icon}
                </div>
              )}
            </div>

            {/* ── Open Control 1: Temperature Condition ── */}
            <div className="mb-5 pb-5 border-b border-gray-800/80 text-left">
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <span>🌡️</span> Temperature Regime
                </label>
                <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                  {TEMPERATURE_OPTIONS.find(t => t.id === form.temperature_condition)?.label || 'Any Temp'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TEMPERATURE_OPTIONS.map((opt) => {
                  const isSelected = (form.temperature_condition || '') === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormField('temperature_condition', opt.id)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/60'
                          : 'bg-gray-950/60 border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700'
                      }`}
                    >
                      <span className="text-sm shrink-0">{opt.icon}</span>
                      <span className="truncate">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Open Control 2: Storage Type ── */}
            <div className="mb-6 pb-6 border-b border-gray-800/80 text-left">
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <span>📦</span> Storage Purpose
                </label>
                <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                  {STORAGE_OPTIONS.find(s => s.id === form.storage_type)?.label || 'Any Purpose'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STORAGE_OPTIONS.map((opt) => {
                  const isSelected = (form.storage_type || '') === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormField('storage_type', opt.id)}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/60'
                          : 'bg-gray-950/60 border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700'
                      }`}
                    >
                      <span className="text-sm shrink-0">{opt.icon}</span>
                      <span className="truncate">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Collapsible Secondary Constraints ── */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400 flex items-center gap-2 font-medium">
                <span>Advanced Supply Filters</span>
                {activeFilters > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                    {activeFilters} active
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={toggleAdvancedMode}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 font-medium bg-emerald-400/10 px-3 py-1.5 rounded-full hover:bg-emerald-400/20"
              >
                {ui.advancedMode ? '▲ Hide' : '▼ Show'}
              </button>
            </div>

            {ui.advancedMode && <AdvancedForm />}

            {/* Error banner */}
            {ui.error && (
              <p className="mb-6 text-sm text-red-400 bg-red-950/40 border border-red-800/50 rounded-lg px-4 py-3 animate-in fade-in slide-in-from-top-2">
                {ui.error}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={ui.loading || (!form.product_id && !form.product_name)}
                className={`flex-1 rounded-xl font-bold text-sm flex items-center justify-center transition-all border-none py-3.5 shadow-lg ${
                  (!form.product_id && !form.product_name)
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed shadow-none' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 hover:shadow-emerald-900/60 transform hover:-translate-y-0.5 cursor-pointer'
                }`}
                id="run-engine-btn"
              >
                {ui.loading ? (
                  <><span className="animate-spin mr-2 text-lg">⟳</span>Running Engine…</>
                ) : (
                  '▶ Run Match Engine'
                )}
              </button>

              <button
                type="button"
                onClick={resetForm}
                disabled={ui.loading}
                className="px-5 py-3 rounded-xl bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors border border-gray-700 font-bold"
                title="Reset constraints"
              >
                ↺
              </button>
            </div>
          </form>
        </div>
        
        <p className="mt-8 text-center text-xs text-gray-600 font-medium">Verde 2.0 · Smart Dairy Packaging</p>
      </div>

    </main>
  );
}