import React from 'react';
import { Route, Routes as RouterRoutes } from 'react-router-dom';

import { HomePage } from '../features/home/pages/HomePage';
import { AboutUsPage } from '../features/about/pages/AboutUsPage';
import { ProfilePage } from '../features/profile/pages/ProfilePage';
import { CalculatorPage } from '../features/calculator/pages/CalculatorPage';
import { AccidentPage } from '../features/accident/pages/AccidentPage';
import { SignInPage } from '../features/auth/pages/SignInPage';
import { SignUpPage } from '../features/auth/pages/SignUpPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { AdminPage } from '../features/panels/pages/AdminPage';
import { AgentPage } from '../features/panels/pages/AgentPage';
import { PaymentPage } from '../features/payment/pages/PaymentPage';


const Routes = () => {
    return (
        <RouterRoutes>
            <Route path="/" element={<HomePage/>}/>
            <Route path="/AboutUs" element={<AboutUsPage/>} />
            <Route path="/Profile" element={<ProfilePage/>} />
            <Route path="/SignIn" element={<SignInPage/>} />
            <Route path="/SignUp" element={<SignUpPage/>} />
            <Route path="/Calculator" element={<CalculatorPage/>} />
            <Route path="/Accident" element={<AccidentPage/>} />
            <Route path="/ForgotPassword" element={<ForgotPasswordPage/>} />
            <Route path="/Admin" element={<AdminPage />} />
            <Route path="/Agent" element={<AgentPage />} />
            <Route path="/Payment/:id" element={<PaymentPage />} />
        </RouterRoutes>
    );
};

export default Routes; 