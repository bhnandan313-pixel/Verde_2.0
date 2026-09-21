import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

/**
 * ResultsPanel — displays the ranked list of matching packaging materials.
 */
export function ResultsPanel({ matches = [], product }) {
  if (matches.length === 0) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-400 text-sm">No matching materials found for the current filters.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-100">
        ✅ Matched Materials
        <span className="ml-2 text-sm font-normal text-gray-400">
          ({matches.length} result{matches.length !== 1 ? 's' : ''} for {product?.name})
        </span>
      </h2>

      {matches.map((mat, idx) => (
        <Card key={mat.id} className="flex flex-col gap-3 hover:border-verde-700/60 transition-colors">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-verde-400">#{idx + 1}</span>
              <div>
                <p className="font-semibold text-gray-100">{mat.name}</p>
                <p className="text-xs text-gray-500">{mat.material_type}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm text-gray-400">Score</p>
              <p className="text-xl font-bold text-verde-400">{mat.score.toFixed(3)}</p>
            </div>
          </div>

          {/* Specs row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <Stat label="Cost/unit" value={`$${mat.cost_per_unit}`} />
            <Stat label="MOQ" value={mat.MOQ.toLocaleString()} />
            <Stat label="OTR limit" value={`${mat.OTR_limit} cc/m²/day`} />
            <Stat label="WVTR limit" value={`${mat.WVTR_limit} g/m²/day`} />
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap gap-2">
            {mat.recyclable && <Badge color="verde">♻ Recyclable</Badge>}
            {mat.compatible_phase_states.map((s) => (
              <Badge key={s} color="blue">{s}</Badge>
            ))}
          </div>

          {/* Description */}
          {mat.description && (
            <p className="text-xs text-gray-500 italic">{mat.description}</p>
          )}
        </Card>
      ))}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="text-gray-200 font-medium">{value}</p>
    </div>
  );
}
