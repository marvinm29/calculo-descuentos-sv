import { useEffect, useState } from 'react';

export interface NetoLiquidoProps {
  neto: number;
}

// FE-18 (diseno-calculadora-clara.md § Anuncios): la cifra visible siempre
// refleja el cálculo inmediato; el anuncio a lectores de pantalla ocurre solo
// cuando el valor se estabiliza (debounce 800 ms), no en cada pulsación.
export function NetoLiquido({ neto }: NetoLiquidoProps) {
  const [anuncio, setAnuncio] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setAnuncio(`Salario neto líquido: $${neto.toFixed(2)}`);
    }, 800);
    return () => clearTimeout(t);
  }, [neto]);

  return (
    <div className="result-card relative p-8 text-center">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full border-2 border-success/30 bg-primary-soft">
        <svg
          className="size-8 text-success"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 10l3 3l7-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="text-[13px] font-medium text-text-secondary">
        Salario Neto Líquido
      </p>
      <p
        key={neto}
        data-testid="neto-liquido"
        className="amount num-pop mt-2 text-5xl font-semibold text-success"
      >
        ${neto.toFixed(2)}
      </p>
      <p aria-live="polite" className="sr-only">
        {anuncio}
      </p>
      <p className="mt-1 text-[11px] text-text-muted">
        Bruto total − descuentos de ley
      </p>
    </div>
  );
}
