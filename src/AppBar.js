import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from './UserContext.js';
import { Link } from 'react-router-dom';
import { useHistory } from "react-router-dom";
import { config } from "./utils/config";

const BeepAppBar = (props) => {
    const { user, setUser } = useContext(UserContext);
    const [toggle, setToggle] = useState(false);
    const [resendStatus, setResendStatus] = useState();
    const [refreshStatus, setRefreshStatus] = useState();
    let history = useHistory();

    useEffect(() => {
        if (user && !user.isEmailVerified) {
            window.addEventListener('focus', onFocus);
            // Specify how to clean up after this effect:
            return () => {
                window.removeEventListener('focus', onFocus);
            };
        }
    });

    const onFocus = () => {
        checkVarificationStatus();
    };

    function logout () {
        fetch(config.apiUrl + '/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'token': user.token
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success" || (data.status === "error" && data.message === "Your auth token is not valid.")) {
                localStorage.clear();
                history.push("/");
                setUser(null);
            }
            else {
                console.log("yikes", data);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    function checkVarificationStatus(showMessage) {
        fetch(config.apiUrl + '/account/status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'token': user.token
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                let tempUser = JSON.parse(JSON.stringify(user));
                tempUser.isEmailVerified = data.message.isEmailVerified;
                tempUser.isStudent = data.message.isStudent;
                tempUser.email = data.message.email;
                localStorage.setItem("user", JSON.stringify(tempUser));
                setUser(tempUser);
            }
            else {
                console.log("yikes", data);
            }
            if (showMessage) {
                if (data.message.isEmailVerified) {
                    if (data.message.isStudent) {
                        setRefreshStatus("You where successfully verified as a student!");
                    } 
                    else {
                        setRefreshStatus("Your email was successfully verified!");
                    }
                }
                else {
                    setRefreshStatus("Your account is still not verified");
                }
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    function resendVarificationEmail() {
        fetch(config.apiUrl + '/account/verify/resend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                'token': user.token
            }),
        })
        .then(response => response.json())
        .then(data => {
            setResendStatus(data.message);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
    
    if (user) {
        return(
            <>
                <nav className="flex items-center justify-between flex-wrap bg-yellow-500 p-6 mb-4">
                    <div className="flex items-center flex-shrink-0 text-white mr-6">
                        <img
                            alt=""
                            src="/favicon.png"
                            width="30"
                            height="30"
                            className="d-inline-block align-top"
                        />
                        <Link to="/" className="font-semibold text-xl tracking-tight pl-2">Beep App</Link>
                    </div>
                    <div className="block lg:hidden">
                        <button onClick={() => setToggle(!toggle)} className="flex items-center px-3 py-2 border rounded text-yellow-200 border-yellow-400 hover:text-white hover:border-white">
                            <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"/></svg>
                        </button>
                    </div>
                    <div className={!toggle ? "hidden w-full lg:items-center lg:w-auto lg:block" : "w-full lg:items-center lg:w-auto lg:block" }>
                        <div className="text-sm">
                            <Link to="/profile" className="block mt-4 lg:inline-block lg:mt-0 text-yellow-200 hover:text-white mr-8">
                                <div className="flex">
                                    <p>Profile</p>
                                </div>
                            </Link>
                            <Link to="/password/change" className="block mt-4 lg:inline-block lg:mt-0 text-yellow-200 hover:text-white mr-8">
                                <div className="flex">
                                    <p>Change Password</p>
                                </div>
                            </Link>
                            <p onClick={logout} className="cursor-pointer block mt-4 lg:inline-block lg:mt-0 text-yellow-200 hover:text-white mr-8">
                                Logout
                            </p>
                            <p className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-yellow-500 hover:bg-white mt-4 lg:mt-0">{user.first + " " + user.last}</p>
                        </div>
                    </div>
                </nav>
                {(!user.isEmailVerified && !props.noErrors) &&
                <div className="lg:container px-4 mx-auto mb-4" >
                    <div role="alert">
                        <div className="bg-red-500 text-white font-bold rounded-t px-4 py-2">
                            Email Varification
                        </div>
                        <div className="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
                            <p>You need to verify your email</p>
                            <p className="text-sm mt-2 underline cursor-pointer" onClick={() => checkVarificationStatus(true)}>Refresh my varification status</p>
                            <p className="text-sm mt-2 underline cursor-pointer" onClick={resendVarificationEmail}>Resend my varification email</p>
                        </div>
                    </div>
                    {refreshStatus &&
                    <div role="alert" className="mt-4" onClick={() => { setRefreshStatus(null) }}>
                            <div className="bg-blue-500 text-white font-bold rounded-t px-4 py-2">
                                Refresh Message
                            </div>
                            <div className="border border-t-0 border-blue-400 rounded-b bg-blue-100 px-4 py-3 text-blue-700">
                                    <p>{refreshStatus}</p>
                                    <p className="text-xs">Click to dismiss</p>
                            </div>
                        </div>
                    }
                    {resendStatus &&
                        <div role="alert" className="mt-4" onClick={() => { setResendStatus(null) }}>
                            <div className="bg-blue-500 text-white font-bold rounded-t px-4 py-2">
                                Resend Email Message
                            </div>
                            <div className="border border-t-0 border-blue-400 rounded-b bg-blue-100 px-4 py-3 text-blue-700">
                                    <p>{resendStatus}</p>
                                    <p className="text-xs">Click to dismiss</p>
                            </div>
                        </div>
                    }
                </div>
                }
            </>
        );
    }
    else {
        return(
            <>
                <nav className="flex items-center justify-between flex-wrap bg-yellow-500 p-6 mb-4">
                    <div className="flex items-center flex-shrink-0 text-white mr-6">
                        <img
                            alt=""
                            src="/favicon.png"
                            width="30"
                            height="30"
                            className="d-inline-block align-top"
                        />
                        <Link to="/" className="font-semibold text-xl tracking-tight pl-2">Beep App</Link>
                    </div>
                    <div className="block lg:hidden">
                        <button onClick={() => setToggle(!toggle)} className="flex items-center px-3 py-2 border rounded text-yellow-200 border-yellow-400 hover:text-white hover:border-white">
                            <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"/></svg>
                        </button>
                    </div>
                    <div className={!toggle ? "hidden w-full lg:items-center lg:w-auto lg:block" : "w-full lg:items-center lg:w-auto lg:block" }>
                        <div className="lg:flex-grow">
                            <Link to="/login" href="#" className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-yellow-500 hover:bg-white mt-4 lg:mt-0">
                                Login
                            </Link>
                        </div>
                    </div>
                </nav>
            </>
        );
    }
}

export default BeepAppBar;
