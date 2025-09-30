import React from 'react';
import { createRoot } from 'react-dom/client';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import { Patient, Visit } from '../types';
import { MapPin, QrCode, Phone, Printer } from 'lucide-react';
import DriverPrintView from './DriverPrintView';

const DriverVisitCard: React.FC<{ visit: Visit, patient: Patient }> = ({ visit, patient }) => {
    const locationQuery = `${patient.areaId}, ${patient.nameAr}`;
    const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(gmapsUrl)}`;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between" dir="rtl">
            <div className="flex-grow">
                <h3 className="font-bold text-lg text-gray-800">{patient.nameAr}</h3>
                <div className="space-y-1 mt-2 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                        <MapPin size={14}/>
                        <span>{patient.areaId}</span>
                    </p>
                    <p className="flex items-center gap-2">
                        <Phone size={14}/>
                        <span className="font-mono" dir="ltr">{patient.phone || 'لا يوجد'}</span>
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
                 <a href={gmapsUrl} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors" title="فتح في خرائط جوجل">
                    <MapPin size={24} />
                </a>
                <img src={qrUrl} alt="QR Code" className="w-24 h-24 rounded-md border" />
            </div>
        </div>
    );
}

const DriverView: React.FC = () => {
    const { state } = useHomeHealthcare();
    const today = new Date().toISOString().split('T')[0];

    const todayVisits = state.visits.filter(v => v.date === today);

    const visitsByArea = todayVisits.reduce((acc, visit) => {
        const patient = state.patients.find(p => p.nationalId === visit.patientId);
        if (patient && patient.areaId) {
            (acc[patient.areaId] = acc[patient.areaId] || []).push(visit);
        }
        return acc;
    }, {} as Record<string, Visit[]>);

    const areas = Object.keys(visitsByArea).sort();
    
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Driver Route</title><script src="https://cdn.tailwindcss.com"></script></head><body><div id="print-root"></div></body></html>');
            printWindow.document.close();
            const printRoot = printWindow.document.getElementById('print-root');
            if (printRoot) {
                const root = createRoot(printRoot);
                root.render(<DriverPrintView visits={todayVisits} patients={state.patients} date={today} />);
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 500);
            }
        }
    };


    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6" dir="rtl">
            <div className="max-w-4xl mx-auto">
                 <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">مسار اليوم - {today}</h1>
                    {todayVisits.length > 0 && (
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300">
                            <Printer size={16} /> طباعة المسار
                        </button>
                    )}
                 </div>
                 {areas.length > 0 ? (
                    <div className="space-y-6">
                        {areas.map(area => (
                            <div key={area}>
                                <h2 className="text-xl font-semibold text-gray-700 mb-3 pb-2 border-b">{area}</h2>
                                <div className="space-y-3">
                                    {visitsByArea[area].map(visit => {
                                        const patient = state.patients.find(p => p.nationalId === visit.patientId);
                                        return patient ? <DriverVisitCard key={visit.patientId} visit={visit} patient={patient} /> : null;
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                 ) : (
                    <div className="text-center py-16 text-gray-500">
                        <p className="text-lg">لا توجد زيارات مجدولة لهذا اليوم.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default DriverView;
