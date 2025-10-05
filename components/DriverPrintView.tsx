import React from 'react';
import { Visit, Patient } from '../types';

interface Props {
  visits: Visit[];
  patients: Patient[];
  date: string;
}

const DriverPrintView: React.FC<Props> = ({ visits, patients, date }) => {
    
    const visitsByArea = visits.reduce((acc, visit) => {
        const patient = patients.find(p => p.nationalId === visit.patientId);
        if (patient && patient.areaId) {
            (acc[patient.areaId] = acc[patient.areaId] || []).push(visit);
        }
        return acc;
    }, {} as Record<string, Visit[]>);

    const areas = Object.keys(visitsByArea).sort();

    return (
        <div className="p-8 font-sans text-sm" style={{ width: '210mm', minHeight: '297mm' }} dir="rtl">
            <header className="flex items-center justify-between pb-4 border-b">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">مسار السائق اليومي</h1>
                    <p className="text-lg text-gray-600">تجمع عسير الصحي – مستشفى الملك عبدالله ببيشة</p>\n                    <p className="text-sm text-gray-500">الرعاية الصحية المنزلية</p>
                </div>
                <div className="text-right text-xs text-gray-500">
                    <p><strong>التاريخ:</strong> {new Date(date).toLocaleDateString()}</p>
                </div>
            </header>
            
            <div className="mt-6 space-y-6">
                {areas.map(area => (
                    <div key={area}>
                        <h2 className="text-xl font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-gray-300">{area}</h2>
                        <div className="space-y-4">
                            {visitsByArea[area].map(visit => {
                                const patient = patients.find(p => p.nationalId === visit.patientId);
                                if (!patient) return null;

                                const locationQuery = `${patient.areaId}, ${patient.nameAr}`;
                                const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`;
                                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(gmapsUrl)}`;

                                return (
                                    <div key={patient.nationalId} className="p-3 border rounded-lg bg-gray-50/50 flex items-center justify-between gap-4 break-inside-avoid">
                                        <div className="flex-grow">
                                            <h3 className="font-bold text-lg text-gray-800">{patient.nameAr}</h3>
                                            <p className="text-gray-600">{patient.areaId}</p>
                                            <p className="text-gray-600 font-mono" dir="ltr">{patient.phone || 'لا يوجد رقم'}</p>
                                            <a href={gmapsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                                                فتح في خرائط جوجل
                                            </a>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <img src={qrUrl} alt="QR Code" className="w-20 h-20 rounded border" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DriverPrintView;
