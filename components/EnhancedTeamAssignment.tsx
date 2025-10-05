import React, { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, Clock, CheckCircle2, AlertCircle, UserCheck, X, Plus, ChevronRight } from 'lucide-react';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';
import { Patient, Team, Staff, Role } from '../types';

interface EnhancedTeamAssignmentProps {
  selectedPatients: Patient[];
  onClose: () => void;
  onAssign: (assignments: TeamAssignment[]) => void;
}

interface TeamAssignment {
  patientIds: string[];
  teamId: string;
  date: string;
  notes?: string;
}

interface PatientGroup {
  areaId: string;
  patients: Patient[];
}

const EnhancedTeamAssignment: React.FC<EnhancedTeamAssignmentProps> = ({
  selectedPatients,
  onClose,
  onAssign
}) => {
  const { state } = useHomeHealthcare();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [assignments, setAssignments] = useState<Map<string, TeamAssignment>>(new Map());
  const [groupBy, setGroupBy] = useState<'area' | 'team' | 'none'>('area');
  const [showSummary, setShowSummary] = useState(false);
  const [assignmentNotes, setAssignmentNotes] = useState<string>('');

  // Group patients by area for better organization
  const patientGroups: PatientGroup[] = React.useMemo(() => {
    if (groupBy === 'none') {
      return [{ areaId: 'all', patients: selectedPatients }];
    }
    
    const grouped = selectedPatients.reduce((acc, patient) => {
      const area = patient.areaId || 'unassigned';
      if (!acc[area]) {
        acc[area] = [];
      }
      acc[area].push(patient);
      return acc;
    }, {} as Record<string, Patient[]>);

    return Object.entries(grouped).map(([areaId, patients]) => ({
      areaId,
      patients: patients.sort((a, b) => a.nameAr.localeCompare(b.nameAr))
    }));
  }, [selectedPatients, groupBy]);

  // Initialize assignments
  useEffect(() => {
    const initialAssignments = new Map<string, TeamAssignment>();
    
    patientGroups.forEach(group => {
      const assignmentId = `${group.areaId}_${selectedDate}`;
      initialAssignments.set(assignmentId, {
        patientIds: group.patients.map(p => p.nationalId),
        teamId: state.teams[0]?.id || '',
        date: selectedDate,
        notes: ''
      });
    });
    
    setAssignments(initialAssignments);
  }, [patientGroups, selectedDate, state.teams]);

  const updateAssignment = (groupId: string, updates: Partial<TeamAssignment>) => {
    setAssignments(prev => {
      const newAssignments = new Map(prev);
      const existing = newAssignments.get(groupId);
      if (existing) {
        newAssignments.set(groupId, { ...existing, ...updates });
      }
      return newAssignments;
    });
  };

  const getTeamWorkload = (teamId: string) => {
    let totalPatients = 0;
    assignments.forEach(assignment => {
      if (assignment.teamId === teamId) {
        totalPatients += assignment.patientIds.length;
      }
    });
    
    // Add existing visits for the selected date
    const existingVisits = state.visits.filter(v => v.date === selectedDate && v.teamId === teamId);
    totalPatients += existingVisits.length;
    
    return totalPatients;
  };

  const getTeamMembers = (teamId: string): Staff[] => {
    const team = state.teams.find(t => t.id === teamId);
    return team?.members || [];
  };

  const handleAssignAll = () => {
    const finalAssignments: TeamAssignment[] = Array.from(assignments.values())
      .filter(assignment => assignment.teamId && assignment.patientIds.length > 0);
    
    onAssign(finalAssignments);
    onClose();
  };

  const renderPatientCard = (patient: Patient, groupId: string) => {
    const assignment = assignments.get(groupId);
    const isAssigned = assignment?.teamId && assignment.teamId !== '';
    
    return (
      <div key={patient.nationalId} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {patient.nameAr.charAt(0)}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">{patient.nameAr}</h4>
            <p className="text-xs text-gray-500">{patient.nationalId}</p>
            
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
              {patient.areaId && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {patient.areaId}
                </span>
              )}
              
              {patient.phone && (
                <span className="flex items-center gap-1">
                  <span>📞</span>
                  {patient.phone.slice(-4)}
                </span>
              )}
              
              {patient.tags.length > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  {patient.tags.length} conditions
                </span>
              )}
            </div>
            
            {/* Risk indicators */}
            <div className="flex flex-wrap gap-1 mt-2">
              {patient.hasCatheter && (
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Catheter</span>
              )}
              {patient.wounds?.presentCount && patient.wounds.presentCount > 0 && (
                <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded">Wounds</span>
              )}
              {patient.fallHighRisk && (
                <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">Fall Risk</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            {isAssigned ? (
              <CheckCircle2 size={16} className="text-green-500" />
            ) : (
              <AlertCircle size={16} className="text-orange-500" />
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTeamSelector = (groupId: string, group: PatientGroup) => {
    const assignment = assignments.get(groupId);
    const selectedTeamId = assignment?.teamId || '';
    
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assign Team for {group.areaId === 'all' ? 'All Patients' : `Area: ${group.areaId}`}
          <span className="text-gray-500 ml-1">({group.patients.length} patients)</span>
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {state.teams.map(team => {
            const workload = getTeamWorkload(team.id);
            const members = getTeamMembers(team.id);
            const isSelected = selectedTeamId === team.id;
            const isOverloaded = workload > 8; // Threshold for high workload
            
            return (
              <button
                key={team.id}
                onClick={() => updateAssignment(groupId, { teamId: team.id })}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 bg-white'
                } ${isOverloaded ? 'ring-2 ring-orange-200' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{team.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    workload === 0 ? 'bg-green-100 text-green-700' :
                    workload <= 4 ? 'bg-blue-100 text-blue-700' :
                    workload <= 8 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {workload} patients
                  </span>
                </div>
                
                <div className="space-y-1">
                  {members.map(member => (
                    <div key={member.الاسم} className="flex items-center gap-2 text-xs text-gray-600">
                      <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                        {member.المهنة === 'طبيب' ? 'Dr' : member.المهنة === 'ممرض' ? 'RN' : 'S'}
                      </div>
                      <span className="truncate">{member.الاسم}</span>
                    </div>
                  ))}
                </div>
                
                {isOverloaded && (
                  <div className="mt-2 text-xs text-orange-600 flex items-center gap-1">
                    <AlertCircle size={12} />
                    High workload
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAssignmentSummary = () => {
    const totalAssignments = Array.from(assignments.values()).filter(a => a.teamId);
    const totalPatients = selectedPatients.length;
    const assignedPatients = totalAssignments.reduce((sum, a) => sum + a.patientIds.length, 0);
    
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
          <Users size={16} />
          Assignment Summary | ملخص التكليفات
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalPatients}</div>
            <div className="text-xs text-gray-600">Total Patients</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{assignedPatients}</div>
            <div className="text-xs text-gray-600">Assigned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{totalPatients - assignedPatients}</div>
            <div className="text-xs text-gray-600">Unassigned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{state.teams.length}</div>
            <div className="text-xs text-gray-600">Teams Available</div>
          </div>
        </div>
        
        <div className="space-y-2">
          {state.teams.map(team => {
            const workload = getTeamWorkload(team.id);
            const teamAssignments = Array.from(assignments.values()).filter(a => a.teamId === team.id);
            
            if (teamAssignments.length === 0) return null;
            
            return (
              <div key={team.id} className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{team.name}</span>
                  <span className="text-sm text-gray-600">{workload} patients total</span>
                </div>
                
                <div className="text-xs text-gray-600">
                  {teamAssignments.map(assignment => {
                    const group = patientGroups.find(g => 
                      assignment.patientIds.every(id => g.patients.some(p => p.nationalId === id))
                    );
                    return group ? `${group.areaId} (${assignment.patientIds.length})` : '';
                  }).filter(Boolean).join(', ')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 md:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Enhanced Team Assignment</h2>
              <p className="text-sm text-gray-600">تكليف الفرق المحسن - Assign {selectedPatients.length} patients to teams</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visit Date | تاريخ الزيارة
              </label>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group By | تجميع حسب
              </label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as 'area' | 'team' | 'none')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="area">Area / المنطقة</option>
                <option value="none">No Grouping / بدون تجميع</option>
              </select>
            </div>
            
            <div className="flex items-end gap-2">
              <button
                onClick={() => setShowSummary(!showSummary)}
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-all flex items-center gap-2"
              >
                <Users size={16} />
                {showSummary ? 'Hide' : 'Show'} Summary
              </button>
            </div>
          </div>
          
          {showSummary && renderAssignmentSummary()}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-6">
            {patientGroups.map(group => {
              const groupId = `${group.areaId}_${selectedDate}`;
              
              return (
                <div key={groupId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <MapPin size={16} className="text-blue-500" />
                      {group.areaId === 'all' ? 'All Patients' : `Area: ${group.areaId}`}
                      <span className="text-sm font-normal text-gray-500">
                        ({group.patients.length} patients)
                      </span>
                    </h3>
                    
                    {renderTeamSelector(groupId, group)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {group.patients.map(patient => renderPatientCard(patient, groupId))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 md:p-6 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignment Notes | ملاحظات التكليف
              </label>
              <input
                type="text"
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                placeholder="Optional notes for this assignment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              
              <button
                onClick={handleAssignAll}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 font-medium"
              >
                <UserCheck size={16} />
                Assign All Patients
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTeamAssignment;