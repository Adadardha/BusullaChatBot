type CompassLogoProps = {
  className?: string;
};
 
export function CompassLogo({ className }: CompassLogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 4.5l3.4 6.8L12 9.8l-3.4 1.5L12 4.5z" fill="currentColor" stroke="none" />
      <path
        d="M12 19.5l-3.4-6.8L12 14.2l3.4-1.5L12 19.5z"
        fill="currentColor"
        opacity="0.7"
        stroke="none"
      />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}
