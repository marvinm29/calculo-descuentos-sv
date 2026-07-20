export interface NetoLiquidoProps {
  neto: number;
}

export function NetoLiquido({ neto }: NetoLiquidoProps) {
  return (
    <div className="glass-card rounded-2xl border-primary/20 p-6 text-center">
      <p className="text-sm font-medium text-text-secondary">
        Salario Neto Líquido
      </p>
      <p
        className="mt-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-3xl font-bold text-transparent animate-glow-pulse"
        role="status"
      >
        ${neto.toFixed(2)}
      </p>
    </div>
  );
}
