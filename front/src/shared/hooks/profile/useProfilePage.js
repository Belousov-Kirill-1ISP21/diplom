import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/context/authContext';

export const useProfilePage = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('profile');
    const { isAuthenticated, loading, refreshUserData, refreshPolicies } = useAuth();
    const [refreshKey, setRefreshKey] = useState(0);
    const hasRefreshed = useRef(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab === 'policies') {
            setActiveTab('policies');
        }
    }, [location]);

    useEffect(() => {
        if (!loading && !hasRefreshed.current) {
            hasRefreshed.current = true;
            const refreshData = async () => {
                await refreshUserData();
                await refreshPolicies();
                setRefreshKey(prev => prev + 1);
            };
            refreshData();
        }
    }, [loading, refreshUserData, refreshPolicies]);

    const handleTabChange = useCallback(async (tab) => {
        setActiveTab(tab);
        setRefreshKey(prev => prev + 1);
        
        if (tab === 'profile') {
            await refreshUserData();
        }
        
        if (tab === 'policies') {
            await refreshPolicies();
        }
    }, [refreshUserData, refreshPolicies]);

    const getPanelKey = (tabName) => `${tabName}-${refreshKey}`;

    return {
        activeTab,
        loading,
        isAuthenticated,
        refreshKey,
        handleTabChange,
        getPanelKey
    };
};