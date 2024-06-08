import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

const ThankYouPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toiletType, floor } = location.state || { toiletType: '', floor: '' };

  const handleBackToWelcome = () => {
    navigate('/welcome', { state: { toiletType, floor } });
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
    <Container fluid className="d-flex flex-column align-items-center justify-content-center min-vh-100">
      <Row className="text-center">
        <Col>
          <h1 className="text-white">THANK YOU FOR YOUR FEEDBACK,</h1>
          <h1 className="text-white">HAVE A NICE DAY!</h1>
          <Button variant="primary" onClick={handleBackToWelcome} className="mt-3">
            Back
          </Button>
          <div className="icon mt-3 mb-3">
            <span role="img" aria-label="toilet-icon" className="display-1 text-white">{icon}</span>
          </div>
          <h3 className="text-white">{`${floor.toUpperCase()} ${toiletType.toUpperCase()} TOILET`}</h3>
        </Col>
      </Row>
    </Container>
  );
};

export default ThankYouPage;
