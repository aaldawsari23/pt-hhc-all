import React, { useState } from 'react';
import { Settings as SettingsIcon, Database, CheckCircle, Users, Activity, Clock, FileText } from 'lucide-react';
import { useHomeHealthcare } from '../context/HomeHealthcareContext';

const Settings: React.FC = () => {
  const { state } = useHomeHealthcare();
  const [refreshing, setRefreshing] = useState(false);
  
  // Settings component without Firebase dependencies

  const handleRefreshData = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <SettingsIcon size={24} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
          <p className="text-gray-600">Home Healthcare Management System Configuration</p>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Activity size={20} className="text-blue-600" />
          System Status
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle size={20} className="text-green-600" />
            <div>
              <p className="font-medium text-green-800">System Online</p>
              <p className="text-sm text-green-600">All services running</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Database size={20} className="text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">Data Loaded</p>
              <p className="text-sm text-blue-600">JSON Bundle Active</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Users size={20} className="text-purple-600" />
            <div>
              <p className="font-medium text-purple-800">User Session</p>
              <p className="text-sm text-purple-600">Authenticated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText size={20} className="text-blue-600" />
          Data Statistics
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{state.patients.length}</div>
            <div className="text-sm text-gray-600">Total Patients</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{state.staff.length}</div>
            <div className="text-sm text-gray-600">Staff Members</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{state.areas.length}</div>
            <div className="text-sm text-gray-600">Coverage Areas</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{state.visits.length}</div>
            <div className="text-sm text-gray-600">Scheduled Visits</div>
          </div>
        </div>
      </div>

      {/* System Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock size={20} className="text-blue-600" />
          System Actions
        </h2>
        
        <div className="space-y-3">
          <button
            onClick={handleRefreshData}
            disabled={refreshing}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {refreshing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Refreshing...
              </>
            ) : (
              <>
                <Database size={18} />
                Refresh Data
              </>
            )}
          </button>
          
          <p className="text-sm text-gray-500">
            Refresh the application to reload patient data and clear cache.
          </p>
        </div>
      </div>

      {/* Organization Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Organization Information</h2>
        
        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-gray-800">تجمع عسير الصحي – مستشفى الملك عبدالله ببيشة</h3>
            <p className="text-sm text-gray-600">Aseer Health Cluster – King Abdullah Hospital, Bishah</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800">الرعاية الصحية المنزلية</h4>
            <p className="text-sm text-gray-600">Home Healthcare Department</p>
          </div>
          
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Home Healthcare Management System - Version 1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;