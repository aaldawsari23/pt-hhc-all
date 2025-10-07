import React, { memo, useState, useMemo } from 'react';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import PatientCard from './PatientCard';
import AddPatientModal from './AddPatientModal';
import { Inbox, Plus } from 'lucide-react';

const PatientList: React.FC = memo(() => {
    const { filteredPatients, state } = useHomeHealthcare();
    const [showAddPatientModal, setShowAddPatientModal] = useState(false);
    const [displayCount, setDisplayCount] = useState(20); // Only show 20 cards initially
    
    const canAddPatients = true; // Allow all roles to add patients for now
    
    // Virtual scrolling - only render visible cards
    const visiblePatients = useMemo(() => {
        return filteredPatients.slice(0, displayCount);
    }, [filteredPatients, displayCount]);
    
    const hasMorePatients = filteredPatients.length > displayCount;
    
    const loadMorePatients = () => {
        setDisplayCount(prev => Math.min(prev + 20, filteredPatients.length));
    };

    if (filteredPatients.length === 0) {
        return (
            <>
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-900">قائمة المرضى</h2>
                        <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                            0
                        </span>
                    </div>
                    {canAddPatients && (
                        <button
                            onClick={() => setShowAddPatientModal(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">إضافة مريض</span>
                        </button>
                    )}
                </div>
                
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 animate-fade-in">
                    <div className="bg-blue-50 rounded-full p-6 mb-6">
                        <Inbox size={48} className="text-blue-400" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">لا توجد مرضى</h2>
                    <p className="text-center text-gray-600 max-w-md mb-4">
                        {state.patients.length === 0 
                            ? 'لم يتم إضافة أي مرضى بعد. ابدأ بإضافة مريض جديد.'
                            : 'جرب تعديل معايير البحث أو التصفية للعثور على المرضى.'
                        }
                    </p>
                    {canAddPatients && state.patients.length === 0 && (
                        <button
                            onClick={() => setShowAddPatientModal(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg"
                        >
                            <Plus size={20} />
                            إضافة أول مريض
                        </button>
                    )}
                </div>
                
                {showAddPatientModal && (
                    <AddPatientModal onClose={() => setShowAddPatientModal(false)} />
                )}
            </>
        );
    }
    
    return (
        <>
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">قائمة المرضى</h2>
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                        {filteredPatients.length}
                    </span>
                </div>
                {canAddPatients && (
                    <button
                        onClick={() => setShowAddPatientModal(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
                    >
                        <Plus size={18} />
                        <span className="hidden sm:inline">إضافة مريض</span>
                    </button>
                )}
            </div>
            
            <div className="mobile-grid gap-4 md:gap-6 virtualized-list">
                {visiblePatients.map((patient) => (
                    <div key={patient.nationalId} className="list-item">
                        <PatientCard patient={patient} />
                    </div>
                ))}
            </div>
            
            {hasMorePatients && (
                <div className="mt-6 text-center">
                    <button
                        onClick={loadMorePatients}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors font-medium"
                    >
                        عرض المزيد ({filteredPatients.length - displayCount} متبقي)
                    </button>
                </div>
            )}
            
            {displayCount >= filteredPatients.length && filteredPatients.length > 20 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                    تم عرض جميع المرضى ({filteredPatients.length})
                </div>
            )}
            
            {showAddPatientModal && (
                <AddPatientModal onClose={() => setShowAddPatientModal(false)} />
            )}
        </>
    );
});

PatientList.displayName = 'PatientList';

export default PatientList;
