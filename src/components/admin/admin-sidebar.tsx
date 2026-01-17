"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    Building2,
    Bell,
    Calendar,
    ShoppingBag,
    AlertTriangle,
    BookOpen,
    LogOut,
    ShieldCheck
} from "lucide-react";
import { signOut } from "next-auth/react";

const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Buildings", href: "/admin/buildings", icon: Building2 },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Notices", href: "/admin/notices", icon: Bell },
    { name: "Events", href: "/admin/events", icon: Calendar },
    { name: "Marketplace", href: "/admin/marketplace", icon: ShoppingBag },
    { name: "Complaints", href: "/admin/complaints", icon: AlertTriangle },
    { name: "Yellow Pages", href: "/admin/yellow-pages", icon: BookOpen },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-slate-900 border-r border-white/10 w-64 fixed left-0 top-0">
            {/* Logo Area */}
            <div className="flex items-center gap-3 p-6 border-b border-white/10">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
                    <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="font-bold text-white text-lg tracking-tight">Admin Portal</h1>
                    <p className="text-xs text-slate-400">Runwal Seagull</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                                isActive
                                    ? "bg-red-500/10 text-red-500 shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "h-5 w-5 transition-colors",
                                    isActive ? "text-red-500" : "text-slate-500 group-hover:text-white"
                                )}
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* User Footer */}
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 transition-all group"
                >
                    <LogOut className="h-5 w-5 text-slate-500 group-hover:text-red-400 transition-colors" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
