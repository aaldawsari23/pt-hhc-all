import React, { useState, useEffect } from 'react';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import { ChevronLeft, ChevronRight, Calendar, Clock, Users, Plus, X, Edit3 } from 'lucide-react';
import { Visit } from '../types';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Scheduler: React.FC = () => {
    const { state, dispatch } = useHomeHealthcare();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
    const [popover, setPopover] = useState<{ x: number, y: number, visit: Visit } | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showBulkScheduler, setShowBulkScheduler] = useState(false);
    const [selectedPatients, setSelectedPatients] = useState<string[]>([]);

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
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Calendar size={24} className="text-blue-200" />
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold">
                                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </h2>
                            <p className="text-blue-200 text-sm">Schedule & Appointments</p>
                        </div>
                    </div>
                    
                    {/* Enhanced Controls */}
                    <div className="flex items-center gap-2">
                        {/* جدولة جماعية للمرضى */}
                        <button
                            onClick={() => setShowBulkScheduler(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 shadow-sm"
                            title="جدولة زيارات جماعية | Bulk Schedule"
                        >
                            <Plus size={16} />
                            <span className="hidden md:inline">جدولة جماعية</span>
                        </button>
                        
                        <div className="flex bg-white/20 rounded-xl p-1">
                            {(['month', 'week', 'day'] as const).map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 touch-target-44 ${
                                        viewMode === mode 
                                            ? 'bg-white text-blue-700 shadow-md' 
                                            : 'text-white hover:bg-white/30'
                                    }`}
                                >
                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Navigation */}
                <div className="flex items-center justify-between mt-4">
                    <button 
                        onClick={() => changeMonth(-1)} 
                        className="p-2 md:p-3 rounded-xl hover:bg-white/20 transition-colors touch-target-44"
                    >
                        <ChevronLeft size={20}/>
                    </button>
                    
                    <button 
                        onClick={() => setCurrentDate(new Date())}
                        className="px-4 py-2 bg-white/20 rounded-xl text-sm font-medium hover:bg-white/30 transition-colors"
                    >
                        Today
                    </button>
                    
                    <button 
                        onClick={() => changeMonth(1)} 
                        className="p-2 md:p-3 rounded-xl hover:bg-white/20 transition-colors touch-target-44"
                    >
                        <ChevronRight size={20}/>
                    </button>
                </div>
            </div>
            
            {/* Calendar Content */}
            <div className="p-4 md:p-6">
                {viewMode === 'month' && (
                    <div className="grid grid-cols-7 gap-1 md:gap-2">
                        {daysOfWeek.map(d => (
                            <div key={d} className="text-center text-sm md:text-base font-bold text-gray-700 py-3 bg-gray-50 rounded-lg">
                                {d}
                            </div>
                        ))}
                        {days.map((d, i) => {
                            const dateStr = d.toISOString().split('T')[0];
                            const visitsForDay = visitsByDate[dateStr] || [];
                            const isToday = new Date().toISOString().split('T')[0] === dateStr;
                            const isCurrentMonth = d.getMonth() === currentDate.getMonth();

                            return (
                                <div 
                                    key={i} 
                                    className={`border-2 border-gray-200 rounded-xl h-32 md:h-36 p-2 flex flex-col transition-all duration-200 hover:shadow-md cursor-pointer ${
                                        isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                                    } ${isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                                    onClick={() => setSelectedDate(d)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-sm md:text-base font-bold ${
                                            isToday 
                                                ? 'bg-blue-600 text-white rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center' 
                                                : isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                                        }`}>
                                            {d.getDate()}
                                        </span>
                                        {visitsForDay.length > 0 && (
                                            <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                {visitsForDay.length}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1 overflow-y-auto">
                                        {visitsForDay.slice(0, 3).map(visit => {
                                            const patient = state.patients.find(p => p.nationalId === visit.patientId);
                                            const team = state.teams.find(t => t.id === visit.teamId);
                                            if(!patient) return null;
                                            return (
                                                <div 
                                                    key={visit.patientId} 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openPopover(e, visit);
                                                    }} 
                                                    className={`rounded-lg px-2 py-1 text-xs font-medium truncate cursor-pointer transition-colors ${
                                                        visit.status === 'Completed' 
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                            : visit.status === 'DoctorCompleted' || visit.status === 'NurseCompleted'
                                                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                                    }`}
                                                    title={`${patient.nameAr} - ${team?.name} (${visit.status})`}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        <Users size={10} />
                                                        <span>{patient.nameAr}</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        {visitsForDay.length > 3 && (
                                            <div className="text-xs text-gray-500 text-center py-1">
                                                +{visitsForDay.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                
                {/* Stats Summary */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Visits', value: state.visits.length, color: 'blue' },
                        { label: 'Completed', value: state.visits.filter(v => v.status === 'Completed').length, color: 'green' },
                        { label: 'In Progress', value: state.visits.filter(v => v.status === 'DoctorCompleted' || v.status === 'NurseCompleted').length, color: 'yellow' },
                        { label: 'Scheduled', value: state.visits.filter(v => v.status === 'Scheduled').length, color: 'gray' },
                    ].map(stat => (
                        <div key={stat.label} className={`bg-${stat.color}-50 border-2 border-${stat.color}-200 rounded-xl p-4 text-center`}>
                            <div className={`text-2xl md:text-3xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                            <div className={`text-sm text-${stat.color}-700 font-medium`}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
            {popover && (
                <div 
                    className="fixed z-50 bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-4 min-w-64 animate-fade-in"
                    style={{ 
                        top: Math.min(popover.y + 10, window.innerHeight - 200), 
                        left: Math.min(popover.x, window.innerWidth - 280) 
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {(() => {
                        const patient = state.patients.find(p => p.nationalId === popover.visit.patientId);
                        const team = state.teams.find(t => t.id === popover.visit.teamId);
                        return (
                            <div>
                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                                    <h3 className="font-bold text-gray-800">Visit Details</h3>
                                    <button 
                                        onClick={() => setPopover(null)}
                                        className="p-1 hover:bg-gray-100 rounded-lg"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Patient:</strong> {patient?.nameAr || 'Unknown'}</p>
                                    <p><strong>Team:</strong> {team?.name || 'Unknown'}</p>
                                    <p><strong>Date:</strong> {new Date(popover.visit.date).toLocaleDateString()}</p>
                                    <p><strong>Status:</strong> 
                                        <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                                            popover.visit.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            popover.visit.status === 'DoctorCompleted' || popover.visit.status === 'NurseCompleted' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {popover.visit.status}
                                        </span>
                                    </p>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => {
                                            dispatch({ type: 'MARK_VISIT_COMPLETED', payload: { patientId: popover.visit.patientId, date: popover.visit.date } });
                                            setPopover(null);
                                        }}
                                        className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                        disabled={popover.visit.status === 'Completed'}
                                    >
                                        <Edit3 size={14} />
                                        {popover.visit.status === 'Completed' ? 'مكتملة' : 'إكمال الزيارة'}
                                    </button>
                                    <button
                                        onClick={handleCancelVisit}
                                        className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                    >
                                        <X size={14} />
                                        إلغاء الزيارة
                                    </button>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

export default Scheduler;
