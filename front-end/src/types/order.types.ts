export interface Order {
    id: string;
    lat: number;
    lon: number;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    status: "pending" | "completed" | "failed" | "processing";
    date: string;
}
