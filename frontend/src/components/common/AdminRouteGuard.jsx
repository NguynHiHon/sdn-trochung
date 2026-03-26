import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { forceClientLogout } from '../../services/authService';

export default function AdminRouteGuard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const currentUser = useSelector((state) => state.auth.currentUser);

    const role = currentUser?.role;
    const canAccessManager = isAuthenticated && role === 'admin';

    useEffect(() => {
        if (!canAccessManager) {
            forceClientLogout(dispatch, navigate, '/signin', location.pathname);
        }
    }, [canAccessManager, dispatch, navigate, location.pathname]);

    if (!canAccessManager) return null;
    return <Outlet />;
}
