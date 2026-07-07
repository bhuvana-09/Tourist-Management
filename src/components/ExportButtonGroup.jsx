import React, { useState } from "react";
import { backendApi as api } from "../api/axiosInstance";

export default function ExportButtonGroup({ report, from, to }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format) => {
    try {
      setExporting(true);
      const res = await api.get("/export", {
        params: {
          type: format,
          report,
          from: from || undefined,
          to: to || undefined
        },
        responseType: "blob"
      });

      // Handle raw blob response
      const blob = new Blob([res], {
        type:
          format === "csv"
            ? "text/csv"
            : format === "xlsx"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "application/pdf"
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${report}_report_${new Date().toISOString().split("T")[0]}.${format}`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export download failed:", err);
      alert("Failed to export report. Please try again later.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="inline-flex rounded-xl shadow-sm bg-slate-50 border border-slate-200 p-1 gap-1">
      <button
        onClick={() => handleExport("csv")}
        disabled={exporting}
        className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all disabled:opacity-50"
      >
        CSV
      </button>
      <div className="w-[1px] bg-slate-200 my-1"></div>
      <button
        onClick={() => handleExport("xlsx")}
        disabled={exporting}
        className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all disabled:opacity-50"
      >
        Excel
      </button>
      <div className="w-[1px] bg-slate-200 my-1"></div>
      <button
        onClick={() => handleExport("pdf")}
        disabled={exporting}
        className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all disabled:opacity-50"
      >
        PDF
      </button>
    </div>
  );
}
