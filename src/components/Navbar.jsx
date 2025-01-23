import { useState, useContext } from "react";
import { Button, Nav, Image, Offcanvas } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.jpg";
import { getAuth } from "firebase/auth";
import { AuthContext } from "../components/AuthProvider";
import { getFirestore, doc, getDoc } from "firebase/firestore"
import "../App.css";

export default function Navbar() {
    const auth = getAuth();
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const [role, setRole] = useState(null);
    const { currentUser } = useContext(AuthContext);

    if (currentUser) {
        const db = getFirestore();
        const userRef = doc(db, "users", currentUser.uid);
        getDoc(userRef)
            .then((docSnap) => {
                if (docSnap.exists()) {
                    setRole(docSnap.data().role);
                }
            })
            .catch((error) => {
                console.error("Error dfetching user role:", error);
            });
    } else {
        navigate("/login");
    }


    const toggleMenu = () => setShowMenu(!showMenu);


    const handleLogout = () => {
        auth.signOut();
        navigate("/login");
    };

    return (
        <div className="d-flex flex-column flex-sm-row item-aligns-center justify-content-between text-muted py-3 mb-5 border-bottom border-b-gray ps-3 pe-3 position-relative">
            {/*Hamburger Menu Icon*/}
            <Button
                variant="link"
                className="d-lg-none position-absolute top-0 start-0 ms-3 mt-3"
                onClick={toggleMenu}
                aria-label="Open Menu"
            >
                <i className="bi bi-list" style={{ fontSize: "24px", color: "black" }}></i>
            </Button>

            {/*Logo Section*/}
            <div className="d-flex flex-column flex-lg-row align-items-center justify-content-start mb-3 mb-sm-0">
                <Image
                    src={logo}
                    roundedCircle
                    style={{ width: "60px", height: "60px", cursor: "pointer" }}
                    className="mb-2 mb-sm-0"
                />
                <span className="fw-bold ps-3 text-secondary text-center text-sm-start">
                    PETIT MEDICARE
                </span>
            </div>

            {/*Mobile Notification Icon*/}
            <Button
                variant="transparent"
                className="d-lg-none position-absolute top-0 end-0 me-3 mt-3"
                style={{ width: "50px", height: "40px", fontSize: "14px", backgroundColor: "rgb(133, 178, 185)", color: "white" }}
            >
                <i className="bi bi-bell"></i>
            </Button>

            {/*Desktop Navigation Links*/}
            <Nav className="d-custom-flex align-items-start gap-1 fw-medium" style={{ fontSize: "14px" }}>
                {role === "patient" ? (
                    <>
                        <Nav.Item>
                            <Nav.Link as={NavLink} to="/home" className="nav-link text-dark">HOME</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link as={NavLink} to="/doctors" className="nav-link text-dark">DOCTORS</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link as={NavLink} to="/appointments" className="nav-link text-dark">MY APPOINTMENTS</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link as={NavLink} to="/report" className="nav-link text-dark">REPORT</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link as={NavLink} to="/profile" className="nav-link text-dark">PROFILE</Nav.Link>
                        </Nav.Item>
                    </>
                ) : role === "doctor" ? (
                    <>
                        <Nav.Item>
                            <Nav.Link as={NavLink} to="/doctorHome" className="text-dark" onClick={toggleMenu}>HOME</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link as={NavLink} to="/doctorAppointments" className="nav-link text-dark">MY APPOINTMENTS</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link as={NavLink} to="/profile" className="nav-link text-dark">PROFILE</Nav.Link>
                        </Nav.Item>
                    </>
                ) : null}
            </Nav>

            {/*Hamburger Menu*/}
            <Offcanvas show={showMenu} onHide={toggleMenu} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Nav className="flex-column">
                        {role === "patient" ? (
                            <>
                                <Nav.Item>
                                    <Nav.Link as={NavLink} to="/home" className="text-dark" onClick={toggleMenu}>HOME</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link as={NavLink} to="/doctors" className="text-dark" onClick={toggleMenu}>DOCTORS</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link as={NavLink} to="/appointments" className="text-dark" onClick={toggleMenu}>MY APPOINTMENTS</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link as={NavLink} to="/report" className="text-dark" onClick={toggleMenu}>REPORT</Nav.Link>
                                </Nav.Item>
                            </>
                        ) : role === "doctor" ? (
                            <>
                                <Nav.Item>
                                    <Nav.Link as={NavLink} to="/doctorHome" className="text-dark" onClick={toggleMenu}>HOME</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link as={NavLink} to="/doctorAppointments" className="text-dark" onClick={toggleMenu}>MY APPOINTMENTS</Nav.Link>
                                </Nav.Item>
                            </>
                        ) : null}
                        <Nav.Item>
                            <Nav.Link as={NavLink} to="/profile" className="text-dark" onClick={toggleMenu}>PROFILE</Nav.Link>
                        </Nav.Item>
                    </Nav>
                    {/*Sign out button in menu*/}
                    <Button
                        variant="danger"
                        className="w-100"
                        onClick={handleLogout}
                        style={{ marginTop: "20px" }}
                    >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Sign Out
                    </Button>
                </Offcanvas.Body>
            </Offcanvas>

            {/*Desktop Buttons*/}
            <div className="d-none d-lg-flex flex-column flex-sm-row align-items-center justify-content-between">
                {currentUser ? (
                    <>
                        <Button
                            variant="transparent"
                            style={{ width: "50px", height: "40px", fontSize: "15px", backgroundColor: "rgb(133, 178, 185)", color: "white" }}
                            className="fw-bold me-2 mb-2 mb-sm-0">
                            <i className="bi bi-bell"></i>
                        </Button>
                        <Button
                            variant="danger"
                            style={{ width: "50px", height: "40px", fontSize: "15px" }}
                            onClick={handleLogout}
                            className="fw-medium">
                            <i className="bi bi-box-arrow-right"></i>
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="transparent"
                        style={{ width: "100px", height: "40px", fontSize: "15px", backgroundColor: "rgb(133, 178, 185)", color: "white" }}
                        className="fw-medium me-2 mb-2 mb-sm-0">
                        <i className="bi bi-box-arrow-in-right me-2"></i>Log in
                    </Button>
                )}
            </div>
        </div>
    );
}
