import {
    LayoutDashboard,
    UploadCloud,
    PlusCircle,
    ListOrdered,
    Settings,
    LogOut,
    PieChart,
} from "lucide-react";
interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}
export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
    const navItems = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
        },
        {
            id: "orders",
            label: "Orders List",
            icon: ListOrdered,
        },
        {
            id: "manual",
            label: "Manual Entry",
            icon: PlusCircle,
        },
        {
            id: "import",
            label: "CSV Import",
            icon: UploadCloud,
        },
        {
            id: "reports",
            label: "Reports",
            icon: PieChart,
        },
    ];
    const bottomItems = [
        {
            id: "settings",
            label: "Settings",
            icon: Settings,
        },
        {
            id: "logout",
            label: "Logout",
            icon: LogOut,
        },
    ];
    return (
        <div className="w-64 bg-dark-bg border-r border-[#1A1A1A] flex flex-col h-full fixed left-0 top-0">
            <div className="p-6 border-b border-[#1A1A1A]">
                <div className="flex items-center">
                    <img
                        src="https://cdn.magicpatterns.com/uploads/kdVFnvb4LwRqiXQXb7MUwY/%D0%BB%D0%BE%D0%B3%D0%BE_svg_(1).svg"
                        alt="sleep food holidays"
                        className="h-7 object-contain"
                    />
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <div className="text-xs font-semibold text-[#444444] uppercase tracking-wider mb-4 px-2">
                    Main Menu
                </div>
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === item.id ? "bg-accent-subtle text-accent border-l-2 border-accent rounded-l-none" : "text-[#666666] hover:bg-surface hover:text-white"}`}
                    >
                        <item.icon
                            className={`w-5 h-5 ${activeTab === item.id ? "text-accent" : "text-[#444444]"}`}
                        />
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-[#1A1A1A]">
                <div className="space-y-1">
                    {bottomItems.map((item) => (
                        <button
                            key={item.id}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#666666] hover:bg-surface hover:text-white transition-colors"
                        >
                            <item.icon className="w-5 h-5 text-[#444444]" />
                            {item.label}
                        </button>
                    ))}
                </div>
                <div className="mt-6 flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-xs font-medium text-dark-text-secondary">
                        JD
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            John Doe
                        </p>
                        <p className="text-xs text-dark-text-tertiary truncate">
                            admin@taxmanager.com
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
