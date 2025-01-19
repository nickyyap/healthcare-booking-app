import Navbar from "../components/Navbar";
import { Container, Row, Col, Card, Button, Spinner, Modal } from "react-bootstrap";
import { useState, useEffect } from "react";
import { ref, getDownloadURL, listAll } from "firebase/storage"; // Import listAll
import { storage } from "../firebase";
import { useNavigate } from "react-router-dom";
import defaultDisplayPic from "../assets//images/default-display-pic.jpg";
import { getAuth } from "firebase/auth";

export default function DoctorsList() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await fetch(`${API_URL}/getAllDoctors`);
                if (!response.ok) {
                    throw new Error("Failed to fetch doctors");
                }

                const data = await response.json();

                // Fetch images dynamically from Firebase Storage
                const doctorsWithImages = await Promise.all(
                    data.map(async (doctor) => {
                        if (!doctor.photo_url) {
                            try {
                                const doctorFolderRef = ref(storage, `doctors/${doctor.firebase_uid}`);
                                const fileList = await listAll(doctorFolderRef);

                                if (fileList.items.length > 0) {
                                    // Use the first file in the folder
                                    const fileRef = fileList.items[0];
                                    doctor.photo_url = await getDownloadURL(fileRef);
                                } else {
                                    console.warn(`No images found for ${doctor.full_name}`);
                                    doctor.photo_url = defaultDisplayPic;
                                }
                            } catch (err) {
                                console.error(`Error fetching image for ${doctor.full_name}:`, err);
                                doctor.photo_url = defaultDisplayPic;
                            }
                        }
                        return doctor;
                    })
                );

                setDoctors(doctorsWithImages);
            } catch (err) {
                console.error("Error fetching doctors:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, [API_URL]);

    const handleBookDoctor = (doctor) => {
        setSelectedDoctor(doctor);
        setShowModal(true);
    };

    if (loading) {
        return (
            <Container className="d-flex align-items-center justify-content-center text-center vh-100">
                <Spinner animation="border" />
                <p className="ms-3 mt-3">Loading...</p>
            </Container>
        );
    }

    return (
        <>
            <Navbar />
            <Container>
                <Row>
                    <h1 className="text-center mb-5">Our Specialist</h1>
                    {doctors.map((doctor) => (
                        <Col key={doctor.firebase_uid} xs={12} sm={6} md={4} lg={3} className="mb-4">
                            <Card className="d-flex flex-column h-100 doctor-card">
                                <Card.Img
                                    src={doctor.photo_url || defaultDisplayPic}
                                    variant="top"
                                    alt="Doctor Image"
                                    style={{ height: "300px", objectFit: "cover" }}
                                />
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title style={{ textTransform: "uppercase" }}>{doctor.full_name}</Card.Title>
                                    <Card.Text>
                                        <p className="mb-2"><strong>Specialty:</strong> {doctor.specialty} <br /></p>
                                        <p className="mb-2"><strong>Qualification:</strong> {doctor.qualification} <br /></p>
                                        <p className="mb-2"><strong>Office Hours:</strong> {doctor.office_hours} <br /></p>
                                        <p className="mb-2"><strong>Languages Spoken:</strong> {doctor.languages_spoken} <br /></p>
                                        <p className="mb-2"><strong>Email:</strong> {doctor.email} <br /></p>
                                    </Card.Text>
                                    <Button className="mt-auto" variant="dark" onClick={() => handleBookDoctor(doctor)}>
                                        Book Appointment
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Booking</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedDoctor && (
                        <>
                            <p>You selected to book an appointment with <strong>Dr. {selectedDoctor.full_name}</strong>.</p>
                            <p>Do you want to proceed with the booking?</p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="success" onClick={() => {
                        const auth = getAuth();
                        const user = auth.currentUser;
                        const patientId = user ? user.uid : null;

                        if (!patientId) {
                            alert("You must be logged in to book an appointment.");
                            return;
                        }
                        navigate("/bookDoctors", { state: { doctorId: selectedDoctor.firebase_uid, patientId: patientId } });
                        setShowModal(false);
                    }}>Proceed</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
