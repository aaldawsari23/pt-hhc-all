import React from 'react';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import PatientCard from './PatientCard';
import { Inbox } from 'lucide-react';

const PatientList: React.FC = () => {
    const { filteredPatients } = useHomeHealthcare();

    if (filteredPatients.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 animate-fade-in">
                <div className="bg-blue-50 rounded-full p-6 mb-6">
                    <Inbox size={48} className="text-blue-400" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">No Patients Found</h2>
                <p className="text-center text-gray-600 max-w-md">Try adjusting your search or filter criteria to find patients.</p>
            </div>
        );
    }
    
    return (
        <div className="mobile-grid gap-4 md:gap-6 animate-fade-in">
            {filteredPatients.map((patient, index) => (
                <div key={patient.nationalId} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <PatientCard patient={patient} />
                </div>
            ))}
        </div>
    );
};

export default PatientList;
