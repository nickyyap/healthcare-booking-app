import Navbar from "../components/Navbar";
import { useState, useEffect, useRef } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { getAuth } from "firebase/auth";
import { Container, ListGroup, Alert, Button, Modal, Form } from "react-bootstrap";
import emailjs from "@emailjs/browser";

export default function DoctorAppointments() {
    const form = useRef();
    const [appointments, setAppointments] = useState([]);
    const [alertVariant, setAlertVariant] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [file, setFile] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL;

    const auth = getAuth();
    const user = auth.currentUser;
    const doctorId = user ? user.uid : null;

    const fetchDoctorAppointments = async () => {
        if (!doctorId) {
            setAlertVariant("danger");
            setAlertMessage("User not authenticated");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/appointments/doctor/${doctorId}`);

            if (response.ok) {
                const data = await response.json();
                setAppointments(data);
            } else {
                setAlertVariant("danger");
                setAlertMessage("Failed to fetch appointments");
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
            setAlertVariant("danger");
            setAlertMessage("Error fetching appointments.");
        }
    };

    const formateDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const updateAppointmentStatus = async (appointmentId, status) => {
        try {
            const response = await fetch(`${API_URL}/appointments/${appointmentId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                const updatedAppointment = await response.json();
                setAppointments((prevAppointments) =>
                    prevAppointments.map((appointment) =>
                        appointment.id === updatedAppointment.id ? { ...appointment, status: updatedAppointment.status } : appointment)
                );
                setAlertVariant("success");
                setAlertMessage(`Appointment ${status}!`);
            } else {
                setAlertVariant("danger");
                setAlertMessage("Failed to update appointment status.");
            }
        } catch (error) {
            console.error("Error updating appointment status:", error.message);
            setAlertVariant("danger");
            setAlertMessage("Error updating appointment status.");
        }
    };

    const upcomingAppointments = appointments.filter((appointment) => appointment.status === "pending");
    const pastAppointments = appointments.filter(
        (appointment) => appointment.status === "completed" || appointment.status === "cancelled"
    );

    const getAppointmentBorderClass = (status) => {
        if (status === "completed") {
            return "border-success";
        } else if (status === "cancelled") {
            return "border-danger";
        }
        return "";
    };

    const handleUpload = (appointment) => {
        setShowModal(true);
        setSelectedPatient({
            patient_id: appointment.patient_id,
            patient_name: appointment.patient_name,
            patient_email: appointment.patient_email,
        });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const uploadFileToFirebase = async (patientId) => {
        if (!file) return null;

        const storageRef = ref(storage, `reports/${patientId}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log("Upload is " + progress + "% done");
                },
                (error) => {
                    reject(error);
                },
                async () => {
                    const url = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(url);
                }
            );
        });
    };

    const sendEmail = async (event, patient) => {
        event.preventDefault();

        if (!patient || !patient.patient_id) {
            setAlertVariant("danger");
            setAlertMessage("Patient UID not found.");
            return;
        }

        try {
            const fileUrl = await uploadFileToFirebase(patient.patient_id);  // Ensure correct patient_id is passed
            if (!fileUrl) {
                setAlertVariant("danger");
                setAlertMessage("Failed to upload file.");
                return;
            }

            const formData = new FormData(form.current);
            formData.append("attachment", fileUrl);

            const response = await emailjs.sendForm(
                "service_jc3th08",
                "template_d5w8ydr",
                form.current,
                "4njMWR4WQS3OOOOxr"
            );
            console.log("Email sent successfully:", response);
            setShowModal(false);
            setAlertVariant("success");
            setAlertMessage("Report uploaded and email sent!");
        } catch (error) {
            console.error("Error sending email:", error);
            setAlertVariant("danger");
            setAlertMessage("Error sending email.");
        }
    };

    useEffect(() => {
        fetchDoctorAppointments();
    }, [doctorId, API_URL]);

    useEffect(() => {
        if (alertMessage) {
            const timer = setTimeout(() => {
                setAlertMessage("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [alertMessage]);

    return (
        <>
            <Container>
                <Navbar />
                <h1 className="text-center mb-5 fw-bold">Patients</h1>
                {alertMessage && (
                    <Alert variant={alertVariant} onClose={() => setAlertMessage("")} dismissible>
                        {alertMessage}
                    </Alert>
                )}

                <h3 className="mb-4">Upcoming Appointments</h3>
                {upcomingAppointments.length === 0 ? (
                    <Alert variant="info" className="mt-4">
                        No upcoming appointment.
                    </Alert>
                ) : (
                    <ListGroup>
                        {upcomingAppointments.map((appointment) => (
                            <ListGroup.Item
                                key={appointment.id}
                                className={`d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 border-2 rounded border-top shadow appointment-list ${getAppointmentBorderClass(appointment.status)}`} >
                                <div className="d-flex flex-column p-4">
                                    <h4 className="mb-4" style={{ textTransform: "uppercase" }}>{appointment.full_name}</h4>
                                    <h5><i className="bi bi-calendar3 me-2"></i>{formateDate(appointment.appointment_date)} <i className="bi bi-clock-fill me-1 ms-3"></i> {appointment.appointment_time}</h5>
                                    <p className="mt-3 text-muted"><strong>Purpose:</strong> {appointment.appointment_purpose}</p>
                                    <p className="text-muted"><i className="bi bi-envelope-fill me-1"></i> {appointment.email}</p>
                                </div>
                                <div className="mt-3 mt-md-0 d-flex gap-2">
                                    <Button
                                        variant="secondary"
                                        size="md"
                                        className="rounded-pill d-flex align-items-center justify-content-center"
                                        onClick={() => handleUpload(appointment)} >
                                        <i className="bi bi-file-earmark-arrow-up"></i>
                                    </Button>
                                    <Button
                                        variant="success"
                                        size="md"
                                        className="rounded-pill d-flex align-items-center justify-content-center"
                                        onClick={() => updateAppointmentStatus(appointment.id, "completed")}>
                                        <i className="bi bi-check"></i>
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="md"
                                        className="rounded-pill d-flex align-items-center justify-content-center"
                                        onClick={() => updateAppointmentStatus(appointment.id, "cancelled")}>
                                        <i className="bi bi-x"></i>
                                    </Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}

                <h3 className="text-secondary mb-4">Past Appointments</h3>
                {pastAppointments.length === 0 ? (
                    <Alert variant="info" className="mt-4">
                        No past appointment.
                    </Alert>
                ) : (
                    <ListGroup>
                        {pastAppointments.map((appointment) => (
                            <ListGroup.Item
                                key={appointment.id}
                                className={`d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 border-2 rounded border-top shadow ${getAppointmentBorderClass(appointment.status)}`} >
                                <div className="d-flex flex-column p-4">
                                    <h4 className="mb-4" style={{ textTransform: "uppercase" }}>{appointment.full_name}</h4>
                                    <h5><i className="bi bi-calendar3 me-2"></i>{formateDate(appointment.appointment_date)} <i className="bi bi-clock-fill me-1 ms-3"></i> {appointment.appointment_time}</h5>
                                    <p className="mt-3 text-muted"><strong>Purpose:</strong> {appointment.appointment_purpose}</p>
                                    <p className="text-muted"><i className="bi bi-envelope-fill me-1"></i> {appointment.email}</p>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}

            </Container>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Upload Patient Report</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted">
                        Please fill out the form below to upload the patient&apos;s report.
                        The report will be sent directly to the patient&apos;s email address provided during the appointment.
                    </p>

                    <Form ref={form} onSubmit={(e) => sendEmail(e, selectedPatient)}>
                        <Form.Group controlId="formPatientUid" className="mb-3">
                            <Form.Label>Patient ID</Form.Label>
                            <Form.Control type="text" name="patient_id" required defaultValue={selectedPatient?.patient_id || ""} readOnly />
                        </Form.Group>

                        <Form.Group controlId="formPatientName" className="mb-3">
                            <Form.Label>Patient Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="patient_name"
                                required defaultValue={selectedPatient?.patient_name || ""} />
                        </Form.Group>

                        <Form.Group controlId="formPatientEmail" className="mb-3">
                            <Form.Label>Patient Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="patient_email"
                                required defaultValue={selectedPatient?.patient_email || ""} />
                        </Form.Group>

                        <Form.Group controlId="formFile" className="mb-3">
                            <Form.Label>Upload Report</Form.Label>
                            <Form.Control
                                type="file"
                                name="file"
                                onChange={handleFileChange}
                                required />
                        </Form.Group>
                        <Form.Group controlId="formMessage" className="mb-3">
                            <Form.Label>Message</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="message"
                                rows={3}
                                placeholder="Add any additional message" />
                        </Form.Group>

                        <div className="d-flex justify-content-end">
                            <Button variant="dark" type="submit">Upload</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}
