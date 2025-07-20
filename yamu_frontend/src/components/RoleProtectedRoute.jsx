import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext'; // your context file

const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const  user  = useUser().user;

  if (!user) return <Navigate to="/login" />;

  return allowedRoles.includes(user.role) ? (
    children
  ) : (
    <Navigate to="/unauthorized" />
  );
};

export default RoleProtectedRoute;