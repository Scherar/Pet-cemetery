export function Candle({ size = 28, label = 'Eine Kerze brennt zum Gedenken' }: { size?: number; label?: string }) {
  return (
    <svg role="img" aria-label={label} width={size} height={size * 1.6} viewBox="0 0 20 32">
      <ellipse className="glow" cx="10" cy="9" rx="9" ry="9" fill="#ffd36b" opacity=".5" />
      <path className="flame" d="M10 1c3 4 5 6 5 9a5 5 0 0 1-10 0c0-3 2-5 5-9z" fill="#ff9d2e" />
      <path className="flame" d="M10 6c1.6 2.2 2.6 3.2 2.6 4.8a2.6 2.6 0 0 1-5.2 0C7.4 9.2 8.4 8.2 10 6z" fill="#fff0a8" />
      <rect x="6" y="15" width="8" height="15" rx="1.5" fill="#f6efe2" stroke="#d8cdb8" />
      <rect x="9.6" y="13" width="0.8" height="3" fill="#6b5a45" />
    </svg>
  );
}
