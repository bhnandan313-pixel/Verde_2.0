import { useNavigate } from 'react-router-dom';
import useEngineStore from '../store/useEngineStore';
import { Button } from '../components/ui/Button';

/**
 * ResultsDash — Route: /results
 * Page 2: Shows the recommended material specs and failure matrix.
 * A CTA button sends the user to /sourcing (Page 3).
 */
export default function ResultsDash() {
  const navigate = useNavigate();
  const { result, resetForm } = useEngineStore();

  // Guard: no result yet
  if (!result || !result.recommended_material) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
        <p className="mb-4 text-gray-400">No recommendation found. Please run the engine first.</p>
        <Button
          onClick={() => navigate('/')}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-md"
        >
          Go to Engine
        </Button>
      </div>
    );
  }

  const mat = result.recommended_material;

  const handleStartOver = () => {
    resetForm();
    navigate('/');
  };

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-12 font-sans text-gray-200 overflow-x-hidden">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ── Header ── */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-800 pb-6 gap-4">
          <div>
            <span className="text-emerald-500 font-bold tracking-wider text-sm uppercase mb-1 block">
              Optimal Packaging Match
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              {mat.name}
            </h1>
            <p className="text-gray-400 mt-2 max-w-2xl text-sm md:text-base">
              {mat.description || 'High-barrier flexible structure optimized for your selected product, shelf life, and budget.'}
            </p>
          </div>
          <Button
            onClick={handleStartOver}
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-4 py-2 rounded-md whitespace-nowrap"
          >
            ← Start Over
          </Button>
        </header>

        {/* ── Specs + Failure Matrix ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Column 1: Technical Specs */}
          <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <span>🔬</span> Technical Specs
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Target OTR:</span>
                <span className="text-white font-mono">
                  {mat.otr} <span className="text-xs text-gray-500">cc/m²/day</span>
                </span>
              </li>
              <li className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Target WVTR:</span>
                <span className="text-white font-mono">
                  {mat.wvtr} <span className="text-xs text-gray-500">g/m²/day</span>
                </span>
              </li>
              <li className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Recyclable:</span>
                <span className={mat.is_recyclable ? 'text-emerald-400' : 'text-amber-400'}>
                  {mat.is_recyclable ? 'Yes (Mono-material)' : 'No (Multi-layer)'}
                </span>
              </li>
              <li className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Est. Cost:</span>
                <span className="text-white font-mono">
                  {mat.cost_per_kg} <span className="text-xs text-gray-500">INR/kg</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Column 2 & 3: Failure Matrix */}
          <div className="lg:col-span-2 bg-red-950/20 border border-red-900/30 rounded-2xl p-6">
            <h3 className="text-red-400 font-semibold text-lg mb-4 flex items-center gap-2">
              <span>⚠️</span> Failure Mode Prediction
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              If supply chain instructions are not followed, this material is susceptible to the following spoilage risks:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(mat.failure_risks || [
                { type: 'Temperature Deviation', desc: 'If transported above 8°C, product off-gassing will cause the barrier to bloat and burst.' },
                { type: 'Physical Impact',        desc: 'High-impact drops will cause micro-punctures, breaking the vacuum seal instantly.' },
              ]).map((risk, idx) => (
                <div key={idx} className="bg-gray-900/50 border border-red-900/20 p-4 rounded-xl">
                  <h4 className="text-red-300 text-sm font-bold mb-1">{risk.type}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{risk.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA to Sourcing Page ── */}
        <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold">Ready to source this material?</p>
            <p className="text-sm text-gray-400 mt-0.5">
              Find verified manufacturers ranked by your volume, tier, and lead time.
            </p>
          </div>
          <Button
            onClick={() => navigate('/sourcing')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold whitespace-nowrap shadow-lg shadow-emerald-900/30 flex items-center gap-2"
            id="go-to-sourcing-btn"
          >
            Find Suppliers →
          </Button>
        </div>

      </div>
    </main>
  );
}
