
import { useNavigate, Navigate } from 'react-router-dom';
import { useEffect } from 'react';

const Index = () => {
  // Redirect to the dashboard page
  return <Navigate to="/" replace />;
};

export default Index;
