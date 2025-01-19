import { Button, Nav, Image } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.jpg";
import{getAuth} from "firebase/auth"; 
import "../App.css"

export default function Navbar() {
    const auth = getAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        auth.signOut();
        navigate("/login");
    }
    return (
        <div className="d-flex item-aligns-center justify-content-between text-muted py-3 mb-5 border-bottom border-b-gray ps-3 pe-3">
            <div>
                <Image src={logo} roundedCircle style={{ width: "60px", height: "60px", cursor: "pointer" }} /><span className="fw-bold ps-3 text-secondary">HEALTH BOOKING</span>
            </div>
            <Nav className="d-none d-md-flex align-items-start gap-3 fw-medium">
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
                    <Nav.Link as={NavLink} to="/profile" className="nav-link text-dark">PROFILE</Nav.Link>
                </Nav.Item>
            </Nav>

            <Button variant="danger" style={{ width: "120px", height: "40px", fontSize: "14px"}} onClick={handleLogout} className="fw-medium">SIGN OUT</Button>
        </div>
    )
}