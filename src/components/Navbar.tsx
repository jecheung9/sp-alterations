import { useState } from "react";
import { Link } from "react-router";
import '../styles/Navbar.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faCalendar } from "@fortawesome/free-regular-svg-icons";
import { faList, faMoneyBill1Wave, faPlus } from "@fortawesome/free-solid-svg-icons";

interface NavbarProps {
  onOpen: () => void;
};

const Navbar: React.FC<NavbarProps> = ({
  onOpen,
}) => {
  return (
    <div className="navbar">
      <div className="navbar-header">
        <h3>Alterations Dashboard</h3>
      </div>
        <Link to="/" className="navbar-category">
          <FontAwesomeIcon className="icon"icon={faHouse} />
          Dashboard
        </Link>
        <Link to="/money" className="navbar-category">
          <FontAwesomeIcon className="icon" icon={faMoneyBill1Wave} />
          Money
        </Link>
        <Link to="/calendar" className="navbar-category">
          <FontAwesomeIcon className="icon" icon={faCalendar} />
          Calendar
        </Link> 
        <Link to="/todo" className="navbar-category">
          <FontAwesomeIcon className="icon" icon={faList} />
          To-do
        </Link>
      <div className="navbar-category" onClick={onOpen} >
        <FontAwesomeIcon icon={faPlus} />
        Add Entry
      </div>
      <Link to="/settings" className="navbar-category">
        <FontAwesomeIcon className="icon" icon={faList} />
        Settings
      </Link>
    </div>
  )

}

export default Navbar;