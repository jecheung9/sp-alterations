import { Link, useNavigate } from "react-router-dom";
import '../styles/Navbar.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faCalendar, faHandshake } from "@fortawesome/free-regular-svg-icons";
import { faGear, faList, faMoneyBill1Wave, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthProvider";

interface NavbarProps {
  onOpen: () => void;
};

const Navbar: React.FC<NavbarProps> = ({
  onOpen,
}) => {
  const { token, onLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  }
  return (
    <div className="flex flex-col text-2xl border-2 border-black bg-[#808080] text-white max-w-max p-2 min-h-screen">
      <div className="flex justify-between">
        <h3 className="text-2xl">Alterations Dashboard</h3>
      </div>
        <Link to="/dashboard" className="flex gap-4 no-underline text-white py-2 hover:text-black hover:cursor-pointer active:text-[#000077]">
          <FontAwesomeIcon className="icon"icon={faHouse} />
          Dashboard
        </Link>
        <Link to="/money" className="flex gap-4 no-underline text-white py-2 hover:text-black hover:cursor-pointer active:text-[#000077]">
          <FontAwesomeIcon className="icon" icon={faMoneyBill1Wave} />
          Money
        </Link>
        <Link to="/calendar" className="flex gap-4 no-underline text-white py-2 hover:text-black hover:cursor-pointer active:text-[#000077]">
          <FontAwesomeIcon className="icon" icon={faCalendar} />
          Calendar
        </Link> 
        <Link to="/todo" className="flex gap-4 no-underline text-white py-2 hover:text-black hover:cursor-pointer active:text-[#000077]">
          <FontAwesomeIcon className="icon" icon={faList} />
          To-do
      </Link>
      <Link to="/meetings" className="flex gap-4 no-underline text-white py-2 hover:text-black hover:cursor-pointer active:text-[#000077]">
        <FontAwesomeIcon className="icon" icon={faHandshake} />
        Meetings
      </Link>
      <div className="flex gap-4 no-underline text-white py-2 hover:text-black hover:cursor-pointer active:text-[#000077]" onClick={onOpen} >
        <FontAwesomeIcon icon={faPlus} />
        Add Entry
      </div>
      <Link to="/settings" className="flex gap-4 no-underline text-white py-2 hover:text-black hover:cursor-pointer active:text-[#000077]">
        <FontAwesomeIcon className="icon" icon={faGear} />
        Settings
      </Link>

      {token && (
        <div className="navbar-auth">
          <button className="auth-button" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      )}

    </div>
  )

}

export default Navbar;