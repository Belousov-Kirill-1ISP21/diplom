import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const savedAuth = localStorage.getItem('isAuthenticated');
        return savedAuth === 'true';
    });

    const [userData, setUserData] = useState(() => {
        const savedUserData = localStorage.getItem('userData');
        return savedUserData ? JSON.parse(savedUserData) : null;
    });

    const login = (userDataFromForm) => {
        setIsAuthenticated(true);
        setUserData(userDataFromForm);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userData', JSON.stringify(userDataFromForm));
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUserData(null);
        localStorage.setItem('isAuthenticated', 'false');
        localStorage.removeItem('userData');
    };

    const updateUserData = (newUserData) => {
        setUserData(newUserData);
        localStorage.setItem('userData', JSON.stringify(newUserData));
    };

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            userData, 
            login, 
            logout,
            updateUserData 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};