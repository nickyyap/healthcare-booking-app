import Navbar from "../components/Navbar";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import "../App.css";
import banner from "../assets/images/bannerpic.png";

export default function DoctorHomePage() {
    return (
        <>
            <Container>
                <Navbar />
                <Row className="flex-column-reverse flex-md-row align-items-center rounded custom-bg-color">
                    <Col xs={12} md={6} className="text-center text-white mb-4">
                        <h1 className="text-center text-white fw-bold" style={{ lineHeight: "1.5" }}>
                            Welcome Back, Doctor!
                        </h1>
                        <p className="mb-4 me-4 ms-4">
                            Manage your appointments, check patient details, and view analytics all in one place.
                        </p>
                        <div className="d-flex flex-column align-items-center">
                            <Button href="/doctorAppointments" className="btn btn-info p-3 rounded-pill text-white custom-button">
                                <i className="bi bi-calendar-check me-3"></i>View Appointments
                            </Button>
                        </div>
                    </Col>
                    <Col xs={12} md={6}>
                        <img src={banner} alt="Schedule Icon" className="img-fluid" />
                    </Col>
                </Row>

                <Container>
                    <h3 className="text-center text-muted mt-5 fw-bold mb-5">Dashboard</h3>
                    <Row className="g-4 mb-4">
                        <Col xs={12} sm={6} md={3}>
                            <Card className="mx-auto h-100 shadow-sm text-center">
                                <Card.Body>
                                    <i className="bi bi-calendar-week" style={{ fontSize: "50px" }}></i>
                                    <Card.Title className="fw-bold mt-3">Appointments</Card.Title>
                                    <Card.Text>View and manage your upcoming appointments.</Card.Text>
                                    <Button href="/doctorAppointments" variant="info" className="text-white">
                                        View
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} sm={6} md={3}>
                            <Card className=" mx-auto h-100 text-center shadow-sm">
                                <Card.Body>
                                    <i className="bi bi-chat-right-text" style={{ fontSize: "50px" }}></i>
                                    <Card.Title className="fw-bold mt-3">Doctor Forum</Card.Title>
                                    <Card.Text>Engage in discussions and collaborate with fellow doctors.</Card.Text>
                                    <Button variant="info" className="text-white">
                                        Join
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} sm={6} md={3}>
                            <Card className="mx-auto h-100 text-center shadow-sm">
                                <Card.Body>
                                    <i className="bi bi-clipboard-data" style={{ fontSize: "50px" }}></i>
                                    <Card.Title className="fw-bold mt-3">Analytics</Card.Title>
                                    <Card.Text>Track your performance and patient trends.</Card.Text>
                                    <Button variant="info" className="text-white">
                                        View
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} sm={6} md={3}>
                            <Card className="mx-auto h-100 shadow-sm text-center">
                                <Card.Body>
                                    <i className="bi bi-card-checklist" style={{ fontSize: "50px" }}></i>
                                    <Card.Title className="fw-bold mt-3">My Schedule</Card.Title>
                                    <Card.Text>Organize your schedule and manage your availability.</Card.Text>
                                    <Button variant="info" className="text-white">
                                        Schedule
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} sm={6} md={3}>
                            <Card className="mx-auto h-100 shadow-sm text-center">
                                <Card.Body>
                                    <i className="bi bi-list-stars" style={{ fontSize: "50px" }}></i>
                                    <Card.Title className="fw-bold mt-3">Patient Reviews</Card.Title>
                                    <Card.Text>Review feedback from your patients.</Card.Text>
                                    <Button variant="info" className="text-white">
                                        View
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </Container>
        </>
    );
}
