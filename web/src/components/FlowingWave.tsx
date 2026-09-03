export const FlowingWave = () => (
  <div className="w-full overflow-hidden h-6 flex">
    <svg
      viewBox="0 0 1200 40"
      fill="none"
      className="min-w-[200%] h-full text-teal-400/70 animate-[flow_4s_linear_infinite]"
    >
      <path
        d="M0 20 Q 150 5, 300 20 T 600 20 T 900 20 T 1200 20"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>

    <style>{`
      @keyframes flow {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `}</style>
  </div>
);