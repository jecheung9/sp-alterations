import { NavLink , useNavigate } from "react-router-dom";
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
    <div className="sticky top-0 self-start flex flex-row sm:flex-col text-xl wide:text-2xl border-2 border-black bg-[#808080] text-white sm:max-w-max w-full p-2 sm:min-h-screen h-auto justify-between sm:justify-start">
      <div className="flex justify-between">
        <h3 className="text-xl wide:text-2xl hidden sm:inline">Alterations Dashboard</h3>
      </div>
      <NavLink to="/dashboard" className={({ isActive }) =>
        `flex gap-4 no-underline text-white py-2
        ${isActive ? "bg-blue-700" : "hover:text-black"}`}>
          <FontAwesomeIcon className="icon text-2xl" icon={faHouse} />
          <span className="hidden sm:inline">Dashboard</span>
        </NavLink>
        <NavLink to="/money" className={({ isActive }) =>
          `flex gap-4 no-underline text-white py-2
          ${isActive ? "bg-blue-700" : "hover:text-black"}`}>
          <FontAwesomeIcon className="icon text-2xl" icon={faMoneyBill1Wave} />
          <span className="hidden sm:inline">Money</span>
        </NavLink>
        <NavLink to="/calendar" className={({ isActive }) =>
          `flex gap-4 no-underline text-white py-2
          ${isActive ? "bg-blue-700" : "hover:text-black"}`}>
          <FontAwesomeIcon className="icon text-2xl" icon={faCalendar} />
          <span className="hidden sm:inline">Calendar</span>
        </NavLink> 
        <NavLink to="/todo" className={({ isActive }) =>
          `flex gap-4 no-underline text-white py-2
          ${isActive ? "bg-blue-700" : "hover:text-black"}`}>
          <FontAwesomeIcon className="icon text-2xl" icon={faList} />
          <span className="hidden sm:inline">To-do</span>
      </NavLink>
      <NavLink to="/meetings" className={({ isActive }) =>
        `flex gap-4 no-underline text-white py-2
        ${isActive ? "bg-blue-700" : "hover:text-black"}`}>
        <FontAwesomeIcon className="icon text-2xl" icon={faHandshake} />
        <span className="hidden sm:inline">Meetings</span>
      </NavLink>
      <div className="flex gap-4 no-underline text-white py-2 hover:text-black hover:cursor-pointer active:text-[#000077]" onClick={onOpen} >
        <FontAwesomeIcon className="icon text-2xl" icon={faPlus} />
        <span className="hidden sm:inline">Add Entry</span>
      </div>
      <NavLink to="/settings" className={({ isActive }) =>
        `flex gap-4 no-underline text-white py-2
        ${isActive ? "bg-blue-700" : "hover:text-black"}`}>
        <FontAwesomeIcon className="icon text-2xl" icon={faGear} />
        <span className="hidden sm:inline">Settings</span>
      </NavLink>

      {token && (
        <div className="navbar-auth">
          <button className="auth-button" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      )}

    </div>
  )

}

export default Navbar;