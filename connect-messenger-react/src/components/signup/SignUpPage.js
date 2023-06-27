import React, {useState} from 'react'
import './SignUpPage.scss'
import ChatAPI from "../../store/ChatAPI";
import {useNavigate, useNavigation} from "react-router-dom";

export const SignUpPage = () => {
    const [nameInput, setNameInput] = useState('f')
    const [surnameInput, setSurnameInput] = useState('w')
    const [usernameInput, setUsernameInput] = useState('fw')
    const [passwordInput, setPasswordInput] = useState('aaaaaaaa')
    const [repeatPasswordInput, setRepeatPasswordInput] = useState('aaaaaaaa')

    const navigate = useNavigate()

    const handleSubmit = e => {
        e.preventDefault()
        const succeeded = ChatAPI.signUp(nameInput, surnameInput, usernameInput, passwordInput)
        if (succeeded) {
            navigate('/login')
        } else {
            console.log('bad :(')
        }
    }

    return (
        <>
            <div className="signupPage">
                <span className="signupPage__title">
                    <span aria-hidden="true">&gt;&gt;&gt;</span> make your own CONNECTion
                </span>
                <form className="signupPage__form">
                    <label htmlFor="name" className="signupPage__label">your name:</label>
                    <input type="text" id="name" name="name" className="signupPage__input"
                    value={nameInput} onInput={e => setNameInput(e.target.value)}/>

                    <label htmlFor="surname" className="signupPage__label">your surname:</label>
                    <input type="text" id="surname" name="surname" className="signupPage__input"
                           value={surnameInput} onInput={e => setSurnameInput(e.target.value)}/>

                    <label htmlFor="username" className="signupPage__label">your username:</label>
                    <input type="text" id="username" name="username" className="signupPage__input"
                           value={usernameInput} onInput={e => setUsernameInput(e.target.value)}/>

                    <label htmlFor="avatar" className="signupPage__label">your avatar (png or jpg file):</label>
                    <input type="file" id="avatar" name="avatar" className="signupPage__input"
                           accept="image/png, image/jpeg"/>

                    <label htmlFor="password" className="signupPage__label">password:</label>
                    <input type="password" id="password" name="password" className="signupPage__input"
                           value={passwordInput} onInput={e => setPasswordInput(e.target.value)}/>

                    <label htmlFor="repeat_password" className="signupPage__label">repeat password:</label>
                    <input type="password" id="repeat_password" name="repeat_password" className="signupPage__input"
                           value={repeatPasswordInput} onInput={e => setRepeatPasswordInput(e.target.value)}/>

                    <input type="submit" className="signupPage__input" id="buttonSubmit" value="sign up" onClick={handleSubmit}/>
                </form>
                <span className="signupPage__error"></span>
                <a href="/login" className="signupPage__loginLink">Already have an account? Sign In</a>
            </div>
            <footer><b><span aria-hidden="true">&gt;&gt;&gt;</span> <i>CONNECT</i></b> - free text messenger | &copy; CONNECT Inc. Filip Wiśniewski & Maciej Makara 2023</footer>
        </>
    )
}