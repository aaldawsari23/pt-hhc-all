import React, { useState, useEffect } from 'react';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Visit } from '../types';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Scheduler: React.FC = () => {
    const { state, dispatch } = useHomeHealthcare();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [popover, setPopover] = useState<{ x: number, y: number, visit: Visit } | null>(null);

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startOfMonth.getDay());
    const endDate = new Date(endOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endOfMonth.getDay()));

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const days = [];
    let day = new Date(startDate);

    while (day <= endDate) {
        days.push(new Date(day));
        day.setDate(day.getDate() + 1);
    }
    
    const visitsByDate = state.visits.reduce((acc, visit) => {
        (acc[visit.date] = acc[visit.date] || []).push(visit);
        return acc;
    }, {} as { [key: string]: typeof state.visits });

    const handleCancelVisit = () => {
        if (popover) {
            if (window.confirm("Are you sure you want to cancel this visit?")) {
                dispatch({ type: 'CANCEL_VISIT', payload: { patientId: popover.visit.patientId, date: popover.visit.date } });
            }
            setPopover(null);
        }
    };

    const openPopover = (e: React.MouseEvent, visit: Visit) => {
        e.stopPropagation();
        setPopover({ x: e.clientX, y: e.clientY, visit });
    };

    useEffect(() => {
        const handleClickOutside = () => setPopover(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);


    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={20}/></button>
                <h2 className="text-lg font-bold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight size={20}/></button>
            </div>
            <div className="grid grid-cols-7 gap-px">
                {daysOfWeek.map(d => <div key={d} className="text-center text-xs font-bold text-gray-500 py-2">{d}</div>)}
                {days.map((d, i) => {
                    const dateStr = d.toISOString().split('T')[0];
                    const visitsForDay = visitsByDate[dateStr] || [];
                    const isToday = new Date().toISOString().split('T')[0] === dateStr;
                    const isCurrentMonth = d.getMonth() === currentDate.getMonth();

                    return (
                        <div key={i} className={`border-t border-l border-gray-200 h-28 p-1 flex flex-col ${isCurrentMonth ? '' : 'bg-gray-50'}`}>
                            <span className={`text-xs font-semibold ${isToday ? 'bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center' : 'text-gray-600'}`}>
                                {d.getDate()}
                            </span>
                            <div className="mt-1 space-y-1 overflow-y-auto">
                                {visitsForDay.map(visit => {
                                    const patient = state.patients.find(p => p.nationalId === visit.patientId);
                                    const team = state.teams.find(t => t.id === visit.teamId);
                                    if(!patient) return null;
                                    return (
                                        <div key={visit.patientId} onClick={(e) => openPopover(e, visit)} className="bg-blue-100 text-blue-800 rounded px-1 py-0.5 text-[10px] truncate cursor-pointer hover:bg-blue-200" title={`${patient.nameAr} - ${team?.name}`}>
                                            {patient.nameAr}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
            {popover && (
                <div 
                    className="absolute z-20 bg-white rounded-md shadow-lg border p-2 text-sm"
                    style={{ top: popover.y + 10, left: popover.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={handleCancelVisit}
                        className="w-full text-left px-2 py-1 rounded hover:bg-red-100 text-red-600"
                    >
                        Cancel Visit
                    </button>
                </div>
            )}
        </div>
    );
};

export default Scheduler;
