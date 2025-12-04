import type { Filters } from '../types/pool';

const formatTvl = (value: number) => {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
};

interface ActiveFiltersProps {
  filters: Filters;
  onRemoveChain: (chain: string) => void;
  onRemoveProject: (project: string) => void;
  onRemoveToken: (token: string) => void;
  onClearTvl: () => void;
  onClearApy: () => void;
  onClearStablecoin: () => void;
  onClearSearch: () => void;
  onClearAll: () => void;
}

export function ActiveFilters({
  filters,
  onRemoveChain,
  onRemoveProject,
  onRemoveToken,
  onClearTvl,
  onClearApy,
  onClearStablecoin,
  onClearSearch,
  onClearAll,
}: ActiveFiltersProps) {
  const hasChains = filters.chains.length > 0;
  const hasProjects = filters.projects.length > 0;
  const hasTokens = filters.tokens.length > 0;
  const hasTvl = filters.tvlMin > 0 || filters.tvlMax < 10_000_000_000;
  const hasApy = filters.apyMin > 0 || filters.apyMax < 1000;
  const hasStablecoin = filters.stablecoinOnly;
  const hasSearch = filters.search.length > 0;

  const hasAnyFilter = hasChains || hasProjects || hasTokens || hasTvl || hasApy || hasStablecoin || hasSearch;

  if (!hasAnyFilter) {
    return null;
  }

  const totalFilters =
    filters.chains.length +
    filters.projects.length +
    filters.tokens.length +
    (hasTvl ? 1 : 0) +
    (hasApy ? 1 : 0) +
    (hasStablecoin ? 1 : 0) +
    (hasSearch ? 1 : 0);

  return (
    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-700">
      <span className="text-xs text-slate-500">Active filters:</span>

      {/* Search */}
      {hasSearch && (
        <Pill
          label={`"${filters.search}"`}
          colorClass="slate"
          onRemove={onClearSearch}
        />
      )}

      {/* Chains */}
      {filters.chains.map((chain) => (
        <Pill
          key={chain}
          label={chain}
          colorClass="blue"
          onRemove={() => onRemoveChain(chain)}
        />
      ))}

      {/* Projects */}
      {filters.projects.map((project) => (
        <Pill
          key={project}
          label={project}
          colorClass="green"
          onRemove={() => onRemoveProject(project)}
        />
      ))}

      {/* Tokens */}
      {filters.tokens.map((token) => (
        <Pill
          key={token}
          label={token}
          colorClass="purple"
          onRemove={() => onRemoveToken(token)}
        />
      ))}

      {/* TVL */}
      {hasTvl && (
        <Pill
          label={`TVL: ${formatTvl(filters.tvlMin)} - ${formatTvl(filters.tvlMax)}`}
          colorClass="amber"
          onRemove={onClearTvl}
        />
      )}

      {/* APY */}
      {hasApy && (
        <Pill
          label={`APY ${filters.apyMin}-${filters.apyMax}%`}
          colorClass="amber"
          onRemove={onClearApy}
        />
      )}

      {/* Stablecoin */}
      {hasStablecoin && (
        <Pill
          label="Stables only"
          colorClass="purple"
          onRemove={onClearStablecoin}
        />
      )}

      {/* Clear all */}
      {totalFilters > 1 && (
        <button
          onClick={onClearAll}
          className="ml-2 text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

interface PillProps {
  label: string;
  colorClass: 'blue' | 'green' | 'amber' | 'purple' | 'slate';
  onRemove: () => void;
}

function Pill({ label, colorClass, onRemove }: PillProps) {
  const colorStyles = {
    blue: 'bg-blue-600/20 text-blue-400 border-blue-600/40',
    green: 'bg-green-600/20 text-green-400 border-green-600/40',
    amber: 'bg-amber-600/20 text-amber-400 border-amber-600/40',
    purple: 'bg-purple-600/20 text-purple-400 border-purple-600/40',
    slate: 'bg-slate-600/20 text-slate-400 border-slate-600/40',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border ${colorStyles[colorClass]}`}
    >
      {label}
      <button
        onClick={onRemove}
        className="hover:text-white transition-colors"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}
