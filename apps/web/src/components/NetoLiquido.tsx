export interface NetoLiquidoProps {
  neto: number;
}

export function NetoLiquido({ neto }: NetoLiquidoProps) {
  return (
    <div className="tool-net p-6 text-center">
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