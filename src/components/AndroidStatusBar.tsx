import React, { useState, useEffect } from 'react';
import {
  Wifi,
  BatteryMedium,
  Bell,
  Smartphone,
  Maximize2,
  DollarSign,
  Settings,
  Sparkles,
} from 'lucide-react';
import { AppSettings, Reminder } from '../types';

interface AndroidStatusBarProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  pendingRemindersCount: number;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({
  settings,
  onUpdateSettings,
  pendingRemindersCount,
  onOpenNotifications,
  onOpenSettings,
}) => {
  const [time, setTime] = useState('10:26');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2 flex items-center justify-between text-xs text-slate-300 select-none z-30">
      {/* Left side: Time & Notification Badge */}
      <div className="flex items-center gap-2">
        <span className="font-semibold tracking-tight text-slate-100 font-mono text-xs">
          {time}
        </span>
        {pendingRemindersCount > 0 && (
          <button
            onClick={onOpenNotifications}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors border border-emerald-500/30 cursor-pointer"
            title={`${pendingRemindersCount} active reminders`}
          >
            <Bell className="w-3 h-3 animate-pulse" />
            <span className="text-[10px] font-bold">{pendingRemindersCount}</span>
          </button>
        )}
      </div>

      {/* Center: OS Mode Switcher */}
      <div className="flex items-center bg-slate-950/80 rounded-lg p-0.5 border border-slate-800 text-[11px]">
        <button
          onClick={() => onUpdateSettings({ ...settings, osMode: 'android', androidFrameView: true })}
          className={`px-2 py-0.5 rounded-md font-medium transition-all ${
            settings.osMode === 'android'
              ? 'bg-slate-800 text-emerald-400 font-semibold shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🤖 Android
        </button>
        <button
          onClick={() => onUpdateSettings({ ...settings, osMode: 'ios', androidFrameView: true })}
          className={`px-2 py-0.5 rounded-md font-medium transition-all ${
            settings.osMode === 'ios'
              ? 'bg-slate-800 text-white font-semibold shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🍏 iOS
        </button>
        <button
          onClick={() => onUpdateSettings({ ...settings, osMode: 'desktop', androidFrameView: false })}
          className={`px-2 py-0.5 rounded-md font-medium transition-all ${
            settings.osMode === 'desktop'
              ? 'bg-slate-800 text-sky-400 font-semibold shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🖥️ Desktop
        </button>
      </div>

      {/* Right side: System Status Icons & Frame Toggle */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() =>
            onUpdateSettings({
              ...settings,
              androidFrameView: !settings.androidFrameView,
            })
          }
          className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          title={
            settings.androidFrameView
              ? 'Switch to Wide Desktop View'
              : 'Switch to Android Phone View'
          }
        >
          {settings.androidFrameView ? (
            <Maximize2 className="w-3.5 h-3.5" />
          ) : (
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          )}
        </button>

        <button
          onClick={onOpenSettings}
          className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          title="App Settings & Backup"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1.5 pl-1 border-l border-slate-800 text-slate-400">
          <span className="text-[10px] font-mono text-slate-400 font-medium">5G</span>
          <Wifi className="w-3.5 h-3.5" />
          <div className="flex items-center gap-0.5">
            <span className="text-[10px] font-mono">94%</span>
            <BatteryMedium className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
