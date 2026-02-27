import React, { useCallback, useState } from "react";
import { UploadCloud, FileText, CheckCircle2, X } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export function CSVImport() {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<
        "idle" | "uploading" | "complete" | "error"
    >("idle");
    const [previewData, setPreviewData] = useState<any[]>([]);
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
            // eslint-disable-next-line react-hooks/immutability
            handleFileSelect(droppedFile);
        }
    }, []);
    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setStatus("idle");
        setProgress(0);
        setPreviewData([]);
    };
    const simulateUpload = () => {
        setStatus("uploading");
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += 10;
            setProgress(currentProgress);
            if (currentProgress >= 100) {
                clearInterval(interval);
                setStatus("complete");
                // Generate mock preview data
                setPreviewData([
                    {
                        id: "IMP-001",
                        date: "2023-10-25",
                        amount: "$125.00",
                        tax: "$10.00",
                        status: "valid",
                    },
                    {
                        id: "IMP-002",
                        date: "2023-10-25",
                        amount: "$450.50",
                        tax: "$36.04",
                        status: "valid",
                    },
                    {
                        id: "IMP-003",
                        date: "2023-10-26",
                        amount: "$89.99",
                        tax: "$7.20",
                        status: "warning",
                    },
                    {
                        id: "IMP-004",
                        date: "2023-10-26",
                        amount: "$1,200.00",
                        tax: "$96.00",
                        status: "valid",
                    },
                    {
                        id: "IMP-005",
                        date: "2023-10-27",
                        amount: "$34.50",
                        tax: "$2.76",
                        status: "error",
                    },
                ]);
            }
        }, 200);
    };
    const removeFile = () => {
        setFile(null);
        setStatus("idle");
        setProgress(0);
        setPreviewData([]);
    };
    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        Import Orders
                    </h2>
                    <p className="text-dark-text-secondary mt-1">
                        Upload your CSV file to bulk import tax orders.
                    </p>
                </div>
                <Button
                    variant="secondary"
                    onClick={() => window.open("#", "_blank")}
                >
                    Download Template
                </Button>
            </div>

            <Card className="border-dashed border-2 border-dark-border shadow-none bg-surface">
                {!file ? (
                    <div
                        className={`
              flex flex-col items-center justify-center py-16 px-4 transition-colors duration-200 cursor-pointer
              ${isDragging ? "bg-accent-subtle border-accent" : "hover:bg-[#141414]"}
            `}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() =>
                            document.getElementById("file-upload")?.click()
                        }
                    >
                        <div className="w-16 h-16 bg-accent-subtle text-accent rounded-full flex items-center justify-center mb-4">
                            <UploadCloud className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                            Click to upload or drag and drop
                        </h3>
                        <p className="text-sm text-dark-text-secondary mb-6">
                            CSV files only (max 10MB)
                        </p>
                        <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept=".csv"
                            onChange={(e) =>
                                e.target.files?.[0] &&
                                handleFileSelect(e.target.files[0])
                            }
                        />
                        <Button variant="secondary">Select File</Button>
                    </div>
                ) : (
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-6 bg-surface-elevated p-4 rounded-lg border border-dark-border shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-lg flex items-center justify-center">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-medium text-white">
                                        {file.name}
                                    </p>
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
                                <Button
                                    onClick={simulateUpload}
                                    leftIcon={
                                        <UploadCloud className="w-4 h-4" />
                                    }
                                >
                                    Start Import
                                </Button>
                            </div>
                        )}

                        {status === "uploading" && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-medium text-dark-text-secondary">
                                    <span>Uploading and parsing...</span>
                                    <span className="font-mono">
                                        {progress}%
                                    </span>
                                </div>
                                <div className="w-full bg-[#1A1A1A] rounded-full h-2.5">
                                    <div
                                        className="bg-accent h-2.5 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${progress}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {status === "complete" && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-green-400">
                                        Import Successful
                                    </h4>
                                    <p className="text-sm text-green-400/80 mt-1">
                                        Successfully parsed 5 records. Please
                                        review the data below before confirming.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {previewData.length > 0 && (
                <Card
                    title="Import Preview"
                    description="Review the parsed data before finalizing the import."
                >
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[#1A1A1A]">
                            <thead className="bg-[#0A0A0A]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-tertiary uppercase tracking-wider">
                                        Import ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-tertiary uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-tertiary uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-tertiary uppercase tracking-wider">
                                        Tax
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-tertiary uppercase tracking-wider">
                                        Validation
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-surface divide-y divide-[#1A1A1A]">
                                {previewData.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="hover:bg-surface-elevated transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white font-mono">
                                            {row.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">
                                            {row.date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">
                                            {row.amount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary font-mono">
                                            {row.tax}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {row.status === "valid" && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 ring-1 ring-inset ring-green-500/20">
                                                    Valid
                                                </span>
                                            )}
                                            {row.status === "warning" && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 ring-1 ring-inset ring-yellow-500/20">
                                                    Warning
                                                </span>
                                            )}
                                            {row.status === "error" && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20">
                                                    Error
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="secondary" onClick={removeFile}>
                            Cancel
                        </Button>
                        <Button>Confirm Import</Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
