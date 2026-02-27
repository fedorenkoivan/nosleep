import React, { useCallback, useState } from "react";
import { UploadCloud, FileText, CheckCircle2, X, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { api } from "../../api/client";

const MOCK_USER_ID = 1;
const PAGE_SIZE = 10;

interface ImportResult {
  message: string;
  imported: number;
  failed: number;
  errors: { id: string; reason: string }[];
  orders: { id: string; order_id: number }[];
}

function Pagination({
  total,
  page,
  pageSize,
  onPageChange,
}: {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 px-2">
      <p className="text-sm text-dark-text-secondary">
        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-md text-dark-text-secondary hover:text-white hover:bg-surface-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
              p === page
                ? "bg-accent text-white"
                : "text-dark-text-secondary hover:text-white hover:bg-surface-elevated"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-md text-dark-text-secondary hover:text-white hover:bg-surface-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function CSVImport() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "complete" | "error">("idle");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successPage, setSuccessPage] = useState(1);
  const [failedPage, setFailedPage] = useState(1);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "text/csv") {
      handleFileSelect(droppedFile);
    }
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setStatus("idle");
    setResult(null);
    setErrorMessage(null);
    setSuccessPage(1);
    setFailedPage(1);
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    setErrorMessage(null);
    try {
      const data = await api.orders.import(file, MOCK_USER_ID);
      setResult(data);
      setStatus("complete");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err?.message || "Something went wrong during import.");
    }
  };

  const removeFile = () => {
    setFile(null);
    setStatus("idle");
    setResult(null);
    setErrorMessage(null);
    setSuccessPage(1);
    setFailedPage(1);
  };

  const paginatedOrders = result?.orders.slice(
    (successPage - 1) * PAGE_SIZE,
    successPage * PAGE_SIZE
  ) ?? [];

  const paginatedErrors = result?.errors.slice(
    (failedPage - 1) * PAGE_SIZE,
    failedPage * PAGE_SIZE
  ) ?? [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Import Orders</h2>
          <p className="text-dark-text-secondary mt-1">
            Upload your CSV file to bulk import tax orders.
          </p>
        </div>
        <Button variant="secondary" onClick={() => window.open("#", "_blank")}>
          Download Template
        </Button>
      </div>

      <Card className="border-dashed border-2 border-dark-border shadow-none bg-surface">
        {!file ? (
          <div
            className={`flex flex-col items-center justify-center py-16 px-4 transition-colors duration-200 cursor-pointer ${
              isDragging ? "bg-accent-subtle border-accent" : "hover:bg-[#141414]"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <div className="w-16 h-16 bg-accent-subtle text-accent rounded-full flex items-center justify-center mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Click to upload or drag and drop
            </h3>
            <p className="text-sm text-dark-text-secondary mb-6">CSV files only (max 10MB)</p>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".csv"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            <Button variant="secondary">Select File</Button>
          </div>
        ) : (
          <div className="p-8">
            <div className="flex items-center justify-between mb-6 bg-surface-elevated p-4 rounded-lg border border-dark-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium text-white">{file.name}</p>
                  <p className="text-sm text-dark-text-secondary">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              {status !== "uploading" && (
                <button
                  onClick={removeFile}
                  className="text-dark-text-secondary hover:text-red-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {status === "idle" && (
              <div className="flex justify-end">
                <Button onClick={handleUpload} leftIcon={<UploadCloud className="w-4 h-4" />}>
                  Start Import
                </Button>
              </div>
            )}

            {status === "uploading" && (
              <div className="space-y-2">
                <p className="text-sm text-dark-text-secondary">Uploading and processing...</p>
                <div className="w-full bg-[#1A1A1A] rounded-full h-2.5 overflow-hidden">
                  <div className="bg-accent h-2.5 rounded-full animate-pulse w-full" />
                </div>
              </div>
            )}

            {status === "complete" && result && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-medium text-green-400">Import Complete</h4>
                  <p className="text-sm text-green-400/80 mt-1">
                    {result.imported} order{result.imported !== 1 ? "s" : ""} imported successfully
                    {result.failed > 0 && `, ${result.failed} failed`}.
                  </p>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-medium text-red-400">Import Failed</h4>
                  <p className="text-sm text-red-400/80 mt-1">{errorMessage}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {result && result.orders.length > 0 && (
        <Card
          title="Imported Orders"
          description={`${result.imported} orders were successfully imported.`}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#1A1A1A]">
              <thead className="bg-[#0A0A0A]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-tertiary uppercase tracking-wider">CSV ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-tertiary uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-tertiary uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-[#1A1A1A]">
                {paginatedOrders.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-elevated transition-colors">
                    <td className="px-6 py-4 text-sm text-dark-text-secondary font-mono">{row.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-white font-mono">#{row.order_id}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 ring-1 ring-inset ring-green-500/20">
                        Imported
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            total={result.orders.length}
            page={successPage}
            pageSize={PAGE_SIZE}
            onPageChange={setSuccessPage}
          />
        </Card>
      )}

      {result && result.errors.length > 0 && (
        <Card
          title="Failed Rows"
          description={`${result.failed} rows could not be imported.`}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#1A1A1A]">
              <thead className="bg-[#0A0A0A]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-tertiary uppercase tracking-wider">CSV ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-tertiary uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-tertiary uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-[#1A1A1A]">
                {paginatedErrors.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-elevated transition-colors">
                    <td className="px-6 py-4 text-sm text-dark-text-secondary font-mono">{row.id}</td>
                    <td className="px-6 py-4 text-sm text-dark-text-secondary">{row.reason}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20">
                        Failed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            total={result.errors.length}
            page={failedPage}
            pageSize={PAGE_SIZE}
            onPageChange={setFailedPage}
          />
          <div className="mt-4 flex justify-end">
            <Button variant="secondary" onClick={removeFile}>Close</Button>
          </div>
        </Card>
      )}
    </div>
  );
}