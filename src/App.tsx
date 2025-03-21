import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ExamPage from "./pages/ExamPage";
import ExamTakingPage from "./pages/ExamTakingPage";
import ResultsPage from "./pages/ResultsPage";
import LoginPage from "./pages/LoginPage";
import LoginSuccess from "./pages/LoginSuccess";
import PrivateRoute from "./components/PrivateRoute";
import ExamDetailPage from './pages/ExamDetailPage';
import ProfilePage from './pages/ProfilePage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes - Only Authenticated Users Can Access */}
        <Route element={<PrivateRoute />}>
          <Route path="/login-success" element={<LoginSuccess />} />
          <Route path="/topics" element={<ExamPage />} />
          <Route path="/exam" element={<ExamTakingPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/exam-detail/:examId" element={<ExamDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* Redirect root to login-success for authenticated users */}
          <Route path="/" element={<Navigate to="/login-success" />} />
        </Route>

        {/* Redirect any unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;


