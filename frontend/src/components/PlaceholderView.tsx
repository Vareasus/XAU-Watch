"use client";

import { Construction } from 'lucide-react';

interface PlaceholderViewProps {
    title: string;
    icon?: any;
    onBack: () => void;
}

export default function PlaceholderView({ title, icon: Icon, onBack }: PlaceholderViewProps) {
    return (
        <div className="flex-1 glass-panel m-4 flex flex-col items-center justify-center text-center shadow-neon border-white/10 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 z-0" />

            <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/10 backdrop-blur-md">
                    {Icon ? <Icon size={48} className="text-white/50" /> : <Construction size={48} className="text-white/50" />}
                </div>

                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2">
                    {title}
                </h2>
                <p className="text-white/40 max-w-md">
                    This section is currently under construction. Check back later for updates as we continue to build AurumWatch.
                </p>

                <button
                    onClick={onBack}
                    className="mt-8 px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer z-50 shadow-md hover:shadow-lg hover:border-white/20 active:scale-95"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
}
