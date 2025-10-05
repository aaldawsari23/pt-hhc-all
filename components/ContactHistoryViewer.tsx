import React, { useState, useMemo } from 'react';
import { Phone, PhoneOff, DoorClosed, Clock, MessageSquare, Calendar, X, Filter, TrendingUp, AlertCircle, CheckCircle2, Users, BarChart } from 'lucide-react';
import { ContactAttempt, Patient } from '../types';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';

interface ContactHistoryViewerProps {
  patient: Patient;
  onClose: () => void;
}

const ContactHistoryViewer: React.FC<ContactHistoryViewerProps> = ({
  patient,
  onClose
}) => {
  const [filterType, setFilterType] = useState<'all' | 'successful' | 'failed' | 'pending'>('all');
  const [filterMethod, setFilterMethod] = useState<'all' | 'Phone Call' | 'Home Visit' | 'WhatsApp' | 'SMS'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'outcome'>('date');

  const contactAttempts = patient.contactAttempts || [];

  // Filter and sort contact attempts
  const filteredAndSortedAttempts = useMemo(() => {
    let filtered = contactAttempts.filter(attempt => {
      if (filterType !== 'all') {
        switch (filterType) {
          case 'successful':
            return attempt.outcome === 'Successful';
          case 'failed':
            return attempt.outcome === 'Failed';
          case 'pending':
            return attempt.outcome === 'Rescheduled';
        }
      }
      
      if (filterMethod !== 'all') {
        return attempt.contactMethod === filterMethod;
      }
      
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'type':
          return a.type.localeCompare(b.type);
        case 'outcome':
          return (a.outcome || '').localeCompare(b.outcome || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [contactAttempts, filterType, filterMethod, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = contactAttempts.length;
    const successful = contactAttempts.filter(a => a.outcome === 'Successful').length;
    const failed = contactAttempts.filter(a => a.outcome === 'Failed').length;
    const pending = contactAttempts.filter(a => a.outcome === 'Rescheduled').length;
    const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;
    
    // Most common contact method
    const methodCounts = contactAttempts.reduce((acc, attempt) => {
      acc[attempt.contactMethod || 'Unknown'] = (acc[attempt.contactMethod || 'Unknown'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonMethod = Object.entries(methodCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
    
    // Recent attempts (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentAttempts = contactAttempts.filter(a => new Date(a.date) > sevenDaysAgo).length;
    
    return {
      total,
      successful,
      failed,
      pending,
      successRate,
      mostCommonMethod,
      recentAttempts
    };
  }, [contactAttempts]);

  const getContactIcon = (type: string, method: string) => {
    switch (method) {
      case 'Phone Call':
        return type === 'Phone Answered' ? Phone : PhoneOff;
      case 'Home Visit':
        return DoorClosed;
      case 'WhatsApp':
      case 'SMS':
        return MessageSquare;
      default:
        return Phone;
    }
  };

  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case 'Successful':
        return 'text-green-600 bg-green-100';
      case 'Failed':
        return 'text-red-600 bg-red-100';
      case 'Rescheduled':
        return 'text-blue-600 bg-blue-100';
      case 'Cancelled':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Phone Answered':
      case 'Family Answered':
        return 'text-green-600';
      case 'No Answer':
      case 'Busy':
      case 'Phone Off':
        return 'text-yellow-600';
      case 'Door Not Opened':
      case 'Patient Not Available':
        return 'text-orange-600';
      case 'Wrong Number':
      case 'Refused Visit':
        return 'text-red-600';
      case 'Rescheduled':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const renderContactAttempt = (attempt: ContactAttempt, index: number) => {
    const Icon = getContactIcon(attempt.type, attempt.contactMethod || 'Phone Call');
    const attemptDate = new Date(attempt.date);
    
    return (
      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(attempt.type)} bg-opacity-10`}>
            <Icon size={20} className={getTypeColor(attempt.type)} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">{attempt.type}</h4>
                <p className="text-sm text-gray-600">{attempt.contactMethod}</p>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {attemptDate.toLocaleDateString('ar-SA')}
                </p>
                <p className="text-xs text-gray-500">
                  {attemptDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            
            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div>
                <span className="text-xs text-gray-500 block">Staff | الموظف</span>
                <span className="text-sm font-medium">{attempt.staffName}</span>
              </div>
              
              {attempt.callDuration && (
                <div>
                  <span className="text-xs text-gray-500 block">Duration | المدة</span>
                  <span className="text-sm font-medium">{attempt.callDuration} min</span>
                </div>
              )}
              
              {attempt.outcome && (
                <div>
                  <span className="text-xs text-gray-500 block">Outcome | النتيجة</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${getOutcomeColor(attempt.outcome)}`}>
                    {attempt.outcome}
                  </span>
                </div>
              )}
            </div>
            
            {/* Notes */}
            {attempt.notes && (
              <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500">
                <span className="text-xs text-gray-500 block mb-1">Notes | الملاحظات</span>
                <p className="text-sm text-gray-700">{attempt.notes}</p>
              </div>
            )}
            
            {/* Next Attempt */}
            {attempt.nextAttemptScheduled && (
              <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Calendar size={14} />
                  <span className="text-xs font-medium">
                    Next attempt scheduled: {new Date(attempt.nextAttemptScheduled).toLocaleString('ar-SA')}
                  </span>
                </div>
              </div>
            )}
          </div>
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
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Phone className="text-orange-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Contact History</h2>
              <p className="text-sm text-gray-600">تاريخ التواصل - {patient.nameAr}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stats Section */}
        <div className="p-4 md:p-6 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart size={16} />
            Contact Statistics | إحصائيات التواصل
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-gray-600">Total Attempts</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
              <div className="text-xs text-gray-600">Successful</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-xs text-gray-600">Failed</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.successRate}%</div>
              <div className="text-xs text-gray-600">Success Rate</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
              <div className="text-lg font-bold text-orange-600">{stats.mostCommonMethod}</div>
              <div className="text-xs text-gray-600">Preferred Method</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.recentAttempts}</div>
              <div className="text-xs text-gray-600">Last 7 Days</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Outcomes</option>
              <option value="successful">Successful Only</option>
              <option value="failed">Failed Only</option>
              <option value="pending">Pending Only</option>
            </select>
            
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value as any)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Methods</option>
              <option value="Phone Call">Phone Call</option>
              <option value="Home Visit">Home Visit</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="SMS">SMS</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="date">Sort by Date</option>
              <option value="type">Sort by Type</option>
              <option value="outcome">Sort by Outcome</option>
            </select>
            
            <div className="ml-auto text-sm text-gray-500">
              Showing {filteredAndSortedAttempts.length} of {contactAttempts.length} attempts
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {filteredAndSortedAttempts.length > 0 ? (
            <div className="space-y-4">
              {filteredAndSortedAttempts.map((attempt, index) => renderContactAttempt(attempt, index))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              {contactAttempts.length === 0 ? (
                <>
                  <Phone size={48} className="mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Contact History</h3>
                  <p className="text-center">No contact attempts have been recorded for this patient yet.</p>
                  <p className="text-center text-sm mt-1">لا توجد محاولات اتصال مسجلة لهذا المريض بعد</p>
                </>
              ) : (
                <>
                  <Filter size={48} className="mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
                  <p className="text-center">No contact attempts match your current filters.</p>
                  <p className="text-center text-sm mt-1">لا توجد محاولات اتصال تطابق المرشحات الحالية</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer with Action Buttons */}
        <div className="border-t border-gray-200 p-4 md:p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Patient ID: {patient.nationalId} | Area: {patient.areaId || 'N/A'}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactHistoryViewer;