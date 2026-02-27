export type StatusType = "pending" | "completed" | "failed" | "processing";
interface StatusBadgeProps {
    status: StatusType | string;
}
export function StatusBadge({ status }: StatusBadgeProps) {
    const normalizedStatus = status.toLowerCase() as StatusType;
    const styles = {
        pending: "bg-yellow-500/10 text-yellow-400 ring-yellow-500/20",
        completed: "bg-green-500/10 text-green-400 ring-green-500/20",
        failed: "bg-red-500/10 text-red-400 ring-red-500/20",
        processing: "bg-accent-subtle text-accent ring-accent-border",
    };
    const defaultStyle = "bg-gray-500/10 text-gray-400 ring-gray-500/20";
    const selectedStyle = styles[normalizedStatus] || defaultStyle;
    return (
        <span
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${selectedStyle}`}
        >
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}
