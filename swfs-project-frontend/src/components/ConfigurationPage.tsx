import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Modal } from 'react-bootstrap';
import './WelcomePage.css';

const ConfigurationPage: React.FC = () => {
  const [toiletType, setToiletType] = useState('');
  const [floor, setFloor] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const configData = {
      toiletType,
      floor,
    };

    try {
      const response = await fetch('http://localhost:5000/api/configuration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configData),
      });

      const result = await response.json();
      
      if (response.ok) {
        setModalMessage('Configuration saved successfully');
        setShowModal(true);
      } else {
        if (result.message === 'Configuration already exists') {
          setModalMessage('Configuration already exists');
        } else {
          setModalMessage('Failed to save configuration');
        }
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setModalMessage('An error occurred while saving the configuration');
      setShowModal(true);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    if (modalMessage === 'Configuration saved successfully') {
      navigate('/welcome', { state: { toiletType, floor } });
    }
  };

  return (
    <Container fluid className="welcome-page text-center" style={{ height: '100vh', background: 'linear-gradient(to bottom, #00c6ff, #0072ff)' }}>
      <Row className="h-100">
        <Col className="d-flex flex-column align-items-center justify-content-center">
          <h1 className="text-white text-center mb-5">WELCOME TO<br />SMART WASHROOM FEEDBACK SYSTEM <br/> CONFIGURATION</h1>
          <Form onSubmit={handleSubmit} className="w-100" style={{ maxWidth: '400px' }}>
            <Form.Group controlId="formToiletType" className="my-3">
              <Form.Label className="text-white">Toilet Type</Form.Label>
              <Form.Control 
                as="select" 
                value={toiletType} 
                onChange={(e) => setToiletType(e.target.value)} 
                required
              >
                <option value="">Select Toilet Type</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="oku">OKU</option>
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="formFloor" className="my-3">
              <Form.Label className="text-white">Floor</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter floor" 
                value={floor} 
                onChange={(e) => setFloor(e.target.value)} 
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Submit
            </Button>
          </Form>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Configuration Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ConfigurationPage;
