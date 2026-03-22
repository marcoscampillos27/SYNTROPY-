"use client";

import { CanvasSection as CanvasSectionType } from "@/types";

interface ExportButtonProps {
  title: string;
  sections: CanvasSectionType[];
}

export default function ExportButton({
  title,
  sections,
}: ExportButtonProps) {
  const handleExport = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = 25;

    const checkNewPage = (needed: number) => {
      if (y + needed > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 25;
      }
    };

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, y);
    y += 8;

    // Date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150);
    doc.text(
      new Date().toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      margin,
      y
    );
    doc.setTextColor(0);
    y += 12;

    // Sections
    sections.forEach((section) => {
      checkNewPage(20);

      // Section title
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(section.title, margin, y);
      y += 6;

      // Section content
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const content = section.value || "(vacío)";
      const lines = doc.splitTextToSize(content, maxWidth);
      lines.forEach((line: string) => {
        checkNewPage(6);
        doc.text(line, margin, y);
        y += 5;
      });
      y += 8;
    });

    const filename = title
      .replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ ]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    doc.save(`${filename}.pdf`);
  };

  return (
    <button
      onClick={handleExport}
      title="Exportar lienzo como PDF"
      aria-label="Exportar lienzo como PDF"
      className="cursor-pointer rounded-[8px] border border-[var(--border-light)] bg-white px-[12px] py-[5px] text-[11px] font-medium text-[var(--text-secondary)] transition-all duration-150 hover:border-[var(--border)] hover:bg-[var(--bg-sidebar)]"
    >
      Exportar PDF
    </button>
  );
}
