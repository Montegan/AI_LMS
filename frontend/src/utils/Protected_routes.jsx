import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/auth_context'
import Loading from '../components/Loading'

const Protected_routes = () => {
    const { user, loading , error, isAuthenticated} = useAuth();

    if (!user) {
        return <Navigate to="/" />
    }
     if (loading) {
        return <Loading />
    }

    if (error) {
        return <Navigate to="/" />
    }

  return <Outlet />
}

export default Protected_routes