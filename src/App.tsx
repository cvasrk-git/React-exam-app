import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ExamPage from "./pages/ExamPage";
import ExamTakingPage from "./pages/ExamTakingPage";
import ResultsPage from "./pages/ResultsPage";
import "./index.css";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ExamPage />} />
        <Route path="/exam" element={<ExamTakingPage />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
