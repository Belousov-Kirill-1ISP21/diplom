import styles from './paymentStyle.module.css';
import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Header } from '../../../shared/layouts/Header';
import { PaymentForm } from '../components/PaymentForm';
import { Footer } from '../../../shared/layouts/Footer';
import { useAuth } from '../../../shared/context/authContext';
import api from '../../../api/client';

export const PaymentPage = () => {
    const { id } = useParams();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id && isAuthenticated) {
            api.get(`/client/policies/${id}`)
                .then(response => {
                    setPolicy(response.data);
                })
                .catch(error => {
                    console.error('Error loading policy:', error);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else if (!id) {
            setLoading(false);
        }
    }, [id, isAuthenticated]);

    if (authLoading || loading) {
        return (
            <div className={styles.wrapper}>
                <Header />
                <div style={{ textAlign: 'center', padding: '50px' }}>Загрузка...</div>
                <Footer />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/SignIn" />;
    }

    if (!policy) {
        return (
            <div className={styles.wrapper}>
                <Header />
                <div style={{ textAlign: 'center', padding: '50px' }}>Полис не найден</div>
                <Footer />
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <Header />
            <PaymentForm policy={policy} />
            <Footer />
        </div>
    );
};