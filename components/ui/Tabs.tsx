"use client";

import { memo } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  console.log(
    "📑 [Tabs] RENDER - Active tab:",
    activeTab,
    "| Total tabs:",
    tabs.length
  );
  return (
    <div id="tabs-container">
      <nav id="tabs-nav" className="flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 py-2 px-4 font-normal text-sm transition-colors relative rounded-lg
                ${
                  isActive
                    ? "bg-theme-primary-light text-theme-primary border-b-2 border-theme-primary"
                    : "text-theme-text-secondary hover:text-theme-primary hover:bg-theme-primary-light"
                }
              `}>
              {tab.icon && <span className="opacity-60">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default memo(Tabs);
