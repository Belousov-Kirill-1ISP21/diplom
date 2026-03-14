import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './shared/context/authContext';
import Routes from './app/Routes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;