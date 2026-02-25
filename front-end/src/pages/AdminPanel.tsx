import { useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { OrdersList } from "../components/orders/OrdersList";
import { ManualOrder } from "../components/orders/ManualOrder";
import { CSVImport } from "../components/orders/CSVImport";
import { LayoutDashboard } from "lucide-react";
export function AdminPanel() {
    const [activeTab, setActiveTab] = useState("orders");
    const renderContent = () => {
        switch (activeTab) {
            case "orders":
                return <OrdersList />;
            case "manual":
                return <ManualOrder />;
            case "import":
                return <CSVImport />;
            case "dashboard":
                return (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-accent-subtle text-accent rounded-full flex items-center justify-center mx-auto mb-6">
                            <LayoutDashboard className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                            Dashboard Overview
                        </h2>
                        <p className="text-dark-text-secondary max-w-md mx-auto">
                            This is a placeholder for the main dashboard charts
                            and metrics. Navigate to the other tabs to manage
                            orders.
                        </p>
                    </div>
                );
            default:
                return <OrdersList />;
        }
    };
    return (
        <div className="min-h-screen bg-dark-bg flex">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

            <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
                <div className="max-w-7xl mx-auto animate-fade-in">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}
