import React, { createContext, useState, useContext, useEffect } from 'react';
import { getMe, logout as apiLogout, updateProfile, changePassword } from '../../api/auth';
import { getMyPolicies } from '../../api/policies';
import { createPolicy } from '../../api/policies';
import api from '../../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userPolicies, setUserPolicies] = useState([]);

    const loadPolicies = async () => {
        try {
            const response = await getMyPolicies();
            setUserPolicies(response.data);
        } catch (error) {
            console.error('Error loading policies:', error);
            setUserPolicies([]);
        }
    };

    const loadUserData = async () => {
        try {
            const response = await getMe();
            const user = response.data;
            setUserData(user);
            setProfileData(user.client_profile);
            setIsAuthenticated(true);
            return user;
        } catch (error) {
            console.error('Error loading user data:', error);
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUserData(null);
            setProfileData(null);
            return null;
        }
    };

    const refreshUserData = async () => {
        if (!isAuthenticated) return null;
        try {
            const response = await getMe();
            const user = response.data;
            setUserData(user);
            setProfileData(user.client_profile);
            await loadPolicies();
            return user;
        } catch (error) {
            console.error('Error refreshing user data:', error);
            return null;
        }
    };

    const restorePendingData = async (clientId) => {
        console.log('=== restorePendingData START ===');
        console.log('clientId received:', clientId);
        
        const policyData = localStorage.getItem('pendingPolicy');
        const vehicleData = localStorage.getItem('pendingVehicle');
        
        console.log('policyData exists:', !!policyData);
        console.log('vehicleData exists:', !!vehicleData);
        
        if (!policyData) {
            console.log('No pending policy');
            return null;
        }
        
        const policy = JSON.parse(policyData);
        let vehicleId = null;
        
        if (vehicleData) {
            const vehicle = JSON.parse(vehicleData);
            
            try {
                console.log('Step 1: Creating vehicle from pending data:', vehicle);
                const createVehicleResponse = await api.post('/client/vehicles', {
                    state_number: vehicle.state_number,
                    brand: vehicle.brand,
                    model: vehicle.model,
                    manufacture_year: parseInt(vehicle.manufacture_year),
                    power_hp: parseInt(vehicle.power_hp),
                    category: vehicle.category,
                    vin: vehicle.vin,
                    purchase_price: vehicle.purchase_price ? parseFloat(vehicle.purchase_price) : null,
                    has_tracker: vehicle.has_tracker || false,
                    parking_type: vehicle.parking_type || 'garage'
                });
                vehicleId = createVehicleResponse.data.vehicle.id;
                console.log('✓ Vehicle created successfully, ID:', vehicleId);
            } catch (error) {
                console.error('Error creating vehicle:', error);
                return null;
            }
        } else {
            console.log('No pending vehicle data');
            return null;
        }
        
        if (!vehicleId) {
            console.log('No vehicleId available');
            return null;
        }

        console.log('Step 2: Creating policy with vehicleId:', vehicleId, 'clientId:', clientId);
        
        try {
            const response = await createPolicy({
                policy_type_id: policy.policy_type_id,
                client_id: clientId,  
                vehicle_id: vehicleId,
                tariff_id: policy.tariffId,
                base_price: policy.calculatedPrice,
                final_price: policy.calculatedPrice,
                start_date: policy.startDate,
                end_date: policy.endDate,
                franchise_amount: 0,
                coverage_amount: null
            });
            
            localStorage.removeItem('pendingPolicy');
            localStorage.removeItem('pendingVehicle');
            
            console.log('✓ Policy created successfully, ID:', response.data.policy.id);
            return response.data.policy;
        } catch (error) {
            console.error('Error creating policy:', error);
            return null;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('useEffect - token:', token ? 'exists' : 'not found');
        
        if (token) {
            loadUserData()
                .then(async (user) => {
                    console.log('loadUserData finished, user:', user?.id);
                    console.log('user?.user_type?.name:', user?.user_type?.name);
                    
                    const userType = user?.user_type?.name;
                    const isAgent = userType === 'agent';
                    const isAdmin = userType === 'admin';
                    
                    if (isAgent || isAdmin) {
                        console.log('User is agent or admin, no policy restoration');
                        setLoading(false);
                        return;
                    }
                    
                    if (user && user.client_profile) {
                        await loadPolicies();
                        const restoredPolicy = await restorePendingData(user.client_profile.id);
                        console.log('restoredPolicy after useEffect load:', restoredPolicy);
                        if (restoredPolicy) {
                            setUserPolicies(prev => [restoredPolicy, ...prev]);
                            console.log('Redirecting to payment from useEffect');
                            window.location.href = `/Payment/${restoredPolicy.id}`;
                        }
                    }
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (user, token) => {
        console.log('=== login START ===');
        console.log('user:', user);
        console.log('user.user_type?.name:', user?.user_type?.name);
        
        localStorage.setItem('token', token);
        setUserData(user);
        setProfileData(user.client_profile);
        setIsAuthenticated(true);
        
        const userType = user?.user_type?.name;
        const isAgent = userType === 'agent';
        const isAdmin = userType === 'admin';
        
        if (isAgent || isAdmin) {
            console.log('User is agent or admin, redirecting to panel');
            const redirectUrl = isAgent ? '/Agent' : '/Admin';
            window.location.href = redirectUrl;
            return;
        }
        
        console.log('Loading policies...');
        await loadPolicies();
        
        const clientId = user.client_profile?.id;
        console.log('Calling restorePendingData with clientId:', clientId);
        
        const restoredPolicy = await restorePendingData(clientId);
        console.log('restoredPolicy from login:', restoredPolicy);
        
        if (restoredPolicy) {
            console.log('Policy restored, adding to state');
            setUserPolicies(prev => [restoredPolicy, ...prev]);
            console.log('Redirecting to payment...');
            window.location.href = `/Payment/${restoredPolicy.id}`;
        } else {
            console.log('No policy to restore, redirecting to profile');
            window.location.href = '/Profile';
        }
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
            setProfileData(prev => ({ ...prev, ...payload }));
            
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
        driver_categories: profileData?.driver_categories || [],
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
            refreshPolicies,
            refreshUserData  
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