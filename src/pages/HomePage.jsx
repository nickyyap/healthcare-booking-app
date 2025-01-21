import Navbar from "../components/Navbar";
import { Container, Row, Col, Image, Card } from "react-bootstrap";
import banner from "../assets/images/doctorbanner.png";
import "../App.css";
import cardiology from "../assets/images/doctor/dr-cardiology.jpg";
import oncology from "../assets/images/doctor/dr-oncology.jpg";
import obstetrics from "../assets/images/doctor/dr-obstetrics.jpg";
import allergy from "../assets/images/doctor/dr-allergy.jpg";
import pediatrics from "../assets/images/doctor/dr-pediatrics.jpg";
import infectious from "../assets/images/doctor/dr-infectious.jpg";
import otolaryngology from "../assets/images/doctor/dr-otolaryngology.jpg";
import generalsurgery from "../assets/images/doctor/dr-general-surgery-male.jpg";

export default function HomePage() {

    const doctors = [
        { id: 1, name: "Benjamin Carter", specialty: "Cardiology", image: cardiology, highlight: true },
        { id: 2, name: "Jessica Davis", specialty: "Oncology", image: oncology, highlight: true },
        { id: 3, name: "Hannah Lee", specialty: "Infectious Diseases", image: infectious, highlight: true },
        { id: 4, name: "Nick Lopez", specialty: "General Surgery", image: generalsurgery, highlight: true },
        { id: 5, name: "Sarah Johnson", specialty: "Pediatrics", image: pediatrics, highlight: true },
        { id: 6, name: "Lisa Martinez", specialty: "Obstetrics and Gynecology (OB/GYN)", image: obstetrics, highlight: true },
        { id: 7, name: "James Allen", specialty: "Otolaryngology (ENT)", image: otolaryngology, highlight: true },
        { id: 8, name: "Ryan Mitchell", specialty: "Allergy and Immunology", image: allergy, highlight: true },
    ];

    function DoctorCard({ doctor }) {
        return (
            <Card className="mx-auto h-100 shadow-sm" style={{ maxWidth: "18rem" }}>
                <Card.Img
                    variant="top"
                    src={doctor.image}
                    className="rounded mb-3"
                    style={{ height: "22rem", objectFit: "cover" }} />
                <Card.Body>
                    {doctor.highlight && (
                        <span className="badge bg-success mb-2">Top Rated</span>
                    )}
                    <Card.Title className="fw-bold">Dr. {doctor.name}</Card.Title>
                    <Card.Text className="text-muted">{doctor.specialty}</Card.Text>
                </Card.Body>
            </Card>
        );
    }
    return (
        <>
            <Container>
                <Navbar />
                <Row className="flex-column-reverse flex-md-row align-items-center rounded custom-bg-color" style={{ paddingTop: "100px" }}>
                    <Col xs={12} md={6} className="text-center text-white mb-4">
                        <h1 className="text-center text-white fw-bold" style={{ lineHeight: "1.5" }}>Schedule Your Appointment <br />With Trusted Doctors</h1>
                        <p className="mb-4 me-4 ms-4">Explore our wide range of trusted doctors and easily schedule your appointment without any hassle.</p>
                        <div className="d-flex flex-column align-items-center">
                            <a href="/doctors" className="btn btn-info p-3 rounded-pill text-white custom-button">Schedule Appointment <i className="bi bi-arrow-right"></i></a>
                        </div>
                    </Col>
                    <Col xs={12} md={6}>
                        <Image src={banner} fluid rounded />
                    </Col>
                </Row>

                <Container className="py-5">
                    <h3 className="text-center text-muted mt-5 fw-bold mb-5">Top Doctors to Book</h3>
                    <Row className="g-4">
                        {doctors.map((doctor) => (
                            <Col key={doctor.id} xs={12} sm={6} md={4} lg={3}>
                                <DoctorCard doctor={doctor} />
                            </Col>
                        ))}
                        <div className="text-center mt-5">
                            <p className="mb-4 me-4 ms-4 text-center">Discover more highly skilled doctors in our network.
                                <br /> Browse through our extensive list of trusted professionals and schedule your appointment.</p>
                            <a href="/doctors" className="btn btn-info p-3 rounded-pill text-white custom-button">More Doctor <i className="bi bi-arrow-right"></i></a>
                        </div>
                    </Row>
                </Container>
            </Container>
        </>
    )
}