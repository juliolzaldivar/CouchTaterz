import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {RootErrorBoundary} from './components/RootErrorBoundary.tsx';
import './index.css';

// CouchTater workspace verified and optimized for Google Studio AI snapshots

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);

