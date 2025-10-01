import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Cloud, Wifi, WifiOff, Database, Download, Upload, CheckCircle, AlertCircle, Server, FileText, RefreshCw } from 'lucide-react';
import { initializeGAS, getGAS, isGASEnabled, DEFAULT_GAS_CONFIG, GASConfig } from '../utils/gasIntegration';
import { useFirebase } from '../context/FirebaseContext';
import PdfManager from './PdfManager';

const Settings: React.FC = () => {
  const { useNetlifyDb, switchToNetlifyDb, switchToFirebase, syncStatus: firebaseSyncStatus, state } = useFirebase();
  const [refreshing, setRefreshing] = useState(false);
  const [gasConfig, setGasConfig] = useState<GASConfig>(DEFAULT_GAS_CONFIG);

  const handleRefreshData = async () => {
    if (!useNetlifyDb) return;
    
    try {
      setRefreshing(true);
      
      // Force reload from Netlify DB
      console.log('🔄 Manual refresh: Force loading Netlify DB data...');
      
      // We need to call the loadDataFromNetlifyDb function from context
      // For now, we'll reload the page to force data refresh
      window.location.reload();
      
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error' | 'disabled'>('disabled');
  const [syncStatus, setSyncStatus] = useState<{ isOnline: boolean; queueLength: number; lastSync: string } | null>(null);

  useEffect(() => {
    // Load saved configuration from localStorage
    const savedConfig = localStorage.getItem('gas-config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setGasConfig(config);
        if (config.baseUrl && config.baseUrl !== DEFAULT_GAS_CONFIG.baseUrl) {
          initializeConnection(config);
        }
      } catch (error) {
        console.error('Failed to load GAS config:', error);
      }
    }

    // Update sync status periodically
    const interval = setInterval(updateSyncStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateSyncStatus = () => {
    if (isGASEnabled()) {
      const gas = getGAS();
      if (gas) {
        setSyncStatus(gas.getSyncStatus());
      }
    }
  };

  const initializeConnection = async (config: GASConfig) => {
    setConnectionStatus('checking');
    
    try {
      const gas = initializeGAS(config);
      const healthCheck = await gas.healthCheck();
      
      if (healthCheck.success) {
        setIsConnected(true);
        setConnectionStatus('connected');
        localStorage.setItem('gas-config', JSON.stringify(config));
      } else {
        setIsConnected(false);
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('GAS connection failed:', error);
      setIsConnected(false);
      setConnectionStatus('error');
    }
  };

  const handleConnect = () => {
    if (gasConfig.baseUrl && gasConfig.baseUrl.trim() !== '') {
      initializeConnection(gasConfig);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setConnectionStatus('disabled');
    setSyncStatus(null);
    localStorage.removeItem('gas-config');
    setGasConfig(DEFAULT_GAS_CONFIG);
  };

  const handleExportData = async () => {
    const gas = getGAS();
    if (!gas) return;

    try {
      const result = await gas.exportToCSV('patients');
      if (result.success && result.data) {
        const blob = new Blob([result.data.csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.data.filename || 'patients_export.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'checking':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'connected':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <Cloud size={16} className="text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'checking':
        return 'Connecting...';
      case 'connected':
        return 'Connected to Google Apps Script';
      case 'error':
        return 'Connection failed';
      default:
        return 'Not connected';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <SettingsIcon size={24} className="text-blue-200" />
          <div>
            <h1 className="text-2xl font-bold">Application Settings</h1>
            <p className="text-blue-200">Configure database backend and data management</p>
          </div>
        </div>
      </div>

      {/* Database Configuration */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <Database size={20} className="text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Database Configuration</h2>
        </div>

        <div className="space-y-4">
          {/* Current Database */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              {useNetlifyDb ? (
                <Server size={20} className="text-green-600" />
              ) : (
                <Cloud size={20} className="text-blue-600" />
              )}
              <div>
                <p className="font-medium text-gray-800">
                  Current Database: {useNetlifyDb ? 'Netlify DB (PostgreSQL)' : 'Firebase Firestore'}
                </p>
                <p className="text-sm text-gray-600">
                  {useNetlifyDb 
                    ? 'Using Netlify DB powered by Neon PostgreSQL' 
                    : 'Using Firebase Firestore with offline sync'
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  📊 Patients: {state.patients.filter(p => p.status !== 'deceased').length} active | 
                  👨‍⚕️ Staff: {state.staff.length} | 
                  🏥 Visits: {state.visits.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-sm text-green-600 font-medium">Active</span>
              {useNetlifyDb && (
                <button
                  onClick={handleRefreshData}
                  disabled={refreshing}
                  className="ml-2 p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                  title="تحديث البيانات من قاعدة البيانات"
                >
                  <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                </button>
              )}
            </div>
          </div>

          {/* Database Switch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={switchToFirebase}
              disabled={!useNetlifyDb}
              className={`p-4 rounded-xl border-2 transition-all ${
                !useNetlifyDb
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-blue-300 text-gray-700'
              } ${!useNetlifyDb ? 'cursor-default' : 'hover:bg-blue-50'}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Cloud size={20} className={!useNetlifyDb ? 'text-blue-600' : 'text-gray-500'} />
                <span className="font-medium">Firebase Firestore</span>
              </div>
              <p className="text-sm text-left">
                Google's NoSQL cloud database with real-time sync and offline support
              </p>
              {!useNetlifyDb && (
                <div className="mt-2 flex items-center gap-1 text-sm font-medium text-blue-600">
                  <CheckCircle size={14} />
                  Currently Active
                </div>
              )}
            </button>

            <button
              onClick={switchToNetlifyDb}
              disabled={useNetlifyDb}
              className={`p-4 rounded-xl border-2 transition-all ${
                useNetlifyDb
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-green-300 text-gray-700'
              } ${useNetlifyDb ? 'cursor-default' : 'hover:bg-green-50'}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Server size={20} className={useNetlifyDb ? 'text-green-600' : 'text-gray-500'} />
                <span className="font-medium">Netlify DB (PostgreSQL)</span>
              </div>
              <p className="text-sm text-left">
                Production-grade PostgreSQL database powered by Neon with Netlify integration
              </p>
              {useNetlifyDb && (
                <div className="mt-2 flex items-center gap-1 text-sm font-medium text-green-600">
                  <CheckCircle size={14} />
                  Currently Active
                </div>
              )}
            </button>
          </div>

          {/* Sync Status */}
          {firebaseSyncStatus && (
            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Wifi size={16} className="text-blue-600" />
                <span className="font-medium text-blue-800">Sync Status</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-blue-700">
                <span className="flex items-center gap-1">
                  {firebaseSyncStatus.isOnline ? 'Online' : 'Offline'}
                </span>
                {firebaseSyncStatus.queueLength > 0 && (
                  <span>Queue: {firebaseSyncStatus.queueLength} items</span>
                )}
              </div>
            </div>
          )}

          {/* Import Success Status */}
          {useNetlifyDb && state.patients.length > 100 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 mb-1">Data Import Successful</p>
                  <p className="text-sm text-green-700">
                    Your v3 healthcare database has been successfully imported to Netlify DB. 
                    All {state.patients.filter(p => p.status !== 'deceased').length} active patients and Arabic data are now available.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Database Migration Warning */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 mb-1">Database Migration</p>
                <p className="text-sm text-amber-700">
                  When switching databases, your current data will be automatically synced to the new database. 
                  This process may take a few moments depending on the amount of data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Integration (Optional) */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg opacity-75">
        <div className="flex items-center gap-3 mb-6">
          <Cloud size={20} className="text-gray-500" />
          <div>
            <h2 className="text-xl font-bold text-gray-600">Advanced Integration (Optional)</h2>
            <p className="text-sm text-gray-500">Additional external system integrations</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <p className="font-medium text-gray-800">{getStatusText()}</p>
                {syncStatus && (
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      {syncStatus.isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                      {syncStatus.isOnline ? 'Online' : 'Offline'}
                    </span>
                    <span>Queue: {syncStatus.queueLength} items</span>
                    <span>Last sync: {syncStatus.lastSync}</span>
                  </div>
                )}
              </div>
            </div>
            {isConnected && (
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
              >
                Disconnect
              </button>
            )}
          </div>

          {/* Configuration Form */}
          {!isConnected && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Apps Script Web App URL
                </label>
                <input
                  type="url"
                  value={gasConfig.baseUrl}
                  onChange={(e) => setGasConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Enter the web app URL from your deployed Google Apps Script
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key (Optional)
                </label>
                <input
                  type="password"
                  value={gasConfig.apiKey || ''}
                  onChange={(e) => setGasConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Optional API key for authentication"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeout (milliseconds)
                </label>
                <input
                  type="number"
                  value={gasConfig.timeout}
                  onChange={(e) => setGasConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) || 30000 }))}
                  min="5000"
                  max="120000"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                />
              </div>

              <button
                onClick={handleConnect}
                disabled={!gasConfig.baseUrl || gasConfig.baseUrl === DEFAULT_GAS_CONFIG.baseUrl || connectionStatus === 'checking'}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {connectionStatus === 'checking' ? 'Connecting...' : 'Connect to Google Apps Script'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <Database size={20} className="text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Data Management</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleExportData}
            disabled={!isConnected}
            className="flex items-center justify-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={20} className="text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-gray-800">Export Data</p>
              <p className="text-sm text-gray-600">Download patient data as CSV</p>
            </div>
          </button>

          <div className="flex items-center justify-center gap-3 p-4 border-2 border-gray-200 rounded-xl opacity-50">
            <Upload size={20} className="text-gray-400" />
            <div className="text-left">
              <p className="font-medium text-gray-600">Import Data</p>
              <p className="text-sm text-gray-500">Upload CSV data (Coming soon)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Help & Documentation */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Setup Instructions</h2>
        <div className="prose text-sm text-gray-600 space-y-3">
          <div>
            <h3 className="font-bold text-gray-800">1. Create Google Apps Script Project</h3>
            <p>Go to <a href="https://script.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">script.google.com</a> and create a new project.</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">2. Add Required Libraries</h3>
            <p>Enable Google Drive API and Google Sheets API in your Apps Script project.</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">3. Deploy as Web App</h3>
            <p>Deploy your script as a web app with "Anyone" access permissions.</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">4. Copy Web App URL</h3>
            <p>Copy the deployment URL and paste it in the configuration above.</p>
          </div>
        </div>
      </div>

      {/* PDF Management */}
      {useNetlifyDb && (
        <PdfManager showUpload={true} showGenerate={false} />
      )}
    </div>
  );
};

export default Settings;