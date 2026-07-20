export interface NetoLiquidoProps {
  neto: number;
}

export function NetoLiquido({ neto }: NetoLiquidoProps) {
  return (
    <div className="rounded-lg border-2 border-success bg-success-bg p-4 text-center">
      <p className="text-sm text-success">Salario Neto Líquido</p>
      <p className="mt-1 text-2xl font-bold text-success" role="status">
        ${neto.toFixed(2)}
      </p>
    </div>
  );
}
