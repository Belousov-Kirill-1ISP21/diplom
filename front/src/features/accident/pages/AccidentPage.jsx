import styles from './accidentStyle.module.css';
import { Header } from '../../../shared/layouts/Header';
import { AccidentBlock } from '../components/AccidentBlock';
import { Footer } from '../../../shared/layouts/Footer';
import { useAuth } from '../../../shared/context/authContext';
import { Navigate } from 'react-router-dom';

export const AccidentPage = () => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return (
            <div className={styles.wrapper}>
                <Header />
                <div className={styles.loading}>Загрузка...</div>
                <Footer />
            </div>
        );
    }
    
    if (!isAuthenticated) {
        return <Navigate to="/SignIn" />;
    }

    return (
        <div className={styles.wrapper}>
            <Header />
            <AccidentBlock />
            <Footer />
        </div>
    );
};