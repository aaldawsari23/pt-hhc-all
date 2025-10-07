import React, { useState } from 'react';
import { FileText, MessageSquare, ClipboardList, Phone, CheckSquare, Folder, Printer } from 'lucide-react';

interface TabLayoutProps {
  patientId: string;
  children: React.ReactNode;
}

export type TabId = 'summary' | 'notes' | 'assessments' | 'contacts' | 'tasks' | 'files' | 'print';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'summary', label: 'ملف المريض', icon: <FileText className="w-4 h-4" /> },
  { id: 'notes', label: 'النوتات', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'assessments', label: 'التقييمات', icon: <ClipboardList className="w-4 h-4" /> },
  { id: 'contacts', label: 'الاتصالات', icon: <Phone className="w-4 h-4" /> },
  { id: 'tasks', label: 'المهام', icon: <CheckSquare className="w-4 h-4" /> },
  { id: 'files', label: 'الملفات', icon: <Folder className="w-4 h-4" /> },
  { id: 'print', label: 'الطباعة', icon: <Printer className="w-4 h-4" /> },
];

export function TabLayout({ patientId, children }: TabLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabId>('summary');

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 bg-white overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
              ${activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.props.tabId === activeTab) {
            return child;
          }
          return null;
        })}
      </div>
    </div>
  );
}