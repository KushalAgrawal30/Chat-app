import React from "react";
import { GoogleLogin, useGoogleLogin} from '@react-oauth/google'
import {} from 'jwt-decode'
import { useNavigate } from "react-router-dom";


const GoogleAuth = () => {
    const navigate = useNavigate()

    const login = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
                headers: {
                    Authorization: `Bearer ${tokenResponse.access_token}`
                }
            })
            .then(res => res.json())
            .then(user => {
                console.log("User info:", user);
                localStorage.setItem("token", tokenResponse.access_token);
                localStorage.setItem("user", JSON.stringify(user));
                navigate('/chat-room');
            });
        },
        onError: () => {
            console.log("Google login Failed");
        }
    });


    return(
        <div className="container">
            <div className="login-class">
            <h2>Chat Room</h2>
            <button onClick={login} className="google-login-btn">
                Continue with Google
            </button>       
            </div>    
         </div>
    )
}

export default GoogleAuth