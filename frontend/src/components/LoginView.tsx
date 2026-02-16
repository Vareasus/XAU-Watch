"use client";

import { useState } from 'react';
import { Lock, User, ArrowRight, ShieldCheck, UserPlus } from 'lucide-react';
import { API_URL } from '../config';

interface LoginViewProps {
    onLogin: (role: 'admin' | 'user') => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const validate = () => {
        // Username: Alphanumeric, min 6 chars
        if (username.length < 6 || !/^[a-zA-Z0-9]+$/.test(username)) {
            setError("Username must be at least 6 alphanumeric characters.");
            return false;
        }
        // Password: Min 7 chars, 1 Upper, 1 Lower, 1 Number, 1 Symbol
        if (password.length < 7) {
            setError("Password must be at least 7 characters.");
            return false;
        }
        if (!/(?=.*[a-z])/.test(password)) {
            setError("Password must contain at least 1 lowercase letter.");
            return false;
        }
        if (!/(?=.*[A-Z])/.test(password)) {
            setError("Password must contain at least 1 uppercase letter.");
            return false;
        }
        if (!/(?=.*\d)/.test(password)) {
            setError("Password must contain at least 1 number.");
            return false;
        }
        if (!/(?=.*[@$!%*?&])/.test(password)) {
            setError("Password must contain at least 1 symbol (@$!%*?&).");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (isRegister) {
            if (!validate()) return;
        }

        setLoading(true);

        try {
            const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok) {
                if (isRegister) { // Registered successfully
                    setSuccess("Registration successful! Please log in.");
                    setIsRegister(false);
                    // Clear fields or keep them? Usually keep them for UX or clear for security.
                    // keeping them is easier for user.
                } else { // Logged in
                    if (rememberMe) {
                        localStorage.setItem('userRole', data.role);
                    }
                    onLogin(data.role);
                }
            } else {
                setError(data.detail || "Authentication Failed");
            }
        } catch (err) {
            console.error(err);
            setError("Network Error. Is backend running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#0f172a] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 w-full max-w-md p-8 glass-panel border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
                        {isRegister ? <UserPlus size={32} className="text-white" /> : <Lock size={32} className="text-white" />}
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        {isRegister ? "Create Account" : "Welcome Back"}
                    </h1>
                    <p className="text-white/40 text-sm">
                        {isRegister ? "Join the AurumWatch community" : "Sign in to access AurumWatch"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs text-white/50 font-bold uppercase tracking-wider ml-1">Username</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-yellow-500/50 focus:bg-black/40 outline-none transition-all"
                                placeholder="Enter username"
                                required
                            />
                        </div>
                        {isRegister && <p className="text-[10px] text-white/30 ml-1">Min 6 chars, letters & numbers only.</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-white/50 font-bold uppercase tracking-wider ml-1">Password</label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-yellow-500/50 focus:bg-black/40 outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        {isRegister && <p className="text-[10px] text-white/30 ml-1">Min 7 chars, 1 Upper, 1 Lower, 1 Number, 1 Symbol.</p>}
                    </div>

                    {!isRegister && (
                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <div className="w-5 h-5 border-2 border-white/20 rounded-md peer-checked:bg-yellow-500 peer-checked:border-yellow-500 transition-all"></div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                                <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors select-none">Remember Me</span>
                            </label>
                            <a href="#" className="text-xs text-yellow-500 hover:text-yellow-400 transition-colors">Forgot Password?</a>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center font-medium animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs text-center font-medium animate-in fade-in slide-in-from-top-2">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            "Processing..."
                        ) : (
                            <>{isRegister ? "Register Now" : "Sign In"} <ArrowRight size={18} /></>
                        )}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-white/10 text-center">
                    <p className="text-white/40 text-sm mb-2">
                        {isRegister ? "Already have an account?" : "Don't have an account?"}
                    </p>
                    <button
                        onClick={() => {
                            setIsRegister(!isRegister);
                            setError("");
                            setSuccess("");
                        }}
                        className="text-yellow-400 font-bold hover:text-yellow-300 transition-colors uppercase tracking-wider text-xs"
                    >
                        {isRegister ? "Back to Login" : "Create New Account"}
                    </button>
                </div>
            </div>
        </div>
    );
}
