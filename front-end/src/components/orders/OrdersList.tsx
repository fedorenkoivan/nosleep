import { useMemo, useState, Fragment } from "react";
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    Download,
    ChevronDown,
    MapPin,
    Receipt,
    Hash,
    Calendar,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { StatusBadge } from "../ui/StatusBadge";
import { mockOrders } from "../../data/mockOrders";
import type { Order } from "../../types/order.types";

export function OrdersList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [sortConfig, setSortConfig] = useState<{
        key: keyof Order;
        direction: "asc" | "desc";
    } | null>(null);
    const itemsPerPage = 10;
    const toggleRow = (id: string) => {
        setExpandedRows((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };
    const filteredOrders = useMemo(() => {
        let result = [...mockOrders];
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(
                (order) =>
                    order.id.toLowerCase().includes(lowerTerm) ||
                    order.total.toString().includes(lowerTerm),
            );
        }
        if (statusFilter !== "all") {
            result = result.filter((order) => order.status === statusFilter);
        }
        if (sortConfig) {
            result.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key])
                    return sortConfig.direction === "asc" ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key])
                    return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [searchTerm, statusFilter, sortConfig]);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );
    const handleSort = (key: keyof Order) => {
        let direction: "asc" | "desc" = "asc";
        if (
            sortConfig &&
            sortConfig.key === key &&
            sortConfig.direction === "asc"
        ) {
            direction = "desc";
        }
        setSortConfig({
            key,
            direction,
        });
    };
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        Orders List
                    </h2>
                    <p className="text-dark-text-secondary mt-1">
                        Manage and track all tax orders in the system.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        leftIcon={<Download className="w-4 h-4" />}
                    >
                        Export
                    </Button>
                    <Button
                        variant="secondary"
                        leftIcon={<Filter className="w-4 h-4" />}
                    >
                        Advanced Filter
                    </Button>
                </div>
            </div>

            <Card className="p-0 overflow-hidden">
                <div className="p-4 border-b border-dark-border bg-[#0A0A0A] flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-[#444444]" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by Order ID or Amount..."
                            className="pl-10 block w-full rounded-md bg-surface border-dark-border text-white placeholder-[#555555] shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 border"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-sm text-dark-text-tertiary whitespace-nowrap">
                            Status:
                        </span>
                        <select
                            className="block w-full rounded-md bg-surface border-dark-border text-white shadow-sm focus:border-accent focus:ring-accent sm:text-sm py-2 border"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="processing">Processing</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-[#0A0A0A]">
                            <tr className="border-b border-[#1A1A1A]">
                                <th className="px-4 py-3 w-8"></th>
                                {[
                                    {
                                        key: "id",
                                        label: "Order ID",
                                    },
                                    {
                                        key: "date",
                                        label: "Date",
                                    },
                                    {
                                        key: "lat",
                                        label: "Location",
                                    },
                                    {
                                        key: "subtotal",
                                        label: "Subtotal",
                                    },
                                    {
                                        key: "taxAmount",
                                        label: "Tax",
                                    },
                                    {
                                        key: "total",
                                        label: "Total",
                                    },
                                    {
                                        key: "status",
                                        label: "Status",
                                    },
                                ].map((col) => (
                                    <th
                                        key={col.key}
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-[#444444] uppercase tracking-wider cursor-pointer hover:bg-[#141414] transition-colors"
                                        onClick={() =>
                                            handleSort(col.key as keyof Order)
                                        }
                                    >
                                        <div className="flex items-center gap-1">
                                            {col.label}
                                            <ArrowUpDown className="w-3 h-3" />
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-surface">
                            {paginatedOrders.length > 0 ? (
                                paginatedOrders.map((order) => {
                                    const isExpanded = expandedRows.has(
                                        order.id,
                                    );
                                    return (
                                        <Fragment key={order.id}>
                                            {/* Main row */}
                                            <tr
                                                className={`border-b border-[#1A1A1A] transition-colors ${isExpanded ? "bg-[#111111]" : "hover:bg-surface-elevated"}`}
                                            >
                                                {/* Expand toggle */}
                                                <td className="px-4 py-4 w-8">
                                                    <button
                                                        onClick={() =>
                                                            toggleRow(order.id)
                                                        }
                                                        className="text-[#444444] hover:text-accent transition-colors"
                                                        aria-label={
                                                            isExpanded
                                                                ? "Collapse row"
                                                                : "Expand row"
                                                        }
                                                    >
                                                        <ChevronDown
                                                            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180 text-accent" : ""}`}
                                                        />
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-accent font-mono">
                                                    {order.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#666666]">
                                                    {order.date}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#666666] font-mono">
                                                    <div className="flex flex-col text-xs">
                                                        <span>
                                                            Lat: {order.lat}
                                                        </span>
                                                        <span>
                                                            Lon: {order.lon}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">
                                                    ${order.subtotal.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary font-mono">
                                                    $
                                                    {order.taxAmount.toFixed(2)}{" "}
                                                    <span className="text-xs text-dark-text-tertiary">
                                                        (
                                                        {(
                                                            order.taxRate * 100
                                                        ).toFixed(0)}
                                                        %)
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white font-mono">
                                                    ${order.total.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusBadge
                                                        status={order.status}
                                                    />
                                                </td>
                                            </tr>

                                            {/* Expanded details row */}
                                            {isExpanded && (
                                                <tr className="border-b border-[#1A1A1A] bg-[#0A0A0A]">
                                                    <td
                                                        colSpan={8}
                                                        className="px-0 py-0"
                                                    >
                                                        <div className="px-8 py-5 border-l-2 border-accent ml-4">
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                                {/* Order Info */}
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center gap-2 text-[#444444] text-xs uppercase tracking-wider font-medium mb-3">
                                                                        <Hash className="w-3 h-3" />
                                                                        Order
                                                                        Info
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-[#555555] mb-0.5">
                                                                            Order
                                                                            ID
                                                                        </p>
                                                                        <p className="text-sm text-white font-mono">
                                                                            {
                                                                                order.id
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-[#555555] mb-0.5">
                                                                            Date
                                                                        </p>
                                                                        <p className="text-sm text-white">
                                                                            {
                                                                                order.date
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-[#555555] mb-0.5">
                                                                            Status
                                                                        </p>
                                                                        <StatusBadge
                                                                            status={
                                                                                order.status
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Location */}
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center gap-2 text-[#444444] text-xs uppercase tracking-wider font-medium mb-3">
                                                                        <MapPin className="w-3 h-3" />
                                                                        Location
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-[#555555] mb-0.5">
                                                                            Latitude
                                                                        </p>
                                                                        <p className="text-sm text-white font-mono">
                                                                            {
                                                                                order.lat
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-[#555555] mb-0.5">
                                                                            Longitude
                                                                        </p>
                                                                        <p className="text-sm text-white font-mono">
                                                                            {
                                                                                order.lon
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-[#555555] mb-0.5">
                                                                            Coordinates
                                                                        </p>
                                                                        <p className="text-xs text-[#666666] font-mono">
                                                                            {
                                                                                order.lat
                                                                            }
                                                                            ,{" "}
                                                                            {
                                                                                order.lon
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Tax Breakdown */}
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center gap-2 text-[#444444] text-xs uppercase tracking-wider font-medium mb-3">
                                                                        <Receipt className="w-3 h-3" />
                                                                        Tax
                                                                        Breakdown
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-[#555555] mb-0.5">
                                                                            Subtotal
                                                                        </p>
                                                                        <p className="text-sm text-white font-mono">
                                                                            $
                                                                            {order.subtotal.toFixed(
                                                                                2,
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-[#555555] mb-0.5">
                                                                            Tax
                                                                            Rate
                                                                        </p>
                                                                        <p className="text-sm text-white font-mono">
                                                                            {(
                                                                                order.taxRate *
                                                                                100
                                                                            ).toFixed(
                                                                                1,
                                                                            )}
                                                                            %
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-[#555555] mb-0.5">
                                                                            Tax
                                                                            Amount
                                                                        </p>
                                                                        <p className="text-sm text-[#888888] font-mono">
                                                                            $
                                                                            {order.taxAmount.toFixed(
                                                                                2,
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Total */}
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center gap-2 text-[#444444] text-xs uppercase tracking-wider font-medium mb-3">
                                                                        <Calendar className="w-3 h-3" />
                                                                        Summary
                                                                    </div>
                                                                    <div className="bg-[#141414] rounded-lg p-4 border border-[#222222]">
                                                                        <p className="text-xs text-[#555555] mb-1">
                                                                            Total
                                                                            Due
                                                                        </p>
                                                                        <p className="text-2xl font-bold text-accent font-mono">
                                                                            $
                                                                            {order.total.toFixed(
                                                                                2,
                                                                            )}
                                                                        </p>
                                                                        <p className="text-xs text-[#444444] mt-2">
                                                                            Incl.
                                                                            $
                                                                            {order.taxAmount.toFixed(
                                                                                2,
                                                                            )}{" "}
                                                                            tax
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-6 py-12 text-center text-dark-text-tertiary"
                                    >
                                        No orders found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="bg-[#0A0A0A] px-4 py-3 border-t border-[#1A1A1A] flex items-center justify-between sm:px-6">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-[#666666]">
                                Showing{" "}
                                <span className="font-medium text-white">
                                    {(currentPage - 1) * itemsPerPage + 1}
                                </span>{" "}
                                to{" "}
                                <span className="font-medium text-white">
                                    {Math.min(
                                        currentPage * itemsPerPage,
                                        filteredOrders.length,
                                    )}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium text-white">
                                    {filteredOrders.length}
                                </span>{" "}
                                results
                            </p>
                        </div>
                        <div>
                            <nav
                                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                aria-label="Pagination"
                            >
                                <button
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.max(1, p - 1),
                                        )
                                    }
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-dark-border bg-surface text-sm font-medium text-[#666666] hover:bg-surface-elevated disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    />
                                </button>
                                {Array.from(
                                    {
                                        length: totalPages,
                                    },
                                    (_, i) => i + 1,
                                ).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page ? "z-10 bg-accent-subtle border-accent text-accent" : "bg-surface border-dark-border text-[#666666] hover:bg-surface-elevated"}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.min(totalPages, p + 1),
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-dark-border bg-surface text-sm font-medium text-[#666666] hover:bg-surface-elevated disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRight
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                    />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
