import { getAuth, updateProfile } from "firebase/auth";
import { AuthContext } from "../components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { Button, Image, Alert, Container, Row, Modal, Form } from "react-bootstrap";
import defaultprofilepic from "../assets/images/default-profile-pic.jpeg";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "../components/Navbar";
import "../App.css";

export default function ProfilePage() {
    const auth = getAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const { currentUser } = useContext(AuthContext);
    const API_URL = import.meta.env.VITE_API_URL;

    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState("");
    const [profilePic, setProfilePic] = useState(null);
    const [profilePicUrl, setProfilePicUrl] = useState(defaultprofilepic);
    const [doctorData, setDoctorData] = useState(null);
    const [patientData, setPatientData] = useState(null);
    const [alertVariant, setAlertVariant] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isDoctor, setIsDoctor] = useState(false);
    const [formData, setFormData] = useState({
        fullName: currentUser ? fullName : "",
        email: currentUser ? currentUser.email : "",
        firebaseUid: currentUser ? currentUser.uid : "",
        specialty: isDoctor ? "" : undefined,
        qualification: isDoctor ? "" : undefined,
        yearsOfExperience: isDoctor ? "" : undefined,
        officeHours: isDoctor ? "" : undefined,
        languagesSpoken: isDoctor ? "" : undefined,
        gender: !isDoctor ? "" : undefined,
    });

    if (!currentUser) {
        navigate("/login");
    }

    //Update isDoctor when role changes
    useEffect(() => {
        setIsDoctor(role === "doctor");
    }, [role]);

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const userDoc = doc(db, "users", user.uid);
                    const docSnap = await getDoc(userDoc);

                    if (docSnap.exists()) {
                        const { fullName, role } = docSnap.data();
                        setFullName(fullName);
                        setRole(role);
                    }

                    setProfilePicUrl(user.photoURL || defaultprofilepic);
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                // When the user is logged out, redirect to the login page.
                navigate("/login");
            }
            setLoading(false);
        }
        fetchUserData();
    }, [auth, navigate]);


    const handleProfilePicChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setProfilePic(file);
            setProfilePicUrl(URL.createObjectURL(file));
            setAlertVariant("success");
            setAlertMessage("Profile picture selected successfully. Preview your picture before uploading.");
        }
    };

    const handleProfilePicClick = () => {
        fileInputRef.current?.click();
    };

    const handleUpload = async () => {
        if (!profilePic) {
            setAlertVariant("danger");
            setAlertMessage("Please select a profile picture");
            return;
        }

        const user = auth.currentUser;

        if (!user) {
            setAlertVariant("danger");
            setAlertMessage("User data is not available.");
            return;
        }

        try {
            const folder = role === "patient" ? "patients" : "doctors";
            const storageRef = ref(storage, `${folder}/${user.uid}/${profilePic.name}`);

            // Upload file to Firebase Storage
            await uploadBytes(storageRef, profilePic);

            // Get the URL of the uploaded file
            const uploadedPicUrl = await getDownloadURL(storageRef);

            // Update the user's profile with the new photoURL
            await updateProfile(user, { photoURL: uploadedPicUrl });

            // Update the state with the new profile picture URL
            setProfilePicUrl(uploadedPicUrl);
            setAlertVariant("success");
            setAlertMessage("Profile picture updated successfully!");
        } catch (error) {
            setAlertVariant("danger");
            setAlertMessage("Error uploading profile picture.");
            console.error("Upload error:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    useEffect(() => {
        setFormData((prevData) => ({
            ...prevData,
            fullName: fullName,
            email: currentUser ? currentUser.email : "",
            firebaseUid: currentUser ? currentUser.uid : "",
            specialty: isDoctor ? prevData.specialty || "" : undefined,
            qualification: isDoctor ? prevData.qualification || "" : undefined,
            yearsOfExperience: isDoctor ? prevData.yearsOfExperience || "" : undefined,
            officeHours: isDoctor ? prevData.officeHours || "" : undefined,
            languagesSpoken: isDoctor ? prevData.languagesSpoken || "" : undefined,
            gender: !isDoctor ? prevData.gender || "" : undefined,

        }));
    }, [fullName, isDoctor, currentUser]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        console.log("Form data:", formData);

        //const API_URL = import.meta.env.VITE_API_URL;
        if (!API_URL) {
            console.error("API_URL is not defined. Check your .env file.");
        }
        const endpoint = isDoctor ? "/addDoctorProfile" : "/addPatientProfile";
        console.log("Endpoint URL:", `${API_URL}${endpoint}`);

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                setAlertVariant("success");
                setAlertMessage(`Profile saved successfully ID: ${data.id}`);
                setShowModal(false);
            } else {
                const error = await response.json();
                setAlertVariant("danger");
                setAlertMessage(`Error saving profile: ${error.error}`);
            }
        } catch (error) {
            setAlertVariant("danger");
            setAlertMessage("An unexpected error occurred. Please try again.");
            console.error("Form submission error:", error);
        }
    };

    useEffect(() => {
        if (role === "doctor" && currentUser) {
            const fetchDoctorProfile = async () => {
                const userId = currentUser.uid;
                try {
                    const response = await fetch(`${API_URL}/getDoctor/${userId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setDoctorData(data);
                    } else {
                        setAlertVariant("info");
                        setAlertMessage("Update your personal information.");
                    }
                } catch (error) {
                    console.error("Error fetching doctor data:", error);
                    setAlertVariant("danger");
                    setAlertMessage("Error fetching doctor data.");
                }
            };
            fetchDoctorProfile();
        } else if (role === "patient" && currentUser) {
            const fetchPatientProfile = async () => {
                const userId = currentUser.uid
                try {
                    const response = await fetch(`${API_URL}/getPatient/${userId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setPatientData(data);
                    } else {
                        setAlertVariant("info");
                        setAlertMessage("Update your personal information.");
                    }
                } catch (error) {
                    console.error("Error fetching patient data:", error);
                    setAlertVariant("danger");
                    setAlertMessage("Error fetching patient data.");
                }
            };
            fetchPatientProfile();
        }
    }, [role, API_URL, currentUser]);

    const handleLogout = () => {
        auth.signOut()
    };

    useEffect(() => {
        if (alertMessage) {
            const timer = setTimeout(() => {
                setAlertMessage("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [alertMessage]);

    if (loading) {
        return <p>Loading...</p>; //Show a loading message while waiting for auth state
    }

    return (
        <>
            <Container>
                <Navbar />
                {/*Profile Section*/}
                <Row className="d-flex justify-content-center align-items-center text-center">
                    <div className="profile-container p-4 text-center">
                        {alertMessage && (
                            <Alert variant={alertVariant} onClose={() => setAlertMessage("")} dismissible>
                                {alertMessage}
                            </Alert>
                        )}
                        <h1 className="mb-5 fw-bold">My Profile</h1>
                        <div className="profile-pic-container mx-auto" style={{ width: "150px", height: "150px" }}>
                            <Image
                                src={profilePicUrl}
                                alt="Profile Picture"
                                width={150}
                                height={150}
                                roundedCircle
                                style={{ cursor: "pointer" }}
                                onClick={handleProfilePicClick}
                            />
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handleProfilePicChange}
                            />
                            <Button
                                variant="outline-dark"
                                className="mt-3"
                                onClick={handleUpload}
                            >
                                Update Picture
                            </Button>
                        </div>
                    </div>
                    <p className="mt-5 fw-bold" style={{ textTransform: "uppercase" }}>{role}</p>
                    <h1 className="fw-bold" style={{ textTransform: "uppercase" }}>{fullName}</h1>

                    {role === "doctor" && doctorData ? (
                        <div className="doctor-data mt-4 d-flex justify-content-center">
                            <div className="w-20">
                                <div className="row mb-3">
                                    <div className="col-6 text-start"><strong>Specialty:</strong></div>
                                    <div className="col-6 text-start">{doctorData.specialty}</div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-6 text-start"><strong>Qualification:</strong></div>
                                    <div className="col-6 text-start">{doctorData.qualification}</div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-6 text-start"><strong>Years of Experience:</strong></div>
                                    <div className="col-6 text-start">{doctorData.experience_years} Year/s</div>
                                </div>
                                <div className="row mb-3">
                                    <div className="col-6 text-start"><strong>Office Hours:</strong></div>
                                    <div className="col-6 text-start">{doctorData.office_hours}</div>
                                </div>
                                <div className="row mb-5">
                                    <div className="col-6 text-start"><strong>Languages Spoken:</strong></div>
                                    <div className="col-6 text-start">{doctorData.languages_spoken}</div>
                                </div>
                            </div>
                        </div>


                    ) : role === "patient" && patientData ? (
                        <div className="patient-data">
                            <p className="fw-bold">{patientData.gender}</p>
                        </div>
                    ) : null}
                    <p className="fw-light mb-4" style={{ border: "0.5px solid black", padding: '5px', borderRadius: "10px", width: "300px", margin: "0 auto" }}><i className="bi bi-envelope-fill me-2"> {currentUser.email}</i></p>
                    <div className="d-flex flex-column align-items-center">
                        <Button className="mt-2 btn-md w-100" variant="dark" style={{ borderRadius: "20px" }} onClick={() => setShowModal(true)}>
                            Add Profile Detail
                        </Button>
                        <Button className="mt-2 btn-md w-100" style={{ borderRadius: "20px" }} onClick={handleLogout} variant="danger">
                            Sign out
                        </Button>
                    </div>

                </Row>

                {/*Profile Detail Modal Section*/}
                <Modal show={showModal} onHide={() => { setShowModal(false) }}>
                    <Modal.Header closeButton>
                        <Modal.Title>{isDoctor ? "Edit Doctor Profile" : "Edit Patient Profile"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleFormSubmit}>
                            <Form.Group className="fullName">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    disabled />
                            </Form.Group>

                            {isDoctor ? (
                                <>
                                    <Form.Group controlId="specialty" className="mb-3">
                                        <Form.Label>Specialty</Form.Label>
                                        <Form.Select
                                            name="specialty"
                                            value={formData.specialty}
                                            onChange={handleInputChange}>
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
                                    <Form.Group controlId="qualification">
                                        <Form.Label>Qualification</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Qualification"
                                            name="qualification"
                                            value={formData.qualification}
                                            onChange={handleInputChange} />
                                    </Form.Group>
                                    <Form.Group controlId="yearsOfExperience">
                                        <Form.Label>Years of Experience</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="Years Of Experience"
                                            name="yearsOfExperience"
                                            value={formData.yearsOfExperience}
                                            onChange={handleInputChange} />
                                    </Form.Group>
                                    <Form.Group controlId="officeHours">
                                        <Form.Label>OfficeHours</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            placeholder="Office Hours"
                                            name="officeHours"
                                            value={formData.officeHours}
                                            onChange={handleInputChange} />
                                    </Form.Group>
                                    <Form.Group controlId="languagesSpoken">
                                        <Form.Label>Languages Spoken</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            placeholder="Languages Spoken"
                                            name="languagesSpoken"
                                            value={formData.languagesSpoken}
                                            onChange={handleInputChange} />
                                    </Form.Group>
                                </>
                            ) : (
                                <>
                                    <Form.Group controlId="gender">
                                        <Form.Label>Gender</Form.Label>
                                        <select
                                            className="form-control"
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange} >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </Form.Group>
                                </>
                            )}
                            <Form.Group controlId="email">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled />
                            </Form.Group>
                            <Button type="submit" variant="primary" className="mt-3">Save</Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            </Container>
        </>
    );
}