import { useState } from 'react';
import { InfoButton } from './InfoButton';
import { InfoModal } from './InfoModal';
import { getMetricInfo, type MetricType } from '../utils/metricInfo';
import type { Pool, CalculatedMetrics } from '../types/pool';

interface MetricInfoProps {
  metric: MetricType;
  value?: any;
  pool?: Pool;
  metrics?: CalculatedMetrics;
  isNewPool?: boolean;
}

export function MetricInfo({ metric, value, pool, metrics, isNewPool }: MetricInfoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetailed, setShowDetailed] = useState(false);

  const info = getMetricInfo(metric, value, pool, metrics, isNewPool);

  return (
    <>
      <InfoButton onClick={() => setIsOpen(true)} />
      <InfoModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setShowDetailed(false);
        }}
        title={info.title}
      >
        <div className="space-y-3">
          {/* Brief explanation */}
          <p>{info.brief}</p>

          {/* Contextual interpretation if available */}
          {info.interpretation && (
            <div className="bg-slate-900/50 rounded p-3 border-l-2 border-blue-400">
              <div className="text-xs text-blue-400 mb-1 font-medium">Your value</div>
              <p className="text-slate-200">{info.interpretation}</p>
            </div>
          )}

          {/* Learn more toggle */}
          {info.detailed && (
            <>
              <button
                onClick={() => setShowDetailed(!showDetailed)}
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
              >
                {showDetailed ? '− Less details' : '+ Learn more'}
              </button>

              {showDetailed && (
                <div className="text-slate-400 text-sm whitespace-pre-line border-t border-slate-700 pt-3 mt-2">
                  {info.detailed}
                </div>
              )}
            </>
          )}
        </div>
      </InfoModal>
    </>
  );
}
