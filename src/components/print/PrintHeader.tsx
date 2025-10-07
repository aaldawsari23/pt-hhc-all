import React from 'react';

interface PrintHeaderProps {
  title: string;
  subtitle?: string;
  patientMRN?: string;
  showLogo?: boolean;
}

export function PrintHeader({ title, subtitle, patientMRN, showLogo = true }: PrintHeaderProps) {
  const currentDate = new Date().toLocaleDateString('ar-SA');
  
  return (
    <div className="border-b-2 border-gray-300 pb-4 mb-6">
      <div className="flex justify-between items-start">
        {/* Left side - Hospital info and logo */}
        <div className="flex items-start gap-4">
          {showLogo && (
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs text-center leading-tight">
              <div>
                <div className="text-lg">♔</div>
                <div>KAH</div>
              </div>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-1">مستشفى الملك عبدالله - بيشة</p>
            <p className="text-gray-600">الرعاية الصحية المنزلية</p>
            {subtitle && (
              <p className="text-gray-700 mt-1 font-medium">{subtitle}</p>
            )}
          </div>
        </div>
        
        {/* Right side - Date and MRN */}
        <div className="text-right text-sm text-gray-600">
          <p>تاريخ الطباعة: {currentDate}</p>
          {patientMRN && (
            <p>رقم الملف: #{patientMRN}</p>
          )}
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">طُبع في: {new Date().toLocaleTimeString('ar-SA')}</p>
          </div>
        </div>
      </div>
      
      {/* Hospital info bar */}
      <div className="mt-4 pt-2 border-t border-gray-100">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div>
            هاتف: 0173623000 | فاكس: 0173623001
          </div>
          <div>
            ص.ب: 1334 بيشة 61922 | المملكة العربية السعودية
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrintFooter({ additionalInfo }: { additionalInfo?: string }) {
  const currentDate = new Date().toLocaleDateString('ar-SA');
  
  return (
    <div className="mt-8 pt-4 border-t border-gray-300">
      {additionalInfo && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">{additionalInfo}</p>
        </div>
      )}
      
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          هذا التقرير تم إنتاجه تلقائياً من نظام الرعاية الصحية المنزلية
        </p>
        <p className="text-sm text-gray-600">
          مستشفى الملك عبدالله - بيشة | {currentDate}
        </p>
        <div className="flex justify-center items-center gap-4 text-xs text-gray-500 mt-3">
          <span>نظام معتمد من وزارة الصحة</span>
          <span>•</span>
          <span>ISO 9001:2015</span>
          <span>•</span>
          <span>اعتماد CBAHI</span>
        </div>
      </div>
    </div>
  );
}