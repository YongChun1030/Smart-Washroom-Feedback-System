import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner, Image } from 'react-bootstrap';

// Import images
import dirtyMirror from '../assets/dirtymirror.jpg';
import dirtyToiletBowl from '../assets/dirtytoiletbowl.jpeg';
import dryer from '../assets/dryer.jpeg';
import other from '../assets/other.jpg';
import pipeLeak from '../assets/pipeleak.jpg';
import rubbishBin from '../assets/rubbishbin.jpg';
import smelly from '../assets/smelly.jpg';
import soap from '../assets/soap.jpeg';
import toiletPaper from '../assets/toiletpaper.jpg';
import waterSinkStuck from '../assets/watersinksstuck.png';
import waterTap from '../assets/watertap.jpg';
import wetFloor from '../assets/wetfloor.jpg';

import './ProblemPage.css'; // Import the CSS file

const ProblemsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toiletType, floor } = location.state || { toiletType: '', floor: '' };
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const problems = [
    'RUBBISH BIN FULL', 'HAND DRYER BROKEN', 'NO SOAP', 'SMELLY', 'NO TOILET PAPER', 
    'WET FLOOR', 'DIRTY MIRROR', 'WATER SINK STUCK', 'DIRTY TOILET BOWL', 
    'WATER TAP BROKEN', 'LEAKING PIPE', 'OTHERS'
  ];

  const problemImages: { [key: string]: string } = {
    'RUBBISH BIN FULL': rubbishBin,
    'HAND DRYER BROKEN': dryer,
    'NO SOAP': soap,
    'SMELLY': smelly,
    'NO TOILET PAPER': toiletPaper,
    'WET FLOOR': wetFloor,
    'DIRTY MIRROR': dirtyMirror,
    'WATER SINK STUCK': waterSinkStuck,
    'DIRTY TOILET BOWL': dirtyToiletBowl,
    'WATER TAP BROKEN': waterTap,
    'LEAKING PIPE': pipeLeak,
    'OTHERS': other,
  };

  const toggleSelection = (problem: string) => {
    setSelectedProblems(prev =>
      prev.includes(problem) ? prev.filter(p => p !== problem) : [...prev, problem]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    const problemsToSubmit = selectedProblems.filter(problem => problem !== 'OTHERS');
    if (problemsToSubmit.length > 0) {
      const problemData = {
        problems: problemsToSubmit,
        toiletType,
        floor
      };

      try {
        await fetch('http://localhost:5000/api/problem', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(problemData)
        });
      } catch (error) {
        console.error('Error:', error);
      }
    }

    setLoading(false);

    if (selectedProblems.includes('OTHERS')) {
      navigate('/other-problems', { state: { toiletType, floor } });
    } else {
      navigate('/thank-you', { state: { toiletType, floor } });
    }
  };

  const handleNoProblem = () => {
    navigate('/thank-you', { state: { toiletType, floor } });
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
    <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100 problems-page content-container">
      <Row className="w-100">
        <Col className="d-flex flex-column align-items-center">
          <h2 className="text-white text-center mb-4 title">WHAT PROBLEMS YOU FACED</h2>
          <div className="bg-white p-3 rounded shadow-sm text-center problem-container">
            <Row className="mb-3">
              {problems.map((problem) => (
                <Col xs={6} md={3} className="mb-3 d-flex flex-column align-items-center" key={problem}>
                  <div onClick={() => toggleSelection(problem)} className="problem-card">
                    <Image
                      src={problemImages[problem]}
                      rounded
                      className={`problem-image ${selectedProblems.includes(problem) ? 'selected' : ''}`}
                    />
                    <Button
                      variant={selectedProblems.includes(problem) ? 'primary' : 'outline-primary'}
                      className="w-100 mt-2 problem-button"
                    >
                      {problem}
                    </Button>
                  </div>
                </Col>
              ))}
            </Row>
            <Button variant="primary" onClick={handleSubmit} className="w-100 mt-3 smaller-button" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Submit'}
            </Button>
            <Button variant="outline-secondary" onClick={handleNoProblem} className="w-100 mt-2 smaller-button">
              No Problem
            </Button>
          </div>
          <div className="text-center mt-4 toilet-info">
            <span role="img" aria-label="toilet-icon" className="icon" style={{ color: 'white' }}>{icon}</span>
            <h4 className="text-white">{`${floor.toUpperCase()} ${toiletType.toUpperCase()} TOILET`}</h4>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProblemsPage;
