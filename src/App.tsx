import { Routes, Route } from "react-router";
import Dashboard from "./pages/Dashboard";
import Money from "./pages/Money";
import Calendar from "./pages/Calendar";
import ToDo from "./pages/ToDo";
import Settings from "./pages/Settings";
import './styles/App.css';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="money" element={<Money />} />
      <Route path="calendar" element={<Calendar />} />
      <Route path="todo" element={<ToDo />} />
      <Route path="settings" element={<Settings />} />
    </Routes>
  )
}

export default App;
