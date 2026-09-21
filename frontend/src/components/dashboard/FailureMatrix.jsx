import { Card } from '../ui/Card';

/**
 * FailureMatrix — table showing rejected materials and why they failed.
 */
export function FailureMatrix({ failures = [] }) {
  if (failures.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-100">
        ❌ Failure Matrix
        <span className="ml-2 text-sm font-normal text-gray-400">
          ({failures.length} rejected)
        </span>
      </h2>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-left">
              <th className="px-4 py-3 font-medium">Material</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Failure Reasons</th>
            </tr>
          </thead>
          <tbody>
            {failures.map((mat, idx) => (
              <tr
                key={mat.id}
                className={`border-b border-gray-800/60 ${
                  idx % 2 === 0 ? 'bg-gray-900/40' : ''
                } hover:bg-red-950/20 transition-colors`}
              >
                <td className="px-4 py-3 font-medium text-gray-200 whitespace-nowrap">
                  {mat.name}
                </td>
                <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                  {mat.material_type}
                </td>
                <td className="px-4 py-3">
                  <ul className="space-y-1">
                    {mat.failure_reasons.map((r, i) => (
                      <li key={i} className="text-red-400 text-xs flex gap-1.5">
                        <span>•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
