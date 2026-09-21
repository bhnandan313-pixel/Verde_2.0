import { useNavigate } from 'react-router-dom';
import useEngineStore from '../store/useEngineStore';
import { Button } from '../components/ui/Button';

/**
 * SourcingDash — Route: /sourcing
 * Page 3: Displays ranked suppliers for the recommended material,
 * with scale-based strategy messaging (Startup vs Enterprise).
 */
export default function SourcingDash() {
  const navigate  = useNavigate();
  const { form, result, resetForm } = useEngineStore();

  // Guard: must come from a completed recommendation
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

  const mat       = result.recommended_material;
  const suppliers = result.suppliers || [];
  const userMoq   = Number(form.max_moq) || 0;
  const isStartup = userMoq > 0 && userMoq < 300;

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
              Direct Sourcing
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Find Suppliers
            </h1>
            <p className="text-gray-400 mt-2 text-sm md:text-base">
              Based on your estimated volume of{' '}
              <strong className="text-white">{userMoq || 'unspecified'} units/month</strong>,
              here are the optimal suppliers for{' '}
              <strong className="text-emerald-400">{mat.name}</strong>.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              onClick={() => navigate('/results')}
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-4 py-2 rounded-md"
              id="back-to-results-btn"
            >
              ← Back
            </Button>
            <Button
              onClick={handleStartOver}
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-4 py-2 rounded-md"
              id="start-over-btn"
            >
              ⌂ Start Over
            </Button>
          </div>
        </header>

        {/* ── Scale Strategy Banner ── */}
        {isStartup ? (
          <div className="bg-blue-900/10 border border-blue-800/30 rounded-xl p-4">
            <h3 className="text-blue-400 text-sm font-semibold mb-1 flex items-center gap-2">
              <span>ℹ️</span> Startup Scale Detected
            </h3>
            <p className="text-xs text-blue-200/70">
              Primary manufacturers require high minimum orders. We have filtered your results to show{' '}
              <span className="text-white font-medium">Regional Distributors</span>{' '}
              who break bulk and sell unprinted versions of this material suitable for your scale.
            </p>
          </div>
        ) : userMoq > 0 ? (
          <div className="bg-emerald-900/10 border border-emerald-800/30 rounded-xl p-4">
            <h3 className="text-emerald-400 text-sm font-semibold mb-1 flex items-center gap-2">
              <span>🏭</span> Enterprise Scale Detected
            </h3>
            <p className="text-xs text-emerald-200/70">
              Your volume qualifies for direct-to-manufacturer pricing. We have routed you to{' '}
              <span className="text-white font-medium">Primary Converters</span>{' '}
              capable of custom printing and bulk production for this material.
            </p>
          </div>
        ) : null}

        {/* ── Supplier Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.length > 0 ? (
            suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-gray-900 border border-gray-800 p-5 rounded-xl hover:border-emerald-500/50 transition-colors flex flex-col"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">{supplier.name}</h3>
                    <span className="inline-block px-2 py-0.5 bg-gray-800 text-[10px] uppercase tracking-wider rounded text-gray-400 mt-2">
                      {supplier.tier}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-400 mb-5 space-y-1.5 flex-grow">
                  <p>📍 {supplier.location}</p>
                  <p>📦 Min. Order: <span className="text-white">{supplier.moq_kg?.toLocaleString()} units</span></p>
                  <p>⚡ Lead Time: <span className="text-white">{supplier.lead_time_days} days</span></p>
                  {supplier.certifications?.length > 0 && (
                    <p>🏅 {supplier.certifications.join(' · ')}</p>
                  )}
                </div>

                <Button
                  className="w-full bg-gray-800 hover:bg-emerald-600 text-white border border-gray-700 hover:border-emerald-500 transition-all text-sm py-2 rounded-lg"
                  onClick={() => supplier.contact_email && window.open(`mailto:${supplier.contact_email}`)}
                >
                  Request Quote
                </Button>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center border border-dashed border-gray-800 rounded-xl">
              <p className="text-gray-500 text-sm">
                No compatible suppliers found for this material at your specified scale.
              </p>
              <p className="text-gray-600 text-xs mt-2">
                Try running the engine again without an MOQ constraint.
              </p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
