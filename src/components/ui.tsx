export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="square"
      className={className}
    >
      <path d="M2 8h11M9 3.5 13.5 8 9 12.5" />
    </svg>
  );
}

export function ArrowDown({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
      className={className}
    >
      <path d="M8 2v11M3.5 9 8 13.5 12.5 9" />
    </svg>
  );
}
