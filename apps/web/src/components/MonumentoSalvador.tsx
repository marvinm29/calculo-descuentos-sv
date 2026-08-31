export interface MonumentoSalvadorProps {
  className?: string;
}

export function MonumentoSalvador({ className }: MonumentoSalvadorProps) {
  return (
    <svg
      className={`monumento-trazo ${className ?? ''}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 64"
      fill="none"
      aria-hidden="true"
    >
      {/* Globo terráqueo (esfera superior) */}
      <circle cx="24" cy="16" r="8" stroke="var(--accent)" strokeWidth="1.5" />
      <path
        d="M16 16 C20 14 28 14 32 16"
        stroke="var(--accent)"
        strokeWidth="1"
        opacity="0.6"
      />
      <path
        d="M24 8 C22 12 22 20 24 24"
        stroke="var(--accent)"
        strokeWidth="1"
        opacity="0.5"
      />
      {/* Figura (Cristo) sobre el globo — silueta simplificada */}
      <path
        d="M22 14 L22 10 C22 9 23 9 24 9 C25 9 26 9 26 10 L26 14"
        stroke="var(--accent)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Brazos extendidos */}
      <path
        d="M20 12 L16 13 M28 12 L32 13"
        stroke="var(--accent)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Cabeza */}
      <circle cx="24" cy="7" r="1.5" stroke="var(--accent)" strokeWidth="1" />
      {/* Pedestal (columna) */}
      <path
        d="M18 24 L18 54 L30 54 L30 24"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Base ancha */}
      <path
        d="M14 54 L34 54"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 58 L36 58"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Detalles del pedestal (líneas horizontales) */}
      <path
        d="M19 30 L29 30 M19 40 L29 40 M19 48 L29 48"
        stroke="var(--gold)"
        strokeWidth="0.8"
        opacity="0.5"
      />
      {/* Cruz sobre la cabeza (detalle) */}
      <path
        d="M24 4 L24 6 M23 5 L25 5"
        stroke="var(--gold)"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
