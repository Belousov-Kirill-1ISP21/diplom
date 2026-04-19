import styles from './agentStyle.module.css';
import { AgentPanel } from '../components/AgentPanel';
import { useAuth } from '../../../shared/context/authContext';
import { Navigate } from 'react-router-dom';

export const AgentPage = () => {
    const { userData, isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return <div className={styles.wrapper}>Загрузка...</div>;
    }
    
    if (!isAuthenticated) {
        return <Navigate to="/SignIn" />;
    }
    
    if (userData?.user_type?.name !== 'agent' && userData?.user_type?.name !== 'admin') {
        return <Navigate to="/Profile" />;
    }

    return (
        <div className={styles.wrapper}>
            <AgentPanel />
        </div>
    );
};