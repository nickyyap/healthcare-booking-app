import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { ref, getDownloadURL, listAll } from "firebase/storage";
import { storage } from "../firebase";
import { Container, Card, Button, Alert } from "react-bootstrap";

export default function Report() {
    const [reportUrl, setReportUrl] = useState(null);
    const [reportName, setReportName] = useState(null);
    const [alertVariant, setAlertVariant] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const auth = getAuth();
    const user = auth.currentUser;
    const patientId = user ? user.uid : null;

    const fetchReport = async () => {
        if (!patientId) {
            setAlertVariant("danger");
            setAlertMessage("Use not authenticated");
            return;
        }

        try {
            const reportRef = ref(storage, `reports/${patientId}`);
            const fileList = await listAll(reportRef);

            if (fileList.items.length === 0) {
                setLoading(false);
                return;
            }

            // Assume we need the first file in the list
            const file = fileList.items[0];  // You can modify this logic if there are multiple files
            const fileUrl = await getDownloadURL(file);
            const fileName = file.name;  // This is the original file name

            // Set the URL and file name dynamically
            setReportUrl(fileUrl);
            setReportName(fileName);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching report:", error);
            setAlertVariant("danger");
            setAlertMessage("Failed to fetch the report.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [patientId]);

    return (
        <>
            <Container>
            <Navbar />
                <h1 className="text-center mb-5 fw-bold">Medical Report</h1>

                {alertMessage && (
                    <Alert variant={alertVariant} onHide={() => setAlertMessage("")} dimissible>{alertMessage}</Alert>
                )}

                {loading ? (
                    <p className="text-center">Loading ...</p>
                ) : (
                    <Card className="text-center shadow p-3">
                            {reportUrl ? (
                                <>
                                <Card.Body>
                                <Card.Title>Your report is ready</Card.Title>
                                    <Card.Text>
                                        You can view and download your report <b>{reportName}</b>.
                                    </Card.Text>
                                    <Button variant="transparent" style={{ backgroundColor: "rgb(133, 178, 185)", color: "white" }} href={reportUrl} downlaod>View Report</Button>
                                    </Card.Body>
                                </>
                            ) : (
                                <p>No report available.</p>
                            )}
                    </Card>
                )}
            </Container>
        </>
    )
}