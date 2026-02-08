import { Routes, Route } from "react-router";
import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Money from "./pages/Money";
import Calendar from "./pages/Calendar";
import ToDo from "./pages/ToDo";
import Settings from "./pages/Settings";
import Layout from "./components/Layout";
import type { Entry } from "./types/entry";
import { todoData } from "./mockdata/todo";
import Meetings from "./pages/Meetings";
import './styles/App.css';
import { meetingsData } from "./mockdata/meetings";
import NotFound from "./pages/NotFound";
import ToDoDetails from "./pages/ToDoDetails";


function App() {
  const [entries, setEntries] = useState<Entry[]>([...todoData, ...meetingsData]);
  const [nextAlterationId, setNextAlterationId] = useState(todoData.length + 1);
  const [nextMeetingId, setNextMeetingId] = useState(meetingsData.length + 1);

  const addEntry = (entry: {
    type: 'alteration' | 'meeting';
    due: string;
    client: string;
    price?: number;
    description: string;
  }) => {
    const id = entry.type === 'alteration'
      ? nextAlterationId
      : nextMeetingId;

    const newEntry: Entry = {
      ...entry,
      id,
      status: "Not Started",
    };

    setEntries(prev => [...prev, newEntry]);

    if (entry.type === 'alteration') {
      setNextAlterationId(id + 1);
    } else {
      setNextMeetingId(id + 1);
    }
  };

  const updateStatus = (id: number, status: Entry["status"]) => {
    setEntries(prev =>
      prev.map(entry =>
        entry.id === id ? {...entry, status} : entry
      )
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Layout addEntry={addEntry}><Dashboard entries={entries} /></Layout>} />
      <Route path="money" element={<Layout addEntry={addEntry}><Money /></Layout>} />
      <Route path="calendar" element={<Layout addEntry={addEntry}><Calendar /></Layout>} />
      <Route path="todo" element={<Layout addEntry={addEntry}><ToDo key={entries.length}  entries={entries} /></Layout>} />
      <Route path="settings" element={<Layout addEntry={addEntry}><Settings /></Layout>} />
      <Route path="meetings" element={<Layout addEntry={addEntry}><Meetings entries={entries} /></Layout>} />
      <Route path="/todo/:id" element={<Layout addEntry={addEntry}><ToDoDetails entries={entries} updateStatus={updateStatus} /></Layout>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App;
