import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import your pages
import Todo from './pages/Todo';
import Audit from './pages/Audit';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={< Todo/>} />
        <Route path="/audit" element={<Audit />} />
      </Routes>
    </Router>
  );
};

export default App;