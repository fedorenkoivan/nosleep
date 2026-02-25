import React, { useEffect, useState } from "react";
import { Calculator, DollarSign, Save } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
export function ManualOrder() {
    const [formData, setFormData] = useState({
        lat: "",
        lon: "",
        subtotal: "",
        taxRate: "8.0",
    });
    const [calculations, setCalculations] = useState({
        taxAmount: 0,
        total: 0,
    });
    useEffect(() => {
        const subtotal = parseFloat(formData.subtotal) || 0;
        const rate = parseFloat(formData.taxRate) || 0;
        const taxAmount = subtotal * (rate / 100);
        const total = subtotal + taxAmount;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCalculations({
            taxAmount: Number(taxAmount.toFixed(2)),
            total: Number(total.toFixed(2)),
        });
    }, [formData.subtotal, formData.taxRate]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle submission logic here
        console.log("Submitting order:", {
            ...formData,
            ...calculations,
        });
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
                                    placeholder="34.0522"
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
                                    placeholder="-118.2437"
                                    value={formData.lon}
                                    onChange={handleChange}
                                    required
                                    className="font-mono"
                                />
                            </div>

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
                                <Input
                                    label="Tax Rate (%)"
                                    name="taxRate"
                                    type="number"
                                    step="0.01"
                                    placeholder="8.0"
                                    value={formData.taxRate}
                                    onChange={handleChange}
                                    required
                                    className="font-mono"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <Button type="button" variant="secondary">
                                    Reset
                                </Button>
                                <Button
                                    type="submit"
                                    leftIcon={<Save className="w-4 h-4" />}
                                >
                                    Create Order
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card title="Live Calculation" className="sticky top-6">
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
                                    $
                                    {parseFloat(
                                        formData.subtotal || "0",
                                    ).toFixed(2)}
                                </span>
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
                                    ${calculations.taxAmount.toFixed(2)}
                                </span>
                            </div>

                            <div className="border-t-2 border-dashed border-dark-border my-4"></div>

                            <div className="flex items-center justify-between p-4 bg-accent text-black rounded-lg shadow-md">
                                <span className="font-medium">Total Due</span>
                                <span className="text-2xl font-bold font-mono">
                                    ${calculations.total.toFixed(2)}
                                </span>
                            </div>

                            <div className="text-xs text-[#444444] text-center mt-4">
                                Calculated based on {formData.taxRate}% tax rate
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
