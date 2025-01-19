import Navbar from "../components/Navbar";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";

export default function BookDoctor() {
    const [alertVariant, setAlertVariant] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        medicalDepartment: "",
        appointmentPurpose: "",
        appointmentDate: "",
        appointmentTime: "",
    });

    const navigate = useNavigate();
    const location = useLocation();
    const API_URL = import.meta.env.VITE_API_URL;

    const auth = getAuth();
    const user = auth.currentUser;
    const patientId = user ? user.uid : null; // The current user's UID as patientId

    // Destructure doctorId from location.state
    const { doctorId } = location.state || {};

    console.log("Location State:", location.state);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSchedule = async (event) => {
        event.preventDefault();

        // Validate fields
        if (!formData.fullName || !formData.email || !formData.appointmentDate || !formData.appointmentTime) {
            setAlertVariant("danger");
            setAlertMessage("Please fill in all required fields");
            return;
        }

        /*if (!doctorId || !patientId) {
            setAlertVariant("danger");
            setAlertMessage("Doctor ID or Patient ID is missing");
            setTimeout(() => navigate("/doctors"), 3000);
            return null;
        }*/

        try {
            const response = await fetch(`${API_URL}/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    doctor_id: doctorId,
                    patient_id: patientId,
                    full_name: formData.fullName,
                    email: formData.email,
                    phone_number: formData.phoneNumber,
                    medical_department: formData.medicalDepartment,
                    appointment_purpose: formData.appointmentPurpose,
                    appointment_date: formData.appointmentDate,
                    appointment_time: formData.appointmentTime,
                }),
            });


            if (!response.ok) {
                if (response.status === 409) { // Conflict error (time slot already booked)
                    setAlertVariant("danger");
                    setAlertMessage("This time slot is already booked. Please choose another time.");
                } else if (response.status === 400) {
                    setAlertVariant("danger");
                    setAlertMessage("Appointment cannot be in the past.");
                } else {
                    setAlertVariant("danger");
                    setAlertMessage("Failed to schedule appointment. Please try again.");
                }
                return;
            }

            //const result = await response.json();
            setAlertVariant("success");
            setAlertMessage("Appointment scheduled successfully");
            setFormData({
                fullName: "",
                email: "",
                phoneNumber: "",
                medicalDepartment: "",
                appointmentPurpose: "",
                appointmentDate: "",
                appointmentTime: "",
            });

            setTimeout(() => navigate("/doctors"), 2000);
        } catch (error) {
            console.error("Error booking appointment:", error);
            setAlertVariant("danger");
            setAlertMessage("Failed to schedule appointment. Please try again");
        }
    }
    return (
        <>
            <Navbar />
            <Container>
                <h1 className="text-center mb-4">Patient Appointment Form</h1>
                {alertMessage && (
                    <Alert variant={alertVariant} onClose={() => setAlertMessage("")} dismissible>{alertMessage}</Alert>
                )}
                <Form onSubmit={handleSchedule}>
                    <Form.Group controlId="fullName" className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Full Name"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required />
                    </Form.Group>

                    <Form.Group controlId="email" className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required />
                    </Form.Group>

                    <Form.Group controlId="phoneNumber" className="mb-3">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="+6012-3456789"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group controlId="Medical Department" className="mb-3">
                        <Form.Label>Medical Department</Form.Label>
                        <Form.Select
                            name="medicalDepartment"
                            value={formData.medicalDepartment}
                            onChange={handleChange}>
                            <option value="">--- Select Medical Department ---</option>
                            <option value="Allergy and Immunology">Allergy and Immunology</option>
                            <option value="Andrology">Andrology</option>
                            <option value="Cardiology">Cardiology</option>
                            <option value="Dentistry">Dentistry</option>
                            <option value="Dermatology">Dermatology</option>
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
                            as="textarea"
                            rows={3}
                            placeholder="Eg. Sickness, Scan, Blood Test..."
                            name="appointmentPurpose"
                            value={formData.appointmentPurpose}
                            onChange={handleChange} />
                    </Form.Group>

                    <Form.Group controlId="date" className="mb-3">
                        <Form.Label>Appointment Date</Form.Label>
                        <Form.Control
                            type="date"
                            name="appointmentDate"
                            value={formData.appointmentDate}
                            onChange={handleChange}
                            required />
                    </Form.Group>

                    <Form.Group controlId="time" className="mb-3">
                        <Form.Label>Appointment Time</Form.Label>
                        <Form.Control
                            type="time"
                            name="appointmentTime"
                            value={formData.appointmentTime}
                            onChange={handleChange}
                            required />
                    </Form.Group>
                    <Button className="mt-4 btn-md w-100" variant="dark" type="submit">Schedule</Button>
                </Form>
            </Container>
        </>
    )
}