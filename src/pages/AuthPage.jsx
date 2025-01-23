import { Row, Col, Form, Button, Alert, Image } from "react-bootstrap";
import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import logo from "../assets/images/logo.jpg";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState("patient");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [alertVariant, setAlertVariant] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const navigate = useNavigate();
    const auth = getAuth();

    const toggleForm = () => setIsLogin(!isLogin);

    const handleSignUp = async (event) => {
        event.preventDefault();
        try {
            //Firebase Authentication
            const res = await createUserWithEmailAndPassword(auth, email, password);
            console.log(res); // Log the result to verify user creation

            //Save fullName and role in Firestore
            const userRef = doc(db, "users", res.user.uid);
            await setDoc(userRef, {
                fullName: fullName,
                role: role,
            });

            setAlertVariant("success");
            setAlertMessage("Sign up successful. Please log in.");
            setTimeout(() => setAlertMessage(""), 5000);
            navigate("/login")
            setFullName("");
            setEmail("");
            setPassword("");
        } catch (error) {
            console.error(error);
            setAlertVariant("danger");
            setAlertMessage(error.message || "Unable to sign up. Please try again.");
            setTimeout(() => setAlertMessage(""), 5000);
        }
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            // Firebase Authentication
            await signInWithEmailAndPassword(auth, email, password);

            // After successful login, navigate to profile
            navigate("/profile");
        } catch (error) {
            console.error(error);
            setAlertVariant("danger");
            setAlertMessage("Incorrect email or password. Please try again.");
            setTimeout(() => setAlertMessage(""), 5000);
        }
    };

    const provider = new GoogleAuthProvider();
    const handleGoogleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Row className="d-flex justify-content-center align-items-center vh-100">
            <Col xs={10} sm={4} md={6} lg={4} xl={3} className="text-center">
                <div className="d-flex justify-content-center align-items-center mb-3">
                    <Image
                        src={logo}
                        roundedCircle
                        style={{ width: "100px", height: "100px", cursor: "pointer" }}
                        className="mb-2"
                    />
                </div>
                <h1 className="fw-bold mb-4">{isLogin ? "Login" : "Sign Up"}</h1>
                {alertMessage && (
                    <Alert
                        variant={alertVariant}
                        onClose={() => setAlertMessage("")}
                        dismissible
                    >
                        {alertMessage}
                    </Alert>
                )}
                <Button className="rounded-pill mt-4" variant="outline-dark" size="lg" style={{ width: "100%" }} onClick={handleGoogleLogin}>
                    <i className="bi bi-google"></i> Continue with Google
                </Button>
                <p className="mb-4 mt-4">or</p>
                <Form onSubmit={isLogin ? handleLogin : handleSignUp}>
                    {!isLogin && (
                        <Form.Group className="mb-3" controlId="fullName">
                            <Form.Control
                                type="text"
                                placeholder="FULL NAME"
                                className="rounded-pill p-2"
                                style={{ width: "100%" }}
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </Form.Group>
                    )}
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Control
                            type="email"
                            placeholder="EMAIL"
                            className="rounded-pill p-2"
                            style={{ width: "100%" }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Control
                            type="password"
                            placeholder="PASSWORD"
                            className="rounded-pill p-2"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Group>

                    {!isLogin && (
                        <div>
                            <p><strong>Select your role:</strong></p>
                            <Button
                                variant={role === "patient" ? "dark" : "outline-dark"}
                                className="me-2"
                                onClick={() => setRole("patient")}
                            >
                                Patient
                            </Button>
                            <Button
                                variant={role === "doctor" ? "dark" : "outline-dark"}
                                onClick={() => setRole("doctor")}
                            >
                                Doctor
                            </Button>
                        </div>
                    )}

                    <Button type="submit" className="rounded-pill mt-4" variant="dark" size="lg" style={{ width: "100%" }}>
                        {isLogin ? "Login" : "Sign Up"}
                    </Button>
                    <p className="mt-3">
                        {isLogin ? "No account?" : "Already have an account"}{" "}
                        <span
                            id="toggle-link"
                            style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }}
                            onClick={toggleForm}
                        >
                            {isLogin ? "Sign Up" : "Login"}
                        </span>
                    </p>
                </Form>
            </Col>
        </Row>
    );
}
