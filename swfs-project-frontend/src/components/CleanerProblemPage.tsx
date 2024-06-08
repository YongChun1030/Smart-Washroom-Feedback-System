import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Button, Modal } from 'react-bootstrap';
import axios from 'axios';

const CleanerProblemsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cleanerId, toiletType, floor } = location.state || { cleanerId: '', toiletType: '', floor: '' };
  const [problems, setProblems] = useState<any[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/problems', {
        params: { toiletType, floor }
      })
      .then((response) => {
        console.log('Fetched problems:', response.data);
        if (response.data && response.data.problems) {
          setProblems(response.data.problems);
        } else {
          console.error('Unexpected response structure:', response.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching problems', error);
      });
  }, [toiletType, floor]);

  const getSimilarProblems = (description: string) => {
    return problems.filter(problem => problem.description === description).map(problem => problem._id);
  };

  const toggleSelection = (description: string) => {
    const similarProblems = getSimilarProblems(description);
    setSelectedProblems((prev) => {
      const newSelection = prev.includes(similarProblems[0])
        ? prev.filter(id => !similarProblems.includes(id))
        : [...new Set([...prev, ...similarProblems])];
      return newSelection;
    });
  };

  const handleConfirmation = () => {
    if (selectedProblems.length === 0) {
      setErrorMessage('Please select at least one problem.');
    } else {
      setShowModal(true);
    }
  };

  const handleSubmit = () => {
    axios.post('http://localhost:5000/api/solve-problems', {
      problemIds: selectedProblems,
      cleanerId
    })
    .then(response => {
      console.log('Response from server:', response.data);
      setShowModal(false);
      setSelectedProblems([]);
      // Fetch updated problems
      axios.get('http://localhost:5000/api/problems', {
        params: { toiletType, floor }
      })
        .then((response) => {
          console.log('Fetched problems:', response.data);
          if (response.data && response.data.problems) {
            setProblems(response.data.problems);
          } else {
            console.error('Unexpected response structure:', response.data);
          }
        })
        .catch((error) => {
          console.error('Error fetching problems', error);
        });
    })
    .catch(error => {
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      console.error('Error config:', error.config);
    });
  };

  const handleBack = () => {
    navigate('/welcome', { state: { toiletType, floor } });
  };

  const uniqueProblems = Array.from(new Set(problems.map(problem => problem.description)))
    .map(description => {
      return problems.find(problem => problem.description === description);
    });

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100">
      <Row className="w-100">
        <Col className="d-flex flex-column align-items-center">
          <h2 className="text-white text-center mb-4">PROBLEMS TO SOLVE</h2>
          <div
            className="bg-white p-5 rounded shadow-sm text-center"
            style={{ maxWidth: '700px', width: '100%' }}
          >
            <Row className="mb-3">
              {uniqueProblems.length > 0 ? (
                uniqueProblems.map((problem: any) => (
                  <Col xs={6} md={4} className="mb-3" key={problem._id}>
                    <Button
                      variant={selectedProblems.includes(problem._id) ? 'primary' : 'outline-primary'}
                      className="w-100"
                      onClick={() => toggleSelection(problem.description)}
                    >
                      {problem.description}
                    </Button>
                  </Col>
                ))
              ) : (
                <Col>
                  <p className="text-center">No problems found</p>
                </Col>
              )}
            </Row>
            <Button variant="primary" onClick={handleConfirmation} className="w-100 mt-3">
              Submit
            </Button>
            <Button variant="secondary" onClick={handleBack} className="w-100 mt-3">
              Back
            </Button>
          </div>
        </Col>
      </Row>
      
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to submit {selectedProblems.length} problem(s)?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={errorMessage !== ''} onHide={() => setErrorMessage('')}>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>{errorMessage}</Modal.Body>
      </Modal>
    </Container>
  );
};

export default CleanerProblemsPage;
