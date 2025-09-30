import React from 'react';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import PatientCard from './PatientCard';
import { Inbox } from 'lucide-react';

const PatientList: React.FC = () => {
    const { filteredPatients } = useHomeHealthcare();

    if (filteredPatients.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Inbox size={48} className="mb-4" />
                <h2 className="text-xl font-semibold">No Patients Found</h2>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filteredPatients.map(patient => (
                <PatientCard key={patient.nationalId} patient={patient} />
            ))}
        </div>
    );
};

export default PatientList;
