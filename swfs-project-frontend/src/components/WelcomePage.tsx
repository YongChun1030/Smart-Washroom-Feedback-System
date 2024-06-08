import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import './WelcomePage.css';

const WelcomePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toiletType, floor } = location.state || { toiletType: '', floor: '' };

  const navigateToFeedback = () => {
    navigate('/rating', { state: { toiletType, floor } });
  };
  
  const navigateToCleanerLogin = () => {
    navigate('/cleaner-login', { state: { toiletType, floor } });
  };

  let icon = '';
  if (toiletType && floor) {
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
  }

  return (
    <Container fluid className="welcome-page text-center d-flex align-items-center justify-content-center" style={{ height: '100vh', background: 'linear-gradient(to bottom, #00c6ff, #0072ff)' }}>
      <Row className="h-100">
        <Col className="d-flex flex-column align-items-center justify-content-center h-100">
          <h1 className="text-white text-center mb-5">WELCOME TO<br />SMART WASHROOM FEEDBACK SYSTEM</h1>
          {icon && (
            <>
              <div className="icon mt-3 mb-3">
                <span role="img" aria-label="toilet-icon" className="display-1 text-white">{icon}</span>
              </div>
              <h2 className="text-white text-center">{`${floor.toUpperCase()} ${toiletType.toUpperCase()} TOILET`}</h2>
            </>
          )}
          <div className="buttons mt-4 d-flex justify-content-center">
            <Button onClick={navigateToFeedback} className="btn btn-primary btn-lg mx-2">FEEDBACK</Button>
            <Button onClick={navigateToCleanerLogin} className="btn btn-primary btn-lg mx-2">CLEANER</Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default WelcomePage;
