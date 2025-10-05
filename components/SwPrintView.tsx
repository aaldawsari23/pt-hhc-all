import React from 'react';
import { Visit, Patient, SwAssessmentData, Role } from '../types';

interface Props {
  visit: Visit;
  patient: Patient;
}

const PrintField: React.FC<{ label: string; value?: string | string[] | null | object }> = ({ label, value }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  
  let displayValue;
  if (typeof value === 'object' && !Array.isArray(value)) {
    displayValue = Object.entries(value).map(([k, v]) => v).join(', ');
  } else {
    displayValue = Array.isArray(value) ? value.join(', ') : value;
  }

  return (
    <p><strong className="font-semibold">{label}:</strong> {displayValue}</p>
  );
};

const SwPrintView: React.FC<Props> = ({ visit, patient }) => {
  const { swNote } = visit;
  const swAssessment = patient.assessments.find(a => a.role === Role.SocialWorker) as SwAssessmentData | undefined;

  return (
    <div className="p-8 font-sans text-sm" style={{ width: '210mm', height: '297mm' }} dir="rtl">
      {/* Header */}
      <header className="flex items-center justify-between pb-4 border-b">
         <div>
            <h1 className="text-2xl font-bold text-gray-800">مذكرة تقييم اجتماعي</h1>
            <p className="text-lg text-gray-600">تجمع عسير الصحي – مستشفى الملك عبدالله ببيشة</p>\n            <p className="text-sm text-gray-500">الرعاية الصحية المنزلية</p>
          </div>
        <div className="text-right text-xs text-gray-500">
          <p><strong>التاريخ:</strong> {new Date(visit.date).toLocaleDateString()}</p>
        </div>
      </header>

      {/* Patient Info */}
       <section className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 pb-4 border-b text-sm">
        <h2 className="col-span-2 text-base font-bold text-gray-700 mb-1">بيانات المريض</h2>
        <PrintField label="الاسم" value={patient.nameAr} />
        <PrintField label="رقم الهوية" value={patient.nationalId} />
        <PrintField label="الحي" value={patient.areaId} />
        <PrintField label="الجوال" value={patient.phone} />
      </section>

      <div className="mt-4 space-y-4">
        {swAssessment && (
            <section>
                 <h2 className="text-base font-bold text-gray-700 mb-2 underline">ملخص التقييم الاجتماعي</h2>
                 <div className="space-y-1">
                    <PrintField label="السكن والرعاية" value={swAssessment.residence} />
                    <PrintField label="الوضع الاقتصادي" value={swAssessment.economic} />
                    <PrintField label="سلامة المنزل" value={swAssessment.homeSafety?.risks} />
                    <PrintField label="الاحتياجات" value={swAssessment.needs} />
                    <PrintField label="الفحص النفسي" value={swAssessment.psychosocial} />
                    <PrintField label="الإجراءات" value={swAssessment.actions} />
                 </div>
            </section>
        )}
        {swNote && (
            <section>
                <h2 className="text-base font-bold text-gray-700 mb-2 underline">مذكرة المتابعة</h2>
                 <div className="space-y-1">
                    <PrintField label="تغير الوضع" value={swNote.situationChange} />
                    <PrintField label="الإجراءات المتخذة" value={swNote.actionsTaken} />
                    <PrintField label="الخطة" value={swNote.plan} />
                    <PrintField label="ملاحظات" value={swNote.swNote} />
                 </div>
            </section>
        )}
      </div>

       <footer className="mt-16 pt-4 border-t absolute bottom-8 w-[calc(100%-4rem)]">
          <div>
            <p className="font-semibold">{visit.swSign || 'توقيع الأخصائي الاجتماعي'}</p>
            <p className="text-xs text-gray-500 border-t mt-1 pt-1">الأخصائي الاجتماعي</p>
        </div>
       </footer>
    </div>
  );
};

export default SwPrintView;