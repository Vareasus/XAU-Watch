"use client";

import { useEffect, useState } from 'react';
import { API_URL } from '../config';
import Sidebar, { ViewType } from '@/components/Sidebar';

import TopBar from '@/components/TopBar';
import MarketList from '@/components/MarketList';
import GoldChart from '@/components/GoldChart';
import PlaceholderView from '@/components/PlaceholderView';
import SearchView from '@/components/SearchView';
import SupportView from '@/components/SupportView';
import StatisticsView from '@/components/StatisticsView';
import LeaderboardView from '@/components/LeaderboardView';
import AdminView from '@/components/AdminView';
import LoginView from '@/components/LoginView';
import { Home as HomeIcon, LayoutDashboard, BarChart2, Search, Award, MessageCircle, History, DollarSign, Shield } from 'lucide-react';

// Mock data generator - FIX: Handle different periods
const generateMockData = (period: string) => {
  const data: any[] = [];
  let price = 5043.11;
  const now = new Date();

  let points = 24;
  let intervalMinutes = 60;

  switch (period) {
    case '30m': points = 30; intervalMinutes = 1; break;
    case '12h': points = 48; intervalMinutes = 15; break;
    case '24h':
    case '1d': points = 24; intervalMinutes = 60; break;
    case '7d': points = 84; intervalMinutes = 120; break;
    case '30d': points = 90; intervalMinutes = 480; break;
    default: points = 24; intervalMinutes = 60;
  }

  for (let i = 0; i < points; i++) {
    const date = new Date(now);
    // Calculate time backwards: now - ((total points - current index) * interval)
    // Example for 30m: date = now - (30 - 0)*1 = now - 30m, then now - 29m...
    const diffMinutes = (points - 1 - i) * intervalMinutes;
    date.setMinutes(now.getMinutes() - diffMinutes);

    // Random walk price with different volatility based on period
    const volatility = (period === '30m' || period === '12h') ? 2 : 15;
    price = price + (Math.random() - 0.5) * volatility;

    let label = "";
    // Different label formats based on granularity
    if (period === '30m' || period === '12h' || period === '1d') {
      label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      label = `${day} ${month} ${time}`;
    }

    // Ensure uniqueness for Recharts key
    const uniqueKey = date.getTime();

    data.push({
      date: label,
      uniqueKey: uniqueKey, // can use this if needed, but label collisions are rare with seconds/minutes
      price: Number(price.toFixed(2))
    });
  }
  return data;
};

// Map icons
const iconMap: Record<ViewType, any> = {
  'profile': HomeIcon,
  'dashboard': LayoutDashboard,
  'statistics': BarChart2,
  'search': Search,
  'leaders': Award,
  'support': MessageCircle,
  'history': History,
  'trade': DollarSign,
  'admin': Shield
};

const viewTitles: Record<ViewType, string> = {
  'profile': "My Profile",
  'dashboard': "Dashboard",
  'statistics': "Market Statistics",
  'search': "Search Markets",
  'leaders': "Leaderboard",
  'support': "Support Center",
  'history': "Trading History",
  'trade': "Trade Execution",
  'admin': "Admin Panel"
};

export default function Home() {
  const [currentPrice, setCurrentPrice] = useState<number>(5043.11);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  // Use 'any' or string for period to allow flexibility with string inputs from UI
  const [period, setPeriod] = useState<any>('7d');
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);

  // Effect to update data when period changes
  useEffect(() => {
    const newData = generateMockData(period);
    setHistoricalData(newData);
  }, [period]);

  useEffect(() => {
    // Fetch live price
    const fetchPrice = async () => {
      try {
        const res = await fetch(`${API_URL}/api/price/latest`);
        const data = await res.json();
        if (data.price && data.price !== 2000) {
          setCurrentPrice(data.price);
        }
      } catch (error) {
        console.error("Failed to fetch price", error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);

    return () => clearInterval(interval);
  }, []);

  // View Router
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <main className="flex-1 flex min-h-0 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="flex-1 flex flex-col min-w-0 relative mr-4">
              <GoldChart
                data={historicalData}
                period={period}
                onPeriodChange={setPeriod}
                currentPrice={currentPrice}
              />
            </div>
            <MarketList />
          </main>
        );
      case 'search':
        return <SearchView />;
      case 'leaders':
        return <LeaderboardView />;
      case 'support':
        return <SupportView />;
      case 'statistics':
        return <StatisticsView />;
      case 'admin':
        return userRole === 'admin' ? <AdminView /> : <div className="p-10 text-white/50">Access Denied</div>;
      default:
        return (
          <div className="flex-1 flex min-h-0 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <PlaceholderView
              title={viewTitles[activeView]}
              icon={iconMap[activeView]}
              onBack={() => setActiveView('dashboard')}
            />
          </div>
        );
    }
  };

  if (!userRole) {
    return <LoginView onLogin={setUserRole} />;
  }

  return (
    <div className="flex h-screen bg-transparent text-white overflow-hidden font-sans">
      <Sidebar activeView={activeView} onViewChange={setActiveView} userRole={userRole} />

      <div className="flex-1 flex flex-col min-w-0 pr-4 pb-4">
        <TopBar userRole={userRole} onLogout={() => setUserRole(null)} />
        {renderView()}
      </div>
    </div>
  );
}
