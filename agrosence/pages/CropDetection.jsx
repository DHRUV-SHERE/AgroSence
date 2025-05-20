import { useState } from "react"
import { Container, Row, Col, Card, Form, Button, Image } from "react-bootstrap"
import { FaSeedling, FaSearchPlus, FaFlask, FaLeaf } from "react-icons/fa"
import { GiHealthNormal } from "react-icons/gi"
import Navbar from "../components/Header"
import Footer from "../components/Footer"
import axios from "axios"

function CropDetection() {
  const [imageCrop, setImageCrop] = useState(null)
  const [imageHealth, setImageHealth] = useState(null)
  const [resultCrop, setResultCrop] = useState(null)
  const [resultHealth, setResultHealth] = useState(null)
  const [loadingCrop, setLoadingCrop] = useState(false)
  const [loadingHealth, setLoadingHealth] = useState(false)

  const handleCropImageChange = (e) => {
    setImageCrop(e.target.files[0])
    setResultCrop(null)
  }

  const handleHealthImageChange = (e) => {
    setImageHealth(e.target.files[0])
    setResultHealth(null)
  }

  const handleCropUpload = async () => {
    if (!imageCrop) return alert("Please select a crop image.")
    const formData = new FormData()
    formData.append("image", imageCrop)

    setLoadingCrop(true)
    try {
      const response = await axios.post("https://agrosence-1.onrender.com/api/crop-detect", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setResultCrop(response.data)
    } catch (error) {
      console.error("Crop detection failed:", error)
      alert("Crop detection failed.")
    } finally {
      setLoadingCrop(false)
    }
  }

  const handleHealthUpload = async () => {
    if (!imageHealth) return alert("Please select a leaf image.")
    const formData = new FormData()
    formData.append("image", imageHealth)

    setLoadingHealth(true)
    try {
      const response = await axios.post("https://agrosence-1.onrender.com/api/crop-health", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setResultHealth(response.data)
    } catch (error) {
      console.error("Health detection failed:", error)
      alert("Crop health detection failed.")
    } finally {
      setLoadingHealth(false)
    }
  }

  return (
    <>
      <Navbar />
      <Container
        fluid
        className="py-5"
        style={{ background: "linear-gradient(to bottom right, #e6f7e9, #e8f5e9)", minHeight: "100vh" }}
      >
        <Row className="justify-content-center g-4">
          {/* Crop Detection Section */}
          <Col lg={5}>
            <Card className="shadow-lg border-0 h-100">
              <Card.Body className="p-4">
                <Card.Title className="mb-3 text-success fs-3 fw-bold">
                  <FaSeedling className="me-2" /> Crop Detection
                </Card.Title>
                <Card.Text className="text-muted mb-4">
                  Upload an image of a plant to detect its scientific and local names along with a description.
                </Card.Text>

                <Form.Group className="mb-3">
                  <Form.Control type="file" accept="image/*" onChange={handleCropImageChange} className="mb-3" />
                  <Button variant="success" className="w-100" onClick={handleCropUpload} disabled={loadingCrop}>
                    {loadingCrop ? (
                      "Detecting..."
                    ) : (
                      <>
                        <FaSearchPlus className="me-2" /> Detect Crop
                      </>
                    )}
                  </Button>
                </Form.Group>

                {resultCrop && (
                  <div className="mt-4 pt-3 border-top">
                    <Image
                      src={resultCrop.image || "/placeholder.svg"}
                      alt="Detected Crop"
                      className="w-100 rounded mb-3"
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <h5 className="text-success fw-bold">
                      <FaLeaf className="me-1" /> Scientific Name:
                    </h5>
                    <p className="fst-italic">{resultCrop.scientificName}</p>

                    <h5 className="text-primary mt-3">Local Names:</h5>
                    <p>{resultCrop.commonNames?.join(", ")}</p>

                    <h5 className="text-primary mt-3">Description:</h5>
                    <p className="text-secondary">{resultCrop.description}</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Crop Health Detection Section */}
          <Col lg={5}>
            <Card className="shadow-lg border-0 h-100">
              <Card.Body className="p-4">
                <Card.Title className="mb-3 text-danger fs-3 fw-bold">
                  <GiHealthNormal className="me-2" /> Crop Health Detection
                </Card.Title>
                <Card.Text className="text-muted mb-4">
                  Upload an image of a leaf to check if it's healthy or has disease symptoms.
                </Card.Text>

                <Form.Group className="mb-3">
                  <Form.Control type="file" accept="image/*" onChange={handleHealthImageChange} className="mb-3" />
                  <Button variant="danger" className="w-100" onClick={handleHealthUpload} disabled={loadingHealth}>
                    {loadingHealth ? (
                      "Analyzing..."
                    ) : (
                      <>
                        <FaFlask className="me-2" /> Check Health
                      </>
                    )}
                  </Button>
                </Form.Group>

                {resultHealth && (
                  <div className="mt-4 pt-3 border-top">
                    <Image
                      src={resultHealth.image || "/placeholder.svg"}
                      alt="Health Result"
                      className="w-100 rounded mb-3"
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <h5 className="text-danger fw-bold">
                      <FaLeaf className="me-1" /> Health Status:
                    </h5>
                    <p>{resultHealth.status}</p>

                    <h5 className="text-primary mt-3">Notes:</h5>
                    <p className="text-secondary">{resultHealth.notes}</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  )
}

export default CropDetection
