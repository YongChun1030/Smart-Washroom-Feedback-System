import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';

const RatingPage: React.FC = () => {
  const [rating, setRating] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { toiletType, floor } = location.state || { toiletType: '', floor: '' };

  const handleRating = (rate: number) => {
    setRating(rate);
  };

  const handleSubmit = () => {
    const ratingData = {
      rating,
      toiletType,
      floor,
    };

    fetch('http://localhost:5000/api/rating', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ratingData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        navigate('/problems', { state: { toiletType, floor } });
      })
      .catch((error) => {
        console.error('Error:', error);
      });
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
    <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100" style={{ background: 'linear-gradient(to bottom, #00c6ff, #0072ff)' }}>
      <Row className="w-100">
        <Col className="d-flex flex-column align-items-center">
          <h2 className="text-white text-center mb-4">PLEASE RATE YOUR EXPERIENCE</h2>
          <div className="bg-white p-5 rounded shadow-sm text-center" style={{ maxWidth: '400px', width: '100%' }}>
            <div className="d-flex justify-content-center mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  size={40}
                  className="mx-1"
                  color={star <= rating ? "#ffc107" : "#e4e5e9"}
                  onClick={() => handleRating(star)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </div>
            <Button variant="primary" onClick={handleSubmit} className="w-100 mt-3">
              Next
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

export default RatingPage;
