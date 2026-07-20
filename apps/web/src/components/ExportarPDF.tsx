export function ExportarPDF() {
  return (
    <button
      onClick={() => {
        window.print();
      }}
      className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-secondary hover:text-text focus:ring-2 focus:ring-primary focus:outline-none"
    >
      Imprimir / Exportar PDF
    </button>
  );
}
