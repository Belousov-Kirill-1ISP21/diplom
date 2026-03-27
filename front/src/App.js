import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './shared/context/authContext';
import { NotificationsProvider } from './shared/context/notificationsContext';
import { CalculatorProvider } from './shared/context/сalculatorContext';
import Routes from './app/Routes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationsProvider>
          <CalculatorProvider>
            <Routes />
          </CalculatorProvider>
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;