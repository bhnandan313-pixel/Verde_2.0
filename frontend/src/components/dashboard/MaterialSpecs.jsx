import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

/**
 * MaterialSpecs — detailed spec card for the top-ranked match.
 */
export function MaterialSpecs({ material }) {
  if (!material) return null;

  return (
    <Card className="border-verde-700/40">
      <h3 className="text-sm font-semibold text-verde-400 uppercase tracking-widest mb-4">
        Top Pick — Detailed Specs
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
        <Spec label="Material Name"      value={material.name} />
        <Spec label="Type"               value={material.material_type} />
        <Spec label="OTR Limit"          value={`${material.OTR_limit} cc/m²/day`} />
        <Spec label="WVTR Limit"         value={`${material.WVTR_limit} g/m²/day`} />
        <Spec label="Cost / Unit"        value={`$${material.cost_per_unit}`} />
        <Spec label="MOQ"                value={material.MOQ.toLocaleString()} />
        <Spec label="Max Moisture"       value={`${material.max_moisture_exposure}%`} />
        <Spec label="pH Range"           value={material.pH_range?.join(' – ') ?? 'N/A'} />
        <Spec label="Composite Score"    value={material.score?.toFixed(4)} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {material.recyclable && <Badge color="verde">♻ Recyclable</Badge>}
        {material.compatible_phase_states?.map((s) => (
          <Badge key={s} color="blue">{s}</Badge>
        ))}
      </div>

      {material.description && (
        <p className="mt-4 text-xs text-gray-500 italic">{material.description}</p>
      )}
    </Card>
  );
}

function Spec({ label, value }) {
  return (
    <div>
      <p className="text-gray-500 text-xs mb-0.5">{label}</p>
      <p className="text-gray-100 font-medium">{value ?? '—'}</p>
    </div>
  );
}
