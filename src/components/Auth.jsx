import React, { useRef, useEffect, useContext } from "react";
import axios from "axios";
import * as yup from "yup";
import { useFormik } from "formik";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import routes from "../routes.js";
import Context from "../context/Context.js";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase-config.js";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

const validationAuth = yup.object({
    email: yup.string().required("Cannot be blank").trim().email("Email must be a valid"),
    password: yup.string().required("Cannot be blank").trim().min(8, "password short"),
});

export default function Auth() {
    const { login } = useContext(Context);
    const inputRef = useRef();
    const navigate = useNavigate();
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const db = getFirestore();
            const userRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userRef);
            const parts = user.displayName.split(" ");
            if (!docSnap.exists()) {
                await setDoc(userRef, {
                    userId: user.uid,
                    email: user.email,
                    profilePic: "default.png",
                    name: parts[0],
                    lastname: parts[1],
                    createdAt: new Date(),
                });
            }
            const response = await axios.post(
                routes.authByGooglePath(),
                {
                    email: result.user.email,
                    userId: result.user.uid,
                },
                {
                    headers: {
                        authorization: result.user.accessToken,
                    },
                },
            );
            if (response.status === 200) {
                const currentUser = {
                    token: response.data.token,
                    currentUser: { userId: response.data.userId },
                };
                localStorage.setItem("currentUser", JSON.stringify(currentUser));
                login();
                navigate("/");
            }
        } catch (error) {
            console.error("Error during sign-in or user document creation: ", error);
        }
    };

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: validationAuth,
        validateOnChange: false,
        validateOnBlur: false,
        onSubmit: async (values) => {
            try {
                const response = await axios.post(routes.authPath(), values);
                if (response.data !== "invalid creds") {
                    const currentUser = {
                        token: response.data.token,
                        currentUser: { userId: response.data.userId },
                    };
                    localStorage.setItem("currentUser", JSON.stringify(currentUser));
                    login();
                    navigate("/");
                }
            } catch (err) {
                if (err.isAxiosError && err.response.status === 400) {
                    const responseErrors = err.response.data.errors.errors;
                    console.log(err);
                    responseErrors.map((err) => toast.error(`${err.param}: ${err.msg}`));
                    inputRef.current?.select();
                    return;
                }
                throw err;
            }
        },
    });

    return (
        <div className="divFormBlock">
            <form onSubmit={formik.handleSubmit} className="Main_Form">
                <h1>Sing In</h1>
                <div>
                    <div>
                        <label htmlFor="email">Email</label>
                        <span className="Errors">{formik.errors.email ? " " + formik.errors.email : null}</span>
                    </div>
                    <div>
                        <input
                            id="email"
                            className="inputField"
                            name="email"
                            placeholder="Enter email"
                            onChange={formik.handleChange}
                            value={formik.values.email}
                            autoComplete="email"
                        />
                    </div>
                </div>
                <div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <span className="Errors">{formik.errors.password ? " " + formik.errors.password : null}</span>
                    </div>
                    <div>
                        <input
                            id="password"
                            className="inputField"
                            name="password"
                            type="password"
                            placeholder="Enter password"
                            onChange={formik.handleChange}
                            value={formik.values.password}
                            autoComplete="password"
                        />
                    </div>
                    <p>
                        Forgot password?
                        <Link to="/resetpassword">Reset It</Link>
                    </p>
                </div>
                <button type="submit" className="Submit_btn">
                    Sign In
                </button>
                <button onClick={handleSignIn} className="SubmitGoogle_btn">
                    Sign In with google <img alt="some" src="/google.png" className="userimg" />
                </button>
                <p>
                    Don't have an account?
                    <Link to="/register">Sign Up</Link>
                </p>
            </form>
        </div>
    );
}
