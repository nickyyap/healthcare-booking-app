import Navbar from "../components/Navbar";
import { Container, ListGroup, Alert, Button, Modal, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";

export default function MyAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [alertVariant, setAlertVariant] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [currentAppointment, setCurrentAppointment] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [appointmentToDelete, setAppointmentToDelete] = useState(null);
    const [historyAppointments, setHistoryAppointments] = useState([]);
    const [formData, setFormData] = useState({
        doctor_id: "",
        medical_department: "",
        appointment_purpose: "",
        appointment_date: "",
        appointment_time: "",
    });

    const API_URL = import.meta.env.VITE_API_URL;

    const auth = getAuth();
    const user = auth.currentUser;
    const patientId = user ? user.uid : null;

    const fetchAppointments = async () => {
        if (!patientId) {
            setAlertVariant("danger");
            setAlertMessage("User not authenticated");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/appointments/patient/${patientId}`);

            if (response.ok) {
                const data = await response.json();
                const pending = data.filter(app => app.status === "pending");
                const history = data.filter(app => app.status === "completed" || app.status === "cancelled");
                setAppointments(pending);
                setHistoryAppointments(history);
            } else {
                const errorData = await response.json();
                setAlertVariant("danger");
                setAlertMessage(errorData.message || "Failed to fetch appointments.");
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
            setAlertVariant("danger");
            setAlertMessage("Error fetching appointments.")
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [patientId, API_URL])

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    const handleEdit = (appointment) => {
        setCurrentAppointment(appointment);
        setFormData({
            doctor_id: appointment.doctor_id,
            medical_department: appointment.medical_department,
            appointment_purpose: appointment.appointment_purpose,
            appointment_date: formatDate(appointment.appointment_date),
            appointment_time: appointment.appointment_time,
        });
        setShowModal(true);
    };

    const handleSaveChange = async () => {
        try {
            const response = await fetch(`${API_URL}/appointments/${currentAppointment.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    medical_department: formData.medical_department,
                    appointment_purpose: formData.appointment_purpose,
                    appointment_date: formData.appointment_date,
                    appointment_time: formData.appointment_time,
                    doctor_id: currentAppointment.doctor_id,
                }),
            });

            if (response.ok) {
                const updatedAppointment = await response.json();
                setAppointments((prevAppointments) =>
                    prevAppointments.map((appointment) =>
                        appointment.id === updatedAppointment.id ? updatedAppointment : appointment
                    )
                );
                setAlertVariant("success");
                setAlertMessage("Appointment updated successfully!");
                setShowModal(false);

                fetchAppointments();
            }

            if (!response.ok) {
                if (response.status === 409) { // Conflict error (time slot already booked)
                    setAlertVariant("danger");
                    setAlertMessage("This time slot is already booked. Please choose another time.");
                } else if (response.status === 400) {
                    setAlertVariant("danger");
                    setAlertMessage("Appointment cannot be in the past.");
                } else {
                    setAlertVariant("danger");
                    setAlertMessage("Failed to update appointment. Please try again.");
                }
                return;
            }
        } catch (error) {
            console.error("Error updating appointment:", error);
            setAlertVariant("danger");
            setAlertMessage("Error updating appointment.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleDeleteConfirm = (appointmentId) => {
        setAppointmentToDelete(appointmentId);
        setShowDeleteConfirm(true);
    }

    const handleDelete = async () => {
        try {
            const response = await fetch(`${API_URL}/appointments/${appointmentToDelete}`, {
                method: "DELETE",
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Appointment deleted successfully:", data);
                setAlertVariant("success");
                setAlertMessage("Appointment deleted successfully!");
                setShowDeleteConfirm(false);
                fetchAppointments();
            }
        } catch (error) {
            console.error("Error:", error.message);
            setAlertVariant("danger");
            setAlertMessage("Error deleting appointment.");
        }
    };

    const getStatus = (status) => {
        switch (status) {
            case "completed":
                return "border-success text-success";
            case "cancelled":
                return "border-danger text-danger";
            case "pending":
                return "border-warning text-dark";
            default:
                return "border-secondary text-white";
        }
    };

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
                <h1 className="text-center mb-5 fw-bold">My Appointments</h1>
                {alertMessage && (
                    <Alert variant={alertVariant} onClose={() => setAlertMessage("")} dismissible>{alertMessage}</Alert>
                )}
                <h3 className="mb-4">Upcoming Appointments</h3>
                {appointments.length === 0 ? (
                    <Alert variant="info" className="mt-4">
                        You have no upcominng appointments.
                    </Alert>
                ) : (
                    <ListGroup>
                        {appointments.map((appointment) => (
                            <ListGroup.Item
                                key={appointment.id}
                                className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 appointment-list-patient border">
                                <div className="d-flex flex-column p-4">
                                    <h4 className="fw-bold d-flex align-items-center">{appointment.medical_department.toUpperCase()}
                                        <span className="badge mb-2 text-primary" style={{ fontSize: "10px" }}>UPCOMING</span>
                                    </h4>
                                    <p className="mb-4 text-muted"><strong>Dr. {appointment.doctor_name}</strong></p>
                                    <h4><i className="bi bi-calendar3 me-2"></i>{formatDate(appointment.appointment_date)} <i className="bi bi-clock-fill me-1 ms-3"></i>{appointment.appointment_time}</h4>
                                    <p className="mt-2"><strong>Purpose:</strong> {appointment.appointment_purpose}</p>
                                </div>

                                <div className="mt-3 mt-md-0 d-flex gap-2 p-4">
                                    <Button
                                        variant="secondary"
                                        size="md"
                                        className="rounded-pill d-flex align-items-center justify-content-center"
                                        onClick={() => handleEdit(appointment)}>
                                        <i className="bi bi-pencil-square"></i>
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="md"
                                        className="rounded-pill d-flex align-items-center justify-content-center"
                                        onClick={() => handleDeleteConfirm(appointment.id)}>
                                        <i className="bi bi-trash"></i>
                                    </Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}

                <h3 className="text-secondary mb-4">Appointments History</h3>
                {historyAppointments.length === 0 ? (
                    <Alert variant="info" className="mt-4">
                        You have no past appointments.
                    </Alert>
                ) : (
                    <ListGroup>
                        {historyAppointments.map((appointment) => (
                            <ListGroup.Item
                                key={appointment.id}
                                className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 text-muted border">
                                <div className="d-flex flex-column p-4">
                                    <h4 className="fw-bold">{appointment.medical_department.toUpperCase()}
                                        <span className={`badge mb-2 ${getStatus(appointment.status)}`} style={{ fontSize: "10px" }}>
                                            {appointment.status.toUpperCase()}
                                        </span>
                                    </h4>
                                    <p className="mb-4"><strong>Dr. {appointment.doctor_name}</strong></p>
                                    <h4><i className="bi bi-calendar3 me-2"></i>{formatDate(appointment.appointment_date)} <i className="bi bi-clock-fill me-1 ms-3"></i>{appointment.appointment_time}</h4>
                                    <p className="mt-2"><strong>Purpose:</strong> {appointment.appointment_purpose}</p>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}

                <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title className="text-danger">Confirm Delete</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Are you sure you want to cancel this appointment?</p>
                        <p>This action is irreversible.</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Appointment</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {alertMessage && (
                            <Alert variant={alertVariant} onClose={() => setAlertMessage("")} dismissible>
                                {alertMessage}
                            </Alert>
                        )}

                        <Form>
                            <Form.Group controlId="medicalDepartment" className="mb-3">
                                <Form.Label>Medical Department</Form.Label>
                                <Form.Select
                                    name="medical_department"
                                    value={formData.medical_department}
                                    onChange={handleChange}>
                                    <option value="">--- Select Medical Department ---</option>
                                    <option value="Allergy and Immunology">Allergy and Immunology</option>
                                    <option value="Andrology">Andrology</option>
                                    <option value="Cardiology">Cardiology</option>
                                    <option value="Dentistry">Dentistry</option>
                                    <option value="Endocrinology">Endocrinology</option>
                                    <option value="Gastroenterology / Hepatology">Gastroenterology / Hepatology</option>
                                    <option value="General Medicine/Internal Medicine">General Medicine/Internal Medicine</option>
                                    <option value="General Surgery">General Surgery</option>
                                    <option value="Hematology / Pathology">Hematology / Pathology</option>
                                    <option value="Infectious Diseases">Infectious Diseases</option>
                                    <option value="Neurology">Neurology</option>
                                    <option value="Obstetrics and Gynecology (OB/GYN)">Obstetrics and Gynecology (OB/GYN)</option>
                                    <option value="Oncology">Oncology</option>
                                    <option value="Otolaryngology (ENT)">Otolaryngology (ENT)</option>
                                    <option value="Pediatrics">Pediatrics</option>
                                    <option value="Psychiatry">Psychiatry</option>
                                    <option value="Radiology">Radiology</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group controlId="appointmentPurpose" className="mb-3">
                                <Form.Label>Purpose</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="appointment_purpose"
                                    value={formData.appointment_purpose}
                                    onChange={handleChange} />
                            </Form.Group>

                            <Form.Group controlId="appointmentDate" className="mb-3">
                                <Form.Label>Appointmemt Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="appointment_date"
                                    value={formData.appointment_date}
                                    onChange={handleChange} />
                            </Form.Group>

                            <Form.Group controlId="appointmentTime" className="mb-3">
                                <Form.Label>Appointmemt Time</Form.Label>
                                <Form.Control
                                    type="time"
                                    name="appointment_time"
                                    value={formData.appointment_time}
                                    onChange={handleChange} />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="dark" onClick={handleSaveChange}>Save Changes</Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </>
    )
}