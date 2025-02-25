import { logoutUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        navigate("/login");
    };

    return (
        <nav>
            <h2>YAMU Travel</h2>
            <button onClick={handleLogout}>Logout</button>
        </nav>
    );
};

export default Navbar;
