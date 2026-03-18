export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
    >
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>

      {/* Top face */}
      <polygon
        points="50,10 90,30 50,50 10,30"
        fill="url(#grad)"
      />

      {/* Right face */}
      <polygon
        points="50,50 90,30 90,70 50,90"
        fill="#6366f1"
        opacity="0.9"
      />

      {/* Left face */}
      <polygon
        points="50,50 10,30 10,70 50,90"
        fill="#8b5cf6"
        opacity="0.9"
      />
    </svg>
  )
}