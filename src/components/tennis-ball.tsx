// Club mark: a tennis ball. Decorative, so hidden from screen readers.
export function TennisBall({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 38 38" aria-hidden="true" className="shrink-0">
      <circle cx="19" cy="19" r="17" fill="#d8ec4a" />
      <path
        d="M7 8.5c5.5 5.5 5.5 15.5 0 21M31 8.5c-5.5 5.5-5.5 15.5 0 21"
        stroke="#fff"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
