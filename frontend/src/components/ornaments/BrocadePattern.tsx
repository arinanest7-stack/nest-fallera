type Props = {
  className?: string;
  opacity?: number;
};

// A subtle damask motif rendered as inline SVG so it inherits currentColor.
// Used as a low-opacity watermark on the sidebar and page corners.
export function BrocadePattern({ className, opacity = 0.08 }: Props) {
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      <defs>
        <pattern id="brocade" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="0.8">
            <path d="M40 8 C 52 20, 52 32, 40 40 C 28 32, 28 20, 40 8 Z" />
            <path d="M40 40 C 52 48, 52 60, 40 72 C 28 60, 28 48, 40 40 Z" />
            <path d="M8 40 C 20 28, 32 28, 40 40 C 32 52, 20 52, 8 40 Z" />
            <path d="M40 40 C 48 28, 60 28, 72 40 C 60 52, 48 52, 40 40 Z" />
            <circle cx="40" cy="40" r="2.2" fill="currentColor" />
            <circle cx="40" cy="8" r="1.2" fill="currentColor" />
            <circle cx="40" cy="72" r="1.2" fill="currentColor" />
            <circle cx="8" cy="40" r="1.2" fill="currentColor" />
            <circle cx="72" cy="40" r="1.2" fill="currentColor" />
          </g>
        </pattern>
      </defs>
      <rect width="200" height="200" fill="url(#brocade)" />
    </svg>
  );
}

export function BrocadeMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <path d="M16 3 C 22 9, 22 15, 16 17 C 10 15, 10 9, 16 3 Z" />
      <path d="M16 17 C 22 19, 22 25, 16 29 C 10 25, 10 19, 16 17 Z" />
      <circle cx="16" cy="17" r="1.4" fill="currentColor" />
    </svg>
  );
}
