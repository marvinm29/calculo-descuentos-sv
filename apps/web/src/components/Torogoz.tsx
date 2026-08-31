export interface TorogozProps {
  className?: string;
}

export function Torogoz({ className }: TorogozProps) {
  return (
    <svg
      className={`torogoz-float ${className ?? ''}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 44 32"
      fill="none"
      aria-hidden="true"
    >
      {/* Cola larga (dorado) */}
      <path
        d="M30 16 C36 14 42 11 43 9 C41 10 37 11 32 12 Z"
        fill="var(--gold)"
        opacity="0.9"
      />
      <path
        d="M30 17 C35 16 40 14 41 13 C39 14 36 15 32 16 Z"
        fill="var(--gold)"
        opacity="0.7"
      />
      {/* Cuerpo (azul bandera) */}
      <path
        d="M10 14 C12 9 17 7 22 8 C26 9 29 12 30 16 C29 19 27 21 24 22 C20 23 15 22 12 20 C10 19 9 17 10 14 Z"
        fill="var(--accent)"
      />
      {/* Cabeza */}
      <path
        d="M22 8 C24 6 26 6 27 8 C28 9 27 11 26 12 C25 11 23 10 22 8 Z"
        fill="var(--accent)"
      />
      {/* Cresta (dorado) */}
      <path
        d="M25 6 C26 4 27 3 28 4 C27 5 26 6 25 6 Z"
        fill="var(--gold)"
      />
      {/* Raya superciliar (turquesa, característica) */}
      <path
        d="M23 8 C24 7 26 7 27 8 C26 8.5 24.5 8.5 23 8 Z"
        fill="#5fc7d4"
        opacity="0.85"
      />
      {/* Pico */}
      <path
        d="M27 10 L30 10.5 L27 11 Z"
        fill="var(--text)"
        opacity="0.7"
      />
      {/* Ojo */}
      <circle cx="25" cy="9.5" r="0.6" fill="var(--surface)" />
      {/* Rama (percha) */}
      <path
        d="M8 22 L34 22"
        stroke="var(--text-muted)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* Patas */}
      <path
        d="M16 22 L16 24 M21 22 L21 24"
        stroke="var(--text-muted)"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
