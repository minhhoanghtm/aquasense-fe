type ProgressCircleProps = {
  title?: string;
  value: number;
  threshold: {
    min: number;
    max: number;
  };
  size: number;
  strokeWidth: number;
  status?: "normal" | "warning" | "danger";
};

const ProgressCircle = ({
  title,
  value,
  threshold,
  size,
  strokeWidth,
  status,
}: ProgressCircleProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const { min, max } = threshold;

  const progress = max > min ? ((value - min) / (max - min)) * 100 : 0;

  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  const getStrokeColor = () => {
    if (status === "danger") return "var(--critical)";
    if (status === "warning") return "var(--warning)";
    if (status === "normal") return "var(--accent)";
    return (value < min || value > max) ? "var(--critical)" : "var(--accent)";
  };

  const offset = circumference - (normalizedProgress / 100) * circumference;

  return (
    <div className="relative inline-block">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--progress-track)"
          strokeWidth={strokeWidth}
        />

        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-300 ease-in-out"
        />
      </svg>

      {/* Value */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-(--text-primary)">
        <p className="text-4xl font-semibold leading-none">{value}</p>

        {title && <p className="pt-3 text-sm text-(--text-muted)">{title}</p>}
      </div>
    </div>
  );
};

export default ProgressCircle;

