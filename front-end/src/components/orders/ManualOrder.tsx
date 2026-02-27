import React, { useEffect, useState } from "react";
import { Calculator, DollarSign, Save } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { api, ApiError } from "../../api/client";
import type { TaxCalculation } from "../../types/order.types";
import { CoordinatePickerMap } from "./CoordinatePickerMap";

function formatCoord(value: number) {
    return value.toFixed(6);
}

export function ManualOrder() {
    const [formData, setFormData] = useState({
        lat: "",
        lon: "",
        subtotal: "",
    });

    const [taxData, setTaxData] = useState<TaxCalculation | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [locationInfo, setLocationInfo] = useState<{
        city: string | null;
        county: string | null;
    } | null>(null);

    // Автоматичний розрахунок податку при зміні координат та суми
    useEffect(() => {
        const calculateTax = async () => {
            const subtotal = parseFloat(formData.subtotal);
            const lat = parseFloat(formData.lat);
            const lon = parseFloat(formData.lon);

            if (!subtotal || !lat || !lon || subtotal <= 0) {
                setTaxData(null);
                setLocationInfo(null);
                return;
            }

            setIsCalculating(true);
            setError(null);

            try {
                // Отримуємо інформацію про локацію
                // const location = await api.getLocation(lon, lat) as any;
                // setLocationInfo({
                //     city: location.city?.name || null,
                //     county: location.county?.name || null,
                // });

                // Розраховуємо податок
                const calculation = (await api.calculateTax({
                    subtotal,
                    longitude: lon,
                    latitude: lat,
                })) as TaxCalculation;
                setTaxData(calculation);
            } catch (err) {
                if (err instanceof ApiError) {
                    setError(err.message);
                } else {
                    setError("Failed to calculate tax");
                }
                setTaxData(null);
                setLocationInfo(null);
            } finally {
                setIsCalculating(false);
            }
        };

        // Debounce для запобігання занадто частих запитів
        const timeoutId = setTimeout(calculateTax, 500);
        return () => clearTimeout(timeoutId);
    }, [formData.subtotal, formData.lat, formData.lon]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setSuccess(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!taxData) {
            setError("Please wait for tax calculation to complete");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const result = (await api.orders.create({
                subtotal: parseFloat(formData.subtotal),
                longitude: parseFloat(formData.lon),
                latitude: parseFloat(formData.lat),
            })) as any;

            setSuccess(`Order #${result.order.id} created successfully!`);

            // Очищаємо форму після успішного створення
            setTimeout(() => {
                setFormData({ lat: "", lon: "", subtotal: "" });
                setTaxData(null);
                setLocationInfo(null);
                setSuccess(null);
            }, 3000);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError("Failed to create order");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormData({ lat: "", lon: "", subtotal: "" });
        setTaxData(null);
        setLocationInfo(null);
        setError(null);
        setSuccess(null);
    };

    const setCoordinates = (latitude: number, longitude: number) => {
        setFormData((prev) => ({
            ...prev,
            lat: formatCoord(latitude),
            lon: formatCoord(longitude),
        }));
        setSuccess(null);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">
                    Manual Order Entry
                </h2>
                <p className="text-dark-text-secondary mt-1">
                    Create a new tax order manually with live calculation.
                </p>
            </div>

            {/* Error and Success Messages */}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                    <div className="flex items-center gap-2">
                        <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400">
                    <div className="flex items-center gap-2">
                        <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span>{success}</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card title="Order Details">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Latitude"
                                    name="lat"
                                    type="number"
                                    step="any"
                                    placeholder="42.01246326"
                                    value={formData.lat}
                                    onChange={handleChange}
                                    required
                                    className="font-mono"
                                />
                                <Input
                                    label="Longitude"
                                    name="lon"
                                    type="number"
                                    step="any"
                                    placeholder="-78.86718664"
                                    value={formData.lon}
                                    onChange={handleChange}
                                    required
                                    className="font-mono"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm font-medium text-dark-text-secondary">
                                    Or pick coordinates on map
                                </div>
                                <CoordinatePickerMap
                                    lat={formData.lat}
                                    lon={formData.lon}
                                    onPick={setCoordinates}
                                />
                                <div className="text-xs text-dark-text-tertiary">
                                    Click the map to set latitude/longitude.
                                    Drag the marker to fine-tune.
                                </div>
                            </div>

                            {/* Location Info */}
                            {locationInfo && (
                                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                    <div className="text-sm text-blue-300">
                                        <strong>Location:</strong>{" "}
                                        {locationInfo.city &&
                                            `${locationInfo.city}, `}
                                        {locationInfo.county} County, NY
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-[#1A1A1A] my-6"></div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative">
                                    <Input
                                        label="Subtotal ($)"
                                        name="subtotal"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.subtotal}
                                        onChange={handleChange}
                                        required
                                        className="font-mono"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <div className="text-sm text-dark-text-secondary">
                                        {isCalculating && (
                                            <span className="text-yellow-400">
                                                Calculating tax...
                                            </span>
                                        )}
                                        {/* {taxData && (
                                            <span className="text-green-400">
                                                Tax rate: {taxData.tax_breakdown.composite_tax_rate}
                                            </span>
                                        )} */}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleReset}
                                >
                                    Reset
                                </Button>
                                <Button
                                    type="submit"
                                    leftIcon={<Save className="w-4 h-4" />}
                                    disabled={!taxData || isSubmitting}
                                >
                                    {isSubmitting
                                        ? "Creating..."
                                        : "Create Order"}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card title="Live Calculation" className="sticky top-6">
                        {taxData ? (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-accent-subtle text-accent rounded-md">
                                            <DollarSign className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-medium text-dark-text-secondary">
                                            Subtotal
                                        </span>
                                    </div>
                                    <span className="text-lg font-semibold text-white font-mono">
                                        ${taxData.subtotal.toFixed(2)}
                                    </span>
                                </div>

                                {/* Tax Breakdown */}
                                <div className="space-y-2">
                                    <div className="text-xs font-semibold text-dark-text-secondary uppercase tracking-wide">
                                        Tax Breakdown
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between text-dark-text-secondary">
                                            <span>
                                                State (
                                                {
                                                    taxData.tax_breakdown
                                                        .state_rate
                                                }
                                                )
                                            </span>
                                            <span className="font-mono">
                                                $
                                                {taxData.tax_breakdown.state_tax.toFixed(
                                                    2,
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-dark-text-secondary">
                                            <span>
                                                County (
                                                {
                                                    taxData.tax_breakdown
                                                        .county_rate
                                                }
                                                )
                                            </span>
                                            <span className="font-mono">
                                                $
                                                {taxData.tax_breakdown.county_tax.toFixed(
                                                    2,
                                                )}
                                            </span>
                                        </div>
                                        {taxData.tax_breakdown.city_tax > 0 && (
                                            <div className="flex justify-between text-dark-text-secondary">
                                                <span>
                                                    City (
                                                    {
                                                        taxData.tax_breakdown
                                                            .city_rate
                                                    }
                                                    )
                                                </span>
                                                <span className="font-mono">
                                                    $
                                                    {taxData.tax_breakdown.city_tax.toFixed(
                                                        2,
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        {taxData.tax_breakdown.special_tax >
                                            0 && (
                                            <div className="flex justify-between text-dark-text-secondary">
                                                <span>
                                                    Special (
                                                    {
                                                        taxData.tax_breakdown
                                                            .special_rates
                                                    }
                                                    )
                                                </span>
                                                <span className="font-mono">
                                                    $
                                                    {taxData.tax_breakdown.special_tax.toFixed(
                                                        2,
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-surface-elevated rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-500/10 text-orange-400 rounded-md">
                                            <Calculator className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-medium text-dark-text-secondary">
                                            Tax Amount
                                        </span>
                                    </div>
                                    <span className="text-lg font-semibold text-white font-mono">
                                        ${taxData.tax_amount.toFixed(2)}
                                    </span>
                                </div>

                                <div className="border-t-2 border-dashed border-dark-border my-4"></div>

                                <div className="flex items-center justify-between p-4 bg-accent text-black rounded-lg shadow-md">
                                    <span className="font-medium">
                                        Total Due
                                    </span>
                                    <span className="text-2xl font-bold font-mono">
                                        ${taxData.total_amount.toFixed(2)}
                                    </span>
                                </div>

                                <div className="text-xs text-[#444444] text-center mt-4">
                                    {taxData.jurisdictions.applied_level}:{" "}
                                    {taxData.jurisdictions.applied_name}
                                    <br />
                                    Rate:{" "}
                                    {taxData.tax_breakdown.composite_tax_rate}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-dark-text-secondary">
                                <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>
                                    Enter coordinates and amount to calculate
                                    tax
                                </p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
