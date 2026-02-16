"use client";

import { Home, LayoutDashboard, BarChart2, Search, Award, MessageCircle, History, DollarSign, Shield } from 'lucide-react';
import { clsx } from "clsx";

export type ViewType = 'profile' | 'dashboard' | 'statistics' | 'search' | 'leaders' | 'support' | 'history' | 'trade' | 'admin';

export const menuItems: { id: ViewType; icon: any; label: string; badge?: number }[] = [
    { id: 'profile', icon: Home, label: "My profile" },
    { id: 'dashboard', icon: LayoutDashboard, label: "Dashboard" },
    { id: 'statistics', icon: BarChart2, label: "Statistics" },
    { id: 'search', icon: Search, label: "Search" },
    { id: 'leaders', icon: Award, label: "Leaders" },
    { id: 'support', icon: MessageCircle, label: "Support Service", badge: 1 },
    { id: 'history', icon: History, label: "History" },
    { id: 'trade', icon: DollarSign, label: "Trade" },
    { id: 'admin', icon: Shield, label: "Admin Panel" },
];

interface SidebarProps {
    activeView: ViewType;
    onViewChange: (view: ViewType) => void;
    userRole: 'admin' | 'user';
}

export default function Sidebar({ activeView, onViewChange, userRole }: SidebarProps) {
    const visibleItems = menuItems.filter(item =>
        item.id === 'admin' ? userRole === 'admin' : true
    );

    return (
        <div className="w-20 glass-panel m-4 flex flex-col items-center py-4 space-y-4 shrink-0 shadow-neon border-white/10 z-50">
            {/* Logo - Glowing Icon */}
            <div
                onClick={() => onViewChange('dashboard')}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/30 flex items-center justify-center mb-4 cursor-pointer hover:scale-110 transition-transform"
            >
                <span className="font-extrabold text-white text-lg">Au</span>
            </div>

            <nav className="flex-1 flex flex-col gap-4 w-full px-2">
                {visibleItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={clsx(
                            "flex flex-col items-center justify-center p-3 rounded-2xl relative group transition-all duration-300",
                            activeView === item.id
                                ? "bg-white/10 text-yellow-400 shadow-lg shadow-yellow-500/10 scale-105 border border-yellow-500/20"
                                : "text-white/40 hover:text-white hover:bg-white/5 hover:scale-105 border border-transparent"
                        )}
                        aria-label={item.label}
                    >
                        <item.icon
                            className={clsx("w-6 h-6 mb-1 transition-all", activeView === item.id && "drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]")}
                            strokeWidth={activeView === item.id ? 2 : 1.5}
                        />

                        {item.badge && (
                            <div className="absolute top-2 right-2 w-3 h-3 bg-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/50 animate-pulse"></div>
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );
}
