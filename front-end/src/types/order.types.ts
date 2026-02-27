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

export interface CreateOrderRequest {
    user_id: number;
    subtotal: number;
    longitude: number;
    latitude: number;
}

export interface TaxCalculation {
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    tax_breakdown: {
        composite_tax_rate: string;
        state_rate: string;
        state_tax: number;
        county_rate: string;
        county_tax: number;
        city_rate: string;
        city_tax: number;
        special_rates: string;
        special_tax: number;
    };
    jurisdictions: {
        applied_level: string;
        applied_name: string;
        city: string | null;
        county: string | null;
    };
    location: {
        coordinates: {
            longitude: number;
            latitude: number;
        };
    };
}

export interface OrderResponse {
    message: string;
    order: {
        id: number;
        user_id: number;
        subtotal: string;
        longitude: string;
        latitude: string;
        tax_rate: string;
        state_tax: string;
        county_tax: string;
        city_tax: string;
        special_tax: string;
        tax_amount: string;
        total_amount: string;
        applied_jurisdiction: string;
        jurisdiction_level: string;
        county_name: string | null;
        city_name: string | null;
        status: string;
        created_at: string;
        updated_at: string;
        user: {
            id: number;
            name: string;
            email: string;
        };
    };
}
