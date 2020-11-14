import React, { Component, useContext } from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route } from 'react-router-dom';
import { AuthContext, AuthState } from './AuthProvider';
import { getLogger } from "../core";



const log = getLogger('login')

export interface PrivateRouteProps {
    component: PropTypes.ReactNodeLike
    path: string
    exact?: boolean
}

export const PrivateRoute: 
    React.FC<PrivateRouteProps> = ({ component: Componenent, ...rest }) => {
    const { isAuthenticated } = useContext<AuthState>(AuthContext)
    log('render, isAuthenticated', isAuthenticated)
    
    return (
        <Route { ...rest } render = { props => {
            if (isAuthenticated) {
                //
                return <Component { ...props } />
            }
            return <Redirect to = {{ pathname: '/login' }}/>
        }}/>
    )
}