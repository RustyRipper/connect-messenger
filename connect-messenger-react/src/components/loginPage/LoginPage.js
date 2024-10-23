import React, { useContext, useState } from "react";
import "./LoginPage.scss";
import { useNavigate, Navigate } from "react-router-dom";
import { AuthContext } from "../../store/auth/AuthContext";
import ChatAPI from "../../store/ChatAPI";

const LoginPage = () => {
    const { dispatch } = useContext(AuthContext);
    const [ authFailed, setAuthFailed ] = useState(false);
    const [ username, setUsername ] = useState("");
    const [ password, setPassword ] = useState("");
    const navigate = useNavigate()

    const handleSubmit = async e => {
        e.preventDefault();
        const succeeded = await ChatAPI.signIn(username, password);
        if (succeeded) {
            dispatch({ type: "SET_DETAILS", newDetails: ChatAPI.getAuthDetails() });
            navigate("/");
        } else {
            console.log("Auth failed");
            setAuthFailed(true);
        }
    };

    // const signInWithGoogle = async e => {
    //     e.preventDefault();
    //     const succeeded = await ChatAPI.signInWithGoogle()
    //     if (succeeded) {
    //         dispatch({ type: "SET_DETAILS", newDetails: ChatAPI.getAuthDetails() });
    //         navigate("/");
    //     } else {
    //         console.log("Auth failed");
    //         setAuthFailed(true);
    //     }
    // };

    const signInWithCognito = async e => {
        e.preventDefault();
        const succeeded = await ChatAPI.signInWithCognito()
        if (succeeded) {
            dispatch({ type: "SET_DETAILS", newDetails: ChatAPI.getAuthDetails() });
            navigate("/");
        } else {
            console.log("Auth failed");
            setAuthFailed(true);
        }
    };

    return (
        (ChatAPI.isSignedIn() ? 
            <Navigate to="/" /> :
            <>

                <div className="loginPage">
                    <div>
                        <h1>Login Cognito</h1>
                        <a href="http://3.71.114.74.nip.io:8080/oauth2/authorization/cognito">
                            <img
                                src="https://blog.hubspot.com/hubfs/image8-2.jpg"
                                alt="Logowanie przez Cognito"
                                style={{borderRadius: "15px", width: "200px"}}/>
                        </a>
                    </div>
                    {/*<div>*/}
                    {/*    <h1>Login Google</h1>*/}
                    {/*    <a href="http://3.71.114.74.nip.io:8080/oauth2/authorization/google">*/}
                    {/*        <img*/}
                    {/*            src="https://blog.hubspot.com/hubfs/image8-2.jpg"*/}
                    {/*            alt="Logowanie przez Google"*/}
                    {/*            style={{borderRadius: "15px", width: "200px"}}/>*/}
                    {/*    </a>*/}
                    {/*</div>*/}
                    <span className="loginPage__title">
                        <span aria-hidden="true"
                              style={{fontWeight: 700}}>&gt;&gt;&gt; </span> restore your CONNECTion
                    </span>
                    <form className="loginPage__form" onSubmit={handleSubmit}>
                        <label className="loginPage__label">your
                            username:</label>
                        <input type="text" className="loginPage__input"
                               onInput={e => setUsername(e.target.value)}/>
                        <label className="loginPage__label">password:</label>
                        <input type="password" className="loginPage__input"
                               onInput={e => setPassword(e.target.value)}/>
                        <input type="submit" className="loginPage__input"
                               value="sign in"/>
                    </form>
                    {/*<button onClick={signInWithGoogle}>Sign in with Google*/}
                    {/*</button>*/}
                    <button onClick={signInWithCognito}>Sign in with Cognito
                    </button>
                    {authFailed &&
                        <span className="loginPage__authFailed">Bad credentials! Try again</span>}
                    <a href="/sign-up" className="loginPage__signUpLink">Not a
                        user yet? Sign Up</a>
                </div>
                <footer><b><span aria-hidden="true">&gt;&gt;&gt;</span>
                    <i>CONNECT</i></b> - free text messenger | &copy; CONNECT
                    Inc. Filip Wiśniewski & Maciej Makara 2023
                </footer>
            </>
        )

    );
}

export default LoginPage;