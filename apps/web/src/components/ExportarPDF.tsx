export function ExportarPDF() {
  return (
    <button
      onClick={() => {
        window.print();
      }}
      className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-primary focus:outline-none"
    >
      Imprimir / Exportar PDF
    </button>
  );
}
