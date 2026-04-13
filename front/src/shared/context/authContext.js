import React, { createContext, useState, useContext, useEffect } from 'react';
import { getMe, logout as apiLogout, updateProfile, changePassword } from '../../api/auth';
import { getMyPolicies } from '../../api/policies';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userPolicies, setUserPolicies] = useState([]);

    // Загрузка полисов с бэка
    const loadPolicies = async () => {
        try {
            const response = await getMyPolicies();
            setUserPolicies(response.data);
        } catch (error) {
            console.error('Error loading policies:', error);
            setUserPolicies([]);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            getMe()
                .then(async (response) => {
                    const user = response.data;
                    setUserData(user);
                    setProfileData(user.client_profile);
                    setIsAuthenticated(true);
                    
                    // Загружаем полисы после успешной авторизации
                    await loadPolicies();
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    setIsAuthenticated(false);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (user, token) => {
        localStorage.setItem('token', token);
        setUserData(user);
        setProfileData(user.client_profile);
        setIsAuthenticated(true);
        
        // Загружаем полисы после логина
        await loadPolicies();
    };

    const logout = async () => {
        try {
            await apiLogout();
        } catch (e) {
            console.error(e);
        }
        localStorage.removeItem('token');
        setUserData(null);
        setProfileData(null);
        setIsAuthenticated(false);
        setUserPolicies([]);
    };

    const updateUserData = async (data) => {
        try {
            // Преобразуем ключи для бэка
            const payload = {
                last_name: data.surname || data.last_name,
                first_name: data.name || data.first_name,
                middle_name: data.patronymic || data.middle_name,
                birth_date: data.birthDate || data.birth_date,
                email: data.email,
                phone: data.phone,
                passport_series: data.passportSeries,
                passport_number: data.passportNumber,
                passport_issued_by: data.issuedBy,
                passport_issue_date: data.issueDate,
                driver_license_series: data.licenseSeries,
                driver_license_number: data.licenseNumber,
                driver_license_issued_by: data.licenseIssuedBy,
                driver_license_issue_date: data.licenseIssueDate,
                driver_license_expiry_date: data.licenseExpiryDate,
                driver_categories: data.licenseCategory,
            };
            
            const response = await updateProfile(payload);
            
            // Обновляем локальные данные
            setProfileData(prev => ({ ...prev, ...payload }));
            
            // Если обновили email или phone, обновляем userData
            if (data.email || data.phone) {
                setUserData(prev => ({
                    ...prev,
                    email: data.email || prev.email,
                    phone: data.phone || prev.phone
                }));
            }
            
            return response;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    };

    const updateUserPassword = async (currentPassword, newPassword) => {
        try {
            const response = await changePassword(currentPassword, newPassword, newPassword);
            return response;
        } catch (error) {
            console.error('Change password error:', error);
            throw error;
        }
    };

    const addPolicy = (policy) => {
        setUserPolicies(prev => [policy, ...prev]);
    };

    const resetPolicies = () => {
        setUserPolicies([]);
    };

    const refreshPolicies = async () => {
        await loadPolicies();
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        // Если дата в формате ISO, берем только YYYY-MM-DD
        if (dateString.includes('T')) {
            return dateString.split('T')[0];
        }
        return dateString;
    };
    
    const fullUserData = {
        id: userData?.id,
        email: userData?.email,
        phone: userData?.phone,
        surname: profileData?.last_name || '',
        name: profileData?.first_name || '',
        patronymic: profileData?.middle_name || '',
        birthDate: formatDate(profileData?.birth_date),
        passportSeries: profileData?.passport_series || '',
        passportNumber: profileData?.passport_number || '',
        issuedBy: profileData?.passport_issued_by || '',
        issueDate: formatDate(profileData?.passport_issue_date),
        licenseSeries: profileData?.driver_license_series || '',
        licenseNumber: profileData?.driver_license_number || '',
        licenseIssuedBy: profileData?.driver_license_issued_by || '',
        licenseIssueDate: formatDate(profileData?.driver_license_issue_date),
        licenseExpiryDate: formatDate(profileData?.driver_license_expiry_date),
        licenseCategory: profileData?.driver_categories || '',
        ...profileData,
        ...userData,
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            userData,
            profileData,
            fullUserData,
            userPolicies,
            loading,
            login,
            logout,
            updateUserData,
            updateUserPassword,
            addPolicy,
            resetPolicies,
            refreshPolicies
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};