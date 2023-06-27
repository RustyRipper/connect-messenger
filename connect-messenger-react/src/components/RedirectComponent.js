import React, {useContext, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import jwt_decode from "jwt-decode";
import ChatAPI from "../store/ChatAPI";
import chatAPI from "../store/ChatAPI";
import {AuthContext} from "../store/auth/AuthContext";

const RedirectComponent = () => {
    const { dispatch } = useContext(AuthContext);
    const { token } = useParams();

    useEffect(() => {
        localStorage.setItem("token", token);
        chatAPI.authDetails = jwt_decode(token);

        dispatch({ type: "SET_DETAILS", newDetails: ChatAPI.getAuthDetails() });
        setTimeout(() => {
            window.location.href = '/';
        }, 3000);
    }, [token, dispatch]);

    return (
        <div>
            <h1>Przekierowanie...</h1>
        </div>
    );
};

export default RedirectComponent;