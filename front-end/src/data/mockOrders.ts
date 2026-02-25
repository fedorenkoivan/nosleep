import type { Order } from "../types/order.types";

export const mockOrders: Order[] = Array.from({ length: 50 }, (_, i) => {
    const subtotal = Math.floor(Math.random() * 500) + 50;
    const taxRate = 0.08;
    const taxAmount = Number((subtotal * taxRate).toFixed(2));
    const total = Number((subtotal + taxAmount).toFixed(2));
    const statuses: Order["status"][] = [
        "pending",
        "completed",
        "failed",
        "processing",
    ];

    return {
        id: `ORD-${1000 + i}`,
        lat: Number((34.0522 + (Math.random() - 0.5)).toFixed(4)),
        lon: Number((-118.2437 + (Math.random() - 0.5)).toFixed(4)),
        subtotal,
        taxRate,
        taxAmount,
        total,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        date: new Date(Date.now() - Math.floor(Math.random() * 1000000000))
            .toISOString()
            .split("T")[0],
    };
});
