import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';

// Simple test component to debug routing
const RouteTest: React.FC = () => {
  const location = useLocation();
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Route Test</h1>
      <p>Current route: {location.pathname}</p>
      <nav style={{ marginBottom: '20px' }}>
        <Link to="/test1" style={{ marginRight: '10px' }}>Test 1</Link>
        <Link to="/test2" style={{ marginRight: '10px' }}>Test 2</Link>
        <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
      </nav>
      
      <Routes>
        <Route path="/test1" element={<div>This is Test 1</div>} />
        <Route path="/test2" element={<div>This is Test 2</div>} />
        <Route path="/login" element={<div>This is Login</div>} />
        <Route path="/" element={<div>This is Home</div>} />
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </div>
  );
};

function AppSimple() {
  return (
    <Router>
      <RouteTest />
    </Router>
  );
}

export default AppSimple;