// This redirects to Dashboard - the main Index is now Dashboard
import { Navigate } from "react-router-dom";

const Index = () => {
  return <Navigate to="/" replace />;
};

export default Index;
