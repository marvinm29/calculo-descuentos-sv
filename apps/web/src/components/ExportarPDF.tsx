export function ExportarPDF() {
  return (
    <button
      onClick={() => {
        window.print();
      }}
      className="tool-card px-4 py-2 text-sm font-medium text-text-secondary hover:text-text"
    >
      Imprimir / Exportar PDF
    </button>
  );
}
