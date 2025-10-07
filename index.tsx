import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import TestApp from './TestApp';
import ErrorBoundary from './ErrorBoundary';
import './index.css';
import './styles/mobile-improvements.css';

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
      {USE_TEST_APP ? <TestApp /> : <App />}
    </ErrorBoundary>
  </React.StrictMode>
);
