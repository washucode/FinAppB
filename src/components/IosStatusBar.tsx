import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Bell,
  Smartphone,
  Maximize2,
  Settings,
  Sparkles,
} from 'lucide-react';
import { AppSettings } from '../types';

interface IosStatusBarProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  pendingRemindersCount: number;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
}

export const IosStatusBar: React.FC<IosStatusBarProps> = ({
  settings,
  onUpdateSettings,
  pendingRemindersCount,
  onOpenNotifications,
  onOpenSettings,
}) => {
  const [time, setTime] = useState('9:41');
  const [islandExpanded, setIslandExpanded] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: false })
      );
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/60 pt-2 pb-1.5 px-6 select-none z-30 relative">
      {/* Top row: Time, Dynamic Island, and System Icons */}
      <div className="flex items-center justify-between text-xs text-slate-200">
        {/* Left: Time in iOS Typography */}
        <div className="w-20 text-left font-semibold text-sm tracking-tight font-sans pl-1">
          {time}
        </div>

        {/* Center: Interactive Dynamic Island */}
        <div
          onClick={() => setIslandExpanded(!islandExpanded)}
          className={`cursor-pointer transition-all duration-300 ease-out bg-black border border-slate-800/80 rounded-full flex items-center justify-between px-3 shadow-lg ${
            islandExpanded
              ? 'w-64 h-9 py-1 px-4 text-emerald-400 bg-slate-900 border-emerald-500/30'
              : 'w-28 h-6 hover:scale-105'
          }`}
          title="Dynamic Island - Tap to toggle"
        >
          {islandExpanded ? (
            <div className="w-full flex items-center justify-between text-[11px] font-medium text-slate-100">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {pendingRemindersCount > 0
                  ? `${pendingRemindersCount} Alerts Active`
                  : 'Budget Healthy'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenNotifications();
                }}
                className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500/30"
              >
                View
              </button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between px-1">
              <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
              <div className="flex items-center gap-1">
                {pendingRemindersCount > 0 ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: iOS Cellular Bars, Wifi, Battery Capsule */}
        <div className="w-20 flex items-center justify-end gap-1.5 text-slate-200">
          {/* iOS 4-bar cellular signal */}
          <div className="flex items-end gap-0.5 h-3">
            <span className="w-0.5 h-1 bg-slate-200 rounded-sm" />
            <span className="w-0.5 h-1.5 bg-slate-200 rounded-sm" />
            <span className="w-0.5 h-2 bg-slate-200 rounded-sm" />
            <span className="w-0.5 h-2.5 bg-slate-200 rounded-sm" />
          </div>

          <Wifi className="w-3.5 h-3.5" />

          {/* iOS Authentic Battery Capsule */}
          <div className="flex items-center">
            <div className="w-5 h-2.5 rounded-[4px] border border-slate-300/80 p-0.5 flex items-center">
              <div className="h-full w-full bg-emerald-400 rounded-[2px]" />
            </div>
            <div className="w-0.5 h-1 bg-slate-300/80 rounded-r-sm -ml-px" />
          </div>
        </div>
      </div>

      {/* Quick OS & View Switcher Bar */}
      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/60 text-[11px]">
        {/* OS Segmented Control: iOS / Android / Desktop */}
        <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
          <button
            onClick={() => onUpdateSettings({ ...settings, osMode: 'ios', androidFrameView: true })}
            className={`px-2 py-0.5 rounded-md font-medium transition-all ${
              settings.osMode === 'ios'
                ? 'bg-slate-800 text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🍏 iOS
          </button>
          <button
            onClick={() => onUpdateSettings({ ...settings, osMode: 'android', androidFrameView: true })}
            className={`px-2 py-0.5 rounded-md font-medium transition-all ${
              settings.osMode === 'android'
                ? 'bg-slate-800 text-emerald-400 shadow-xs font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🤖 Android
          </button>
          <button
            onClick={() => onUpdateSettings({ ...settings, osMode: 'desktop', androidFrameView: false })}
            className={`px-2 py-0.5 rounded-md font-medium transition-all ${
              settings.osMode === 'desktop'
                ? 'bg-slate-800 text-sky-400 shadow-xs font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🖥️ Desktop
          </button>
        </div>

        {/* Notifications & Settings Buttons */}
        <div className="flex items-center gap-2">
          {pendingRemindersCount > 0 && (
            <button
              onClick={onOpenNotifications}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold"
            >
              <Bell className="w-3 h-3" />
              <span>{pendingRemindersCount}</span>
            </button>
          )}
          <button
            onClick={onOpenSettings}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
