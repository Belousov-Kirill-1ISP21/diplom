import React from 'react';
import { Route, Routes as RouterRoutes } from 'react-router-dom';

import { HomePage } from '../features/home/pages/HomePage';
import { AboutUsPage } from '../features/about/pages/AboutUsPage';
import { ProfilePage } from '../features/profile/pages/ProfilePage';
import { SignInPage } from '../features/auth/pages/SignInPage';
import { SignUpPage } from '../features/auth/pages/SignUpPage';

const Routes = () => {
    return (
        <RouterRoutes>
            <Route path="/" element={<HomePage/>}/>
            <Route path="/AboutUs" element={<AboutUsPage/>} />
            <Route path="/Profile" element={<ProfilePage/>} />
            <Route path="/SignIn" element={<SignInPage/>} />
            <Route path="/SignUp" element={<SignUpPage/>} />
        </RouterRoutes>
    );
};

export default Routes;