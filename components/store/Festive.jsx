/* Seasonal decorations. Positions, colours and timings come from a small seeded generator
   so server and browser render exactly the same markup (no hydration mismatch).
   Everything here is decorative: aria-hidden and pointer-events: none. */

const COLORS = ["red", "gold", "green", "ice", "warm"];

// deterministic 0..1 sequence
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const SEGMENTS = 36;
const SAG = 14; // px the wire dips between hooks

/* Garland along the header's bottom edge: a scalloped wire with a bulb at the low point of
   every loop, plus short "curtain" strands of tiny LEDs hanging from each hook. */
export function HeaderLights() {
  const rand = seeded(7);
  const wire = Array.from({ length: SEGMENTS }, (_, i) => {
    const x0 = (i / SEGMENTS) * 1000;
    const x1 = ((i + 1) / SEGMENTS) * 1000;
    return `M${x0},3 Q${(x0 + x1) / 2},${3 + SAG * 2} ${x1},3`;
  }).join(" ");

  return (
    <div className="fx-lights" aria-hidden="true">
      <svg className="fx-wire" viewBox="0 0 1000 34" preserveAspectRatio="none">
        <path d={wire} vectorEffect="non-scaling-stroke" />
      </svg>

      {Array.from({ length: SEGMENTS }, (_, i) => (
        <span
          key={`b${i}`}
          className={`fx-bulb fx-${COLORS[i % COLORS.length]}`}
          style={{
            left: `${((i + 0.5) / SEGMENTS) * 100}%`,
            top: `${3 + SAG - 1}px`,
            "--d": `${(rand() * 2.4).toFixed(2)}s`,
            "--t": `${(1.6 + rand() * 1.8).toFixed(2)}s`,
          }}
        />
      ))}

      {Array.from({ length: SEGMENTS + 1 }, (_, i) => {
        const len = 22 + Math.round(rand() * 44);
        return (
          <span
            key={`s${i}`}
            className={`fx-strand fx-${COLORS[(i + 2) % COLORS.length]}`}
            style={{
              left: `${(i / SEGMENTS) * 100}%`,
              height: `${len}px`,
              "--d": `${(rand() * 3).toFixed(2)}s`,
              "--t": `${(2 + rand() * 2).toFixed(2)}s`,
            }}
          />
        );
      })}
    </div>
  );
}

/* Small Santa hat perched on the top-left corner of the logo */
export function SantaHat() {
  return (
    <svg className="fx-hat" viewBox="0 0 64 56" aria-hidden="true">
      <path d="M8 40 C14 20 30 4 50 6 C58 7 60 16 56 24 C52 18 46 16 42 20 C38 26 40 34 44 40 Z" fill="#c8151c" />
      <path d="M8 40 C14 20 30 4 50 6 C44 10 34 20 30 40 Z" fill="#e42a31" />
      <rect x="2" y="36" width="48" height="12" rx="6" fill="#fff" />
      <rect x="2" y="36" width="48" height="12" rx="6" fill="url(#fx-fur)" />
      <circle cx="56" cy="26" r="7" fill="#fff" />
      <defs>
        <linearGradient id="fx-fur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#d9dde3" stopOpacity="0.9" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* Gentle snowfall overlay for dark or photo backgrounds */
export function Snowfall({ count = 36 }) {
  const rand = seeded(23);
  return (
    <div className="fx-snow" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const size = 3 + rand() * 6;
        return (
          <span
            key={i}
            style={{
              left: `${(rand() * 100).toFixed(2)}%`,
              width: `${size.toFixed(1)}px`,
              height: `${size.toFixed(1)}px`,
              opacity: (0.45 + rand() * 0.5).toFixed(2),
              "--drift": `${Math.round(-30 + rand() * 60)}px`,
              "--t": `${(7 + rand() * 9).toFixed(2)}s`,
              "--d": `${(-rand() * 16).toFixed(2)}s`,
            }}
          />
        );
      })}
    </div>
  );
}
