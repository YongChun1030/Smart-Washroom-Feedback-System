import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import './WelcomePage.css';

const CleanerLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { toiletType, floor } = location.state || { toiletType: '', floor: '' };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    const loginData = {
        username,
        password
    };
  
    fetch('http://localhost:5000/api/cleaner-login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Login successful') {
            navigate('/cleaner-problems', { state: { cleanerId: username, toiletType, floor } });
        } else {
            console.log('Invalid credentials');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
  };
 

  const handleBack = () => {
    navigate('/welcome', { state: { toiletType, floor } });
  };

  return (
    <Container fluid className="welcome-page text-center" style={{ height: '100vh', background: 'linear-gradient(to bottom, #00c6ff, #0072ff)' }}>
      <Row className="h-100">
        <Col className="d-flex flex-column align-items-center justify-content-center">
          <h1 className="text-white text-center mb-5">WELCOME TO<br />SMART WASHROOM FEEDBACK SYSTEM</h1>
          <Form onSubmit={handleSubmit} className="w-100" style={{ maxWidth: '400px' }}>
            <Form.Group controlId="formUsername" className="my-3">
              <Form.Label className="text-white">Staff Id</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formPassword" className="my-3">
              <Form.Label className="text-white">Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Login
            </Button>
          </Form>
          <Button variant="secondary" onClick={handleBack} className="mt-3">
            Cancel
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default CleanerLogin;
