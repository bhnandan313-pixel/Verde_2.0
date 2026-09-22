import React from 'react';
import { useNavigate } from 'react-router-dom';
import useEngineStore from '../store/useEngineStore';
import { runRecommendation } from '../services/api';
import { ExpandOnHover } from '../components/ui/ExpandOnHover';

// We use high-quality Unsplash images for the backgrounds to make the gallery pop
const PRODUCTS = [
  { 
    id: 'whole_milk', 
    title: 'Whole Milk', 
    icon: '🥛', 
    description: 'Liquid, pH 6.7. Requires OTR ≤ 50 & high temp control for 14-day life.',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=1200&auto=format&fit=crop'
  },
  { 
    id: 'cheddar_cheese', 
    title: 'Cheddar Cheese', 
    icon: '🧀', 
    description: 'Solid phase. Strict OTR ≤ 5 needed for 180-day extended shelf life.',
    image: 'https://www.tastingtable.com/img/gallery/the-small-difference-between-colby-cheese-and-cheddar-cheese/l-intro-1666287343.jpg'
  },
  { 
    id: 'butter', 
    title: 'Butter', 
    icon: '🧈', 
    description: 'Semi-solid. Ultra-low WVTR (2.0) needed to prevent moisture loss and oxidation.',
    image: 'https://www.shutterstock.com/image-photo/fresh-butter-slices-on-wooden-600nw-2568593227.jpg'
  },
  { 
    id: 'yogurt', 
    title: 'Yogurt', 
    icon: '🥣', 
    description: 'Fermented (pH 4.2). Moderate barrier (OTR 30) for 21-day life.',
    image: 'https://www.littlehomeinthemaking.com/wp-content/uploads/2023/01/strainingwheySCALED-8-of-9.jpg'
  },
  { 
    id: 'cream_cheese', 
    title: 'Cream Cheese', 
    icon: '🥯', 
    description: '54% moisture. Requires strict WVTR (6.0) for 30-day chilled preservation.',
    image: 'https://images.unsplash.com/photo-1634487359989-3e90c9432133?q=80&w=1200&auto=format&fit=crop'
  }
];

export default function InputEngine() {
  const navigate = useNavigate();
  const { form, ui, setResult, setLoading, setError, resetForm, toggleAdvancedMode } = useEngineStore();

  const handleSelectProduct = (id) => {
    useEngineStore.setState((state) => ({
      form: { ...state.form, product_id: id }
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.product_id) {
      setError('Please select a dairy product from the gallery before running the engine.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await runRecommendation({
        product_id: form.product_id,
        max_moq: form.max_moq || undefined,
        max_cost: form.max_cost || undefined,
        recyclable_only: form.recyclable_only,
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

  const activeFilters = [form.max_moq, form.max_cost, form.recyclable_only].filter(Boolean).length;

  return (
    <main className="relative min-h-screen bg-gray-950 flex flex-col items-center font-sans overflow-x-hidden">
      
      {/* ── Top Navigation ── */}
      <header className="absolute top-0 left-0 w-full px-6 py-6 flex items-center justify-between z-50">
        <div className="flex items-center justify-center p-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg transition-transform hover:scale-105 duration-300 cursor-pointer">
          <img 
            src="/ChatGPT Image Sep 20, 2026, 05_13_56 PM.png" 
            alt="Verde Logo" 
            className="h-10 w-10 object-cover rounded-xl"
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
                <div className="h-10 w-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-xl">
                  {PRODUCTS.find(p => p.id === form.product_id)?.icon}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">Additional Constraints</span>
              <button
                type="button"
                onClick={toggleAdvancedMode}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 font-medium bg-emerald-400/10 px-3 py-1.5 rounded-full"
              >
                {ui.advancedMode ? '▲ Hide Filters' : '▼ Show Filters'}
              </button>
            </div>

            {ui.advancedMode && (
              <div className="mb-6 p-4 bg-gray-950 rounded-xl border border-gray-800 text-gray-400 text-sm italic text-center border-dashed">
                Advanced forms (MOQ, max cost) will mount here...
              </div>
            )}

            {/* Error banner */}
            {ui.error && (
              <p className="mb-6 text-sm text-red-400 bg-red-950/40 border border-red-800/50 rounded-lg px-4 py-3">
                {ui.error}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={ui.loading || !form.product_id}
                className={`flex-1 rounded-lg font-semibold text-sm flex items-center justify-center transition-colors border-none py-3 shadow-lg ${
                  !form.product_id 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed shadow-none' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                }`}
                id="run-engine-btn"
              >
                {ui.loading ? (
                  <><span className="animate-spin mr-2">⟳</span>Running…</>
                ) : (
                  '▶ Run Engine'
                )}
              </button>

              <button
                type="button"
                onClick={resetForm}
                disabled={ui.loading}
                className="px-5 py-3 rounded-xl bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors border border-gray-700"
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