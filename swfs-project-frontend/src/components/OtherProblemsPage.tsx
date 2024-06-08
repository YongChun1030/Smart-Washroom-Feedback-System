import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Button, Form, Spinner } from 'react-bootstrap';

const OtherProblemsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toiletType, floor } = location.state || { toiletType: '', floor: '' };
  const [otherProblem, setOtherProblem] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const otherProblemData = {
      description: otherProblem,
      toiletType,
      floor
    };

    try {
      const response = await fetch('http://localhost:5000/api/other-problem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(otherProblemData)
      });
      const data = await response.json();
      console.log(data.message); // Log response message
      navigate('/thank-you', { state: { toiletType, floor } });
    } catch (error) {
      console.error('Error:', error);
    }

    setLoading(false);
  };

  let icon;
  switch (toiletType) {
    case 'male':
      icon = '♂️';
      break;
    case 'female':
      icon = '♀️';
      break;
    case 'oku':
      icon = '♿';
      break;
    default:
      icon = '';
  }

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100">
      <Row className="w-100">
        <Col className="d-flex flex-column align-items-center">
          <h2 className="text-white text-center mb-4">OTHERS...</h2>
          <div className="bg-white p-5 rounded shadow-sm text-center" style={{ maxWidth: '700px', width: '100%' }}>
            <Form.Group controlId="otherProblem">
              <Form.Label>PLEASE WRITE DOWN YOUR PROBLEMS</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter your problem here..." 
                value={otherProblem} 
                onChange={(e) => setOtherProblem(e.target.value)} 
                disabled={loading}
              />
            </Form.Group>
            <Button variant="primary" onClick={handleSubmit} className="w-100 mt-3" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Submit'}
            </Button>
          </div>
          <div className="text-center mt-4">
            <span role="img" aria-label="toilet-icon" className="display-1" style={{ color: 'white' }}>{icon}</span>
            <h4 className="text-white">{`${floor.toUpperCase()} ${toiletType.toUpperCase()} TOILET`}</h4>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default OtherProblemsPage;