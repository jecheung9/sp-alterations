import { NavLink , useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faCalendar, faHandshake } from "@fortawesome/free-regular-svg-icons";
import { faGear, faList, faMoneyBill1Wave, faPlus, faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
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
    <div className="sticky top-0 self-start flex flex-row sm:flex-col text-xl wide:text-2xl border-2 border-black bg-[#808080] text-white sm:max-w-max w-full p-2 sm:min-h-screen h-auto justify-evenly sm:justify-start">
      <div className="flex justify-between">
        <h3 className="text-xl wide:text-2xl hidden sm:inline">Alterations Dashboard</h3>
      </div>
      <NavLink to="/dashboard" aria-label="Dashboard" className={({ isActive }) =>
        `flex-1 flex sm:flex-none justify-center sm:justify-start gap-4 no-underline text-white py-3 sm:py-2
        ${isActive ? "bg-blue-700" : "hover:text-black"}`}>
          <FontAwesomeIcon className="icon text-2xl" icon={faHouse} />
          <span className="hidden sm:inline">Dashboard</span>
        </NavLink>
        <NavLink to="/money" aria-label="Money" className={({ isActive }) =>
          `flex-1 flex sm:flex-none justify-center sm:justify-start gap-4 no-underline text-white py-3 sm:py-2
          ${isActive ? "bg-blue-700" : "hover:text-black"}`}>
          <FontAwesomeIcon className="icon text-2xl" icon={faMoneyBill1Wave} />
          <span className="hidden sm:inline">Money</span>
        </NavLink>
        <NavLink to="/calendar" aria-label="Calendar" className={({ isActive }) =>
          `flex-1 flex sm:flex-none justify-center sm:justify-start gap-4 no-underline text-white py-3 sm:py-2
          ${isActive ? "bg-blue-700" : "hover:text-black"}`}>
          <FontAwesomeIcon className="icon text-2xl" icon={faCalendar} />
          <span className="hidden sm:inline">Calendar</span>
        </NavLink> 
        <NavLink to="/todo" aria-label="Todo "className={({ isActive }) =>
          `flex-1 flex sm:flex-none justify-center sm:justify-start gap-4 no-underline text-white py-3 sm:py-2
          ${isActive ? "bg-blue-700" : "hover:text-black"}`}>
          <FontAwesomeIcon className="icon text-2xl" icon={faList} />
          <span className="hidden sm:inline">To-do</span>
      </NavLink>
      <NavLink to="/meetings" aria-label="Meetings" className={({ isActive }) =>
        `flex-1 flex sm:flex-none justify-center sm:justify-start gap-4 no-underline text-white py-3 sm:py-2
        ${isActive ? "bg-blue-700" : "hover:text-black"}`}>
        <FontAwesomeIcon className="icon text-2xl" icon={faHandshake} />
        <span className="hidden sm:inline">Meetings</span>
      </NavLink>
      <div className="flex-1 flex sm:flex-none justify-center sm:justify-start gap-4 no-underline text-white py-3 sm:py-2 hover:text-black hover:cursor-pointer active:text-[#000077]" onClick={onOpen} aria-label="Add Entry" >
        <FontAwesomeIcon className="icon text-2xl" icon={faPlus} />
        <span className="hidden sm:inline">Add Entry</span>
      </div>
      <NavLink to="/settings" aria-label="Settings" className={({ isActive }) =>
        `flex-1 flex sm:flex-none justify-center sm:justify-start gap-4 no-underline text-white py-3 sm:py-2
        ${isActive ? "bg-blue-700" : "hover:text-black"}`}>
        <FontAwesomeIcon className="icon text-2xl" icon={faGear} />
        <span className="hidden sm:inline">Settings</span>
      </NavLink>

      {token && (
        <div className="flex-1 flex sm:flex-none justify-center sm:justify-start gap-4 no-underline text-white py-3 sm:py-2 hover:text-black cursor-pointer" onClick={handleLogout} aria-label="Log Out">
          <FontAwesomeIcon className="icon text-2xl" icon={faArrowRightFromBracket} />
          <span className="hidden sm:inline">Log Out</span>
        </div>
      )}

    </div>
  )

}

export default Navbar;