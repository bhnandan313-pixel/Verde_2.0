import { Badge } from '../ui/Badge';

/**
 * SupplierCard — Displays detailed info for a single manufacturer/supplier.
 *
 * Props:
 *   supplier  {object}  - Manufacturer record (with optional 'score' key)
 *   rank      {number}  - 1-based rank in the results list
 */
export function SupplierCard({ supplier, rank }) {
  const tierColors = { 1: 'verde', 2: 'blue', 3: 'yellow' };
  const tierLabels = { 1: 'Tier 1 · Premium', 2: 'Tier 2 · Standard', 3: 'Tier 3 · Economy' };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-4 hover:border-emerald-700/50 transition-colors shadow-lg">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-emerald-400 shrink-0">#{rank}</span>
          <div>
            <p className="font-semibold text-gray-100 text-base leading-tight">
              {supplier.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {supplier.city}, {supplier.country}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0 space-y-1">
          {supplier.score !== undefined && (
            <div>
              <p className="text-[11px] text-gray-500">Score</p>
              <p className="text-lg font-bold text-emerald-400">
                {supplier.score.toFixed(3)}
              </p>
            </div>
          )}
          <Badge color={tierColors[supplier.tier] ?? 'gray'}>
            {tierLabels[supplier.tier] ?? `Tier ${supplier.tier}`}
          </Badge>
        </div>
      </div>

      {/* Key stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <Stat label="MOQ"        value={supplier.moq?.toLocaleString()} unit="units" />
        <Stat label="Lead Time"  value={supplier.lead_time_days}          unit="days" />
        <Stat label="Cost Index" value={supplier.cost_index?.toFixed(2)}  unit="/ 1.0" />
        <Stat label="Location"   value={`${supplier.lat?.toFixed(2)}, ${supplier.lon?.toFixed(2)}`} />
      </div>

      {/* Certifications */}
      {supplier.certifications?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {supplier.certifications.map((cert) => (
            <Badge key={cert} color="gray">{cert}</Badge>
          ))}
        </div>
      )}

      {/* Contact links */}
      <div className="flex gap-4 text-xs text-gray-500 pt-1 border-t border-gray-800">
        {supplier.contact_email && (
          <a
            href={`mailto:${supplier.contact_email}`}
            className="hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            ✉ {supplier.contact_email}
          </a>
        )}
        {supplier.website && (
          <a
            href={supplier.website}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            🔗 Website
          </a>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, unit }) {
  return (
    <div>
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="text-gray-200 font-medium">
        {value ?? '—'}{unit ? <span className="text-gray-500 text-xs ml-1">{unit}</span> : null}
      </p>
    </div>
  );
}
