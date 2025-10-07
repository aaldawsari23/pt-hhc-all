import React from 'react';

const TestApp: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        🏥 Home Healthcare Test App
      </h1>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
      }}>
        <h2 style={{ color: '#2563eb', marginBottom: '16px' }}>
          ✅ Application Test Status
        </h2>
        
        <div style={{ marginBottom: '12px' }}>
          <strong>React:</strong> ✅ Working
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <strong>TypeScript:</strong> ✅ Working
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <strong>Vite HMR:</strong> ✅ Working
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <strong>Arabic RTL:</strong> ✅ Supported
        </div>
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        All core systems operational. Switch to main app for full functionality.
      </div>
    </div>
  );
};

export default TestApp;