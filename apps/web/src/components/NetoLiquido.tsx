export interface NetoLiquidoProps {
  neto: number;
}

export function NetoLiquido({ neto }: NetoLiquidoProps) {
  return (
    <div className="glass-panel relative p-8 text-center">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full border-2 border-gold/40 bg-accent-soft">
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
        className="amount num-pop mt-2 text-5xl font-semibold text-success"
        role="status"
      >
        ${neto.toFixed(2)}
      </p>
      <p className="mt-1 text-[11px] text-text-muted">
        Bruto total − descuentos de ley
      </p>
    </div>
  );
}
