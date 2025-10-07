import React from 'react';
import { Check, Save, AlertCircle } from 'lucide-react';

interface SaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
}

export function SaveIndicator({ isSaving, lastSaved, error }: SaveIndicatorProps) {
  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm">
        <AlertCircle className="w-4 h-4" />
        <span>خطأ في الحفظ</span>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-blue-600 text-sm">
        <Save className="w-4 h-4 animate-pulse" />
        <span>جاري الحفظ...</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm">
        <Check className="w-4 h-4" />
        <span>تم الحفظ {formatTime(lastSaved)}</span>
      </div>
    );
  }

  return null;
}

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);

  if (diffSecs < 60) {
    return 'الآن';
  } else if (diffMins < 60) {
    return `منذ ${diffMins} دقيقة`;
  } else {
    return date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}