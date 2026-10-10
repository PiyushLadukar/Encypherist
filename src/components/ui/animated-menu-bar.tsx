"use client";

import React from 'react';
import Link from 'next/link';

export interface MenuItemConfig {
  key: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
}

export interface MenuBarProps {
  active?: 'dashboard' | 'notifications' | 'settings' | 'help' | 'security' | string;
  onSelect?: (key: any) => void;
  items?: MenuItemConfig[];
  className?: string;
}

export const icons = {
  dashboard: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path d="M3 9.5L12 4l9 5.5v7.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z"/>
      <path d="M9 22V12h6v10"/>
    </svg>
  ),
  notifications: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  settings: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  help: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 3-3 3"/>
      <circle cx="12" cy="17" r="1"/>
    </svg>
  ),
  security: (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
};

export interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, label, active, href, onClick }) => {
  const [hovered, setHovered] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const tooltipTimeout = React.useRef<NodeJS.Timeout | null>(null);

  // Calculate width based on label length (min 38px for icon, plus label)
  const expandedWidth = Math.max(38 + label.length * 8.5 + 28, 100);

  // Responsive: show text on hover or when active
  const isExpanded = (hovered || active);

  // Show tooltip on mobile tap
  const handleMobileTooltip = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setShowTooltip(true);
      if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
      tooltipTimeout.current = setTimeout(() => setShowTooltip(false), 1200);
    }
    if (onClick) onClick();
  };

  React.useEffect(() => () => {
    if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
  }, []);

  const buttonClasses = `group/btn flex items-center rounded-xl border transition-all duration-300 focus:outline-none relative overflow-visible cursor-pointer select-none
    ${active 
      ? 'border-zinc-300 dark:border-zinc-700 bg-zinc-900 text-white shadow-sm font-medium dark:bg-white dark:text-zinc-900' 
      : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-foreground hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60'
    }
    h-9 sm:h-9
    px-2 sm:px-2.5
    justify-center
  `;

  const content = (
    <>
      {/* Tooltip for mobile view */}
      <span
        className={`sm:hidden absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-medium rounded-md px-2 py-0.5 shadow-lg transition-opacity duration-200 pointer-events-none z-30 whitespace-nowrap
          ${showTooltip ? 'opacity-100' : 'opacity-0'}`}
      >
        {label}
      </span>
      <span className="flex items-center justify-center shrink-0 w-5 h-5 transition-transform duration-200 group-hover/btn:scale-105">
        {icon}
      </span>
      <span
        className={`text-xs font-mono uppercase tracking-wider transition-all duration-300 whitespace-nowrap pointer-events-none overflow-hidden
          hidden sm:inline-block
          ${isExpanded ? 'opacity-100 ml-2' : 'opacity-0 ml-0 w-0'}`}
        style={{
          transition: 'opacity 0.25s ease, width 0.3s cubic-bezier(0.4,0,0.2,1), margin 0.25s ease',
          width: isExpanded ? expandedWidth - 38 - 20 : 0,
        }}
      >
        {label}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={label}
        className={buttonClasses}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleMobileTooltip}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      className={buttonClasses}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleMobileTooltip}
    >
      {content}
    </button>
  );
};

const DEFAULT_ITEMS: MenuItemConfig[] = [
  { key: 'dashboard', label: 'Dashboard', icon: icons.dashboard },
  { key: 'notifications', label: 'Notifications', icon: icons.notifications },
  { key: 'settings', label: 'Settings', icon: icons.settings },
  { key: 'help', label: 'Help', icon: icons.help },
  { key: 'security', label: 'Security', icon: icons.security },
];

export const MenuBar = ({ active = 'dashboard', onSelect, items, className = '' }: MenuBarProps) => {
  const menuList = items || DEFAULT_ITEMS;

  return (
    <nav className={`flex items-center gap-1 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl p-1.5 rounded-2xl border border-black/20 dark:border-white/20 shadow-md w-fit transition-all duration-300 ${className}`}>
      {menuList.map((item, index) => {
        const isItemActive = Boolean(active === item.key || (item.href && active === item.href));
        const showDivider = !items && index === 0;

        return (
          <React.Fragment key={item.key}>
            <IconButton
              icon={item.icon}
              label={item.label}
              active={isItemActive}
              href={item.href}
              onClick={() => onSelect?.(item.key)}
            />
            {showDivider && (
              <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-1" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default MenuBar;
