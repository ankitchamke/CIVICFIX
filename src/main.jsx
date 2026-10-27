import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { SafeClerkProvider } from './lib/clerk.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SafeClerkProvider>
      <App />
    </SafeClerkProvider>
  </StrictMode>,
);
