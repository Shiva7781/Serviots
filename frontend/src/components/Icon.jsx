// Minimal stroke-based icon set (24x24, inherits color via currentColor) so
// the app doesn't need an icon-library dependency for ~25 fixed glyphs.
const PATHS = {
  building: 'M4 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16 M12 21V9a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v12 M4 21h16 M7 8h1 M7 11h1 M7 14h1 M15 12h1 M15 15h1',
  grid: 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z',
  calendar: 'M4 5h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z M16 3v4 M8 3v4 M3 10h18',
  shield: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z',
  'log-out': 'M10 17l5-5-5-5 M15 12H3 M14 3h5a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-5',
  'log-in': 'M14 7l-5 5 5 5 M4 12h11 M10 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5',
  'user-plus': 'M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M2 21c0-4 3-6 6-6s6 2 6 6 M18 8v6 M15 11h6',
  menu: 'M3 6h18 M3 12h18 M3 18h18',
  x: 'M18 6L6 18 M6 6l12 12',
  desk: 'M3 19V7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v12 M3 19h18 M7 19v-3h10v3',
  users: 'M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2 M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  'map-pin': 'M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.3-4.3',
  filter: 'M4 5h16 M7 12h10 M10 19h4',
  plus: 'M12 5v14 M5 12h14',
  pencil: 'M3 21l3.6-.8L20 6.8a2 2 0 0 0 0-2.8l-2-2a2 2 0 0 0-2.8 0L2.8 15.4 2 21z M15 5l4 4',
  trash: 'M4 7h16 M9 7V4h6v3 M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13 M10 11v6 M14 11v6',
  check: 'M20 6L9 17l-5-5',
  'check-circle': 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M8 12l3 3 5-6',
  'x-circle': 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M9.5 9.5l5 5 M14.5 9.5l-5 5',
  ban: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M6 6l12 12',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 3',
  wrench: 'M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4L20 7l-3-3z',
  'chevron-left': 'M15 18l-6-6 6-6',
  'chevron-right': 'M9 18l6-6-6-6',
  'arrow-left': 'M19 12H5 M12 19l-7-7 7-7',
  zap: 'M13 2L4 14h6l-1 8 9-12h-6z',
  monitor: 'M3 4h18v12H3z M8 20h8 M12 16v4',
  image: 'M4 4h16v16H4z M9 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M5 18l5-5 3 3 4-5 3 3v4',
  video: 'M4 6h11v12H4z M15 10l5-3v10l-5-3z',
  coffee: 'M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z M17 9h1a3 3 0 0 1 0 6h-1 M7 2v2 M10 2v2 M13 2v2',
  'volume-x': 'M5 9v6h4l5 4V5l-5 4z M17 9l4 6 M21 9l-4 6',
  armchair: 'M5 12V7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v5 M5 12a2 2 0 0 0-2 2v3h18v-3a2 2 0 0 0-2-2 M5 12h14 M6 20v-3 M18 20v-3',
  tag: 'M20.6 12.6L12 21.2 2.8 12 2.8 2.8 12 2.8z M7 7h.01',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  'eye-off': 'M3 3l18 18 M10.6 10.6a3 3 0 0 0 4.24 4.24 M9.4 5.5A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a13.4 13.4 0 0 1-3.1 3.9 M6.2 6.6A13.7 13.7 0 0 0 2 12s3.5 7 10 7a10.4 10.4 0 0 0 4.2-.9',
};

export default function Icon({ name, size = 16, className = '', ...rest }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {d.split(' M').map((seg, i) => (
        <path key={i} d={i === 0 ? seg : 'M' + seg} />
      ))}
    </svg>
  );
}
