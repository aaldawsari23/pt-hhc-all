import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWithAuth from './AppWithAuth';
import TestApp from './TestApp';
import ErrorBoundary from './ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Test mode: Set to true to use simple test app
const USE_TEST_APP = false;

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      {USE_TEST_APP ? <TestApp /> : <AppWithAuth />}
    </ErrorBoundary>
  </React.StrictMode>
);
