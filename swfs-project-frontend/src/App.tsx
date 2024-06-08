import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ConfigurationPage from './components/ConfigurationPage';
import WelcomePage from './components/WelcomePage';
import RatingPage from './components/RatingPage';
import ProblemsPage from './components/ProblemPage';
import ThankYouPage from './components/ThankYouPage';
import OtherProblemsPage from './components/OtherProblemsPage';
import CleanerLogin from './components/CleanerLogin';
import CleanerProblemsPage from './components/CleanerProblemPage';
import './App.css';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/config" element={<ConfigurationPage />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/rating" element={<RatingPage />} />
      <Route path="/problems" element={<ProblemsPage />} />
      <Route path="/other-problems" element={<OtherProblemsPage />} />
      <Route path="/thank-you" element={<ThankYouPage />} />
      <Route path="/cleaner-login" element={<CleanerLogin />} />
      <Route path="/cleaner-problems" element={<CleanerProblemsPage />} />
      <Route path="*" element={<Navigate to="/config" />} />
    </Routes>
  );
};

export default App;
