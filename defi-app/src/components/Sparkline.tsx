interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function Sparkline({
  data,
  width = 60,
  height = 20,
  color,
}: SparklineProps) {
  if (!data || data.length < 2) {
    return <div className="text-slate-500 text-xs">No data</div>;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Normalize values to fit in height
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  // Determine trend color
  const first = data[0];
  const last = data[data.length - 1];
  const trendUp = last >= first;
  const lineColor = color || (trendUp ? '#22c55e' : '#ef4444'); // green-500 / red-500

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={lineColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={(data.length - 1) / (data.length - 1) * width}
        cy={height - ((last - min) / range) * height}
        r="2"
        fill={lineColor}
      />
    </svg>
  );
}
