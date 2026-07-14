export interface NetoLiquidoProps {
  neto: number;
}

export function NetoLiquido({ neto }: NetoLiquidoProps) {
  return (
    <div className="rounded border-2 border-green-300 bg-green-50 p-4 text-center">
      <p className="text-sm text-green-700">Salario Neto L&iacute;quido</p>
      <p className="mt-1 text-2xl font-bold text-green-800" role="status">
        ${neto.toFixed(2)}
      </p>
    </div>
  );
}
