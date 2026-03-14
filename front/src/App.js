import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './shared/context/authContext';
import { NotificationsProvider } from './shared/context/notificationsContext';
import Routes from './app/Routes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationsProvider>
          <Routes />
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;