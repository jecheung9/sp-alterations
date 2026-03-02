import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Money from "./pages/Money";
import Calendar from "./pages/Calendar";
import ToDo from "./pages/ToDo";
import Settings from "./pages/Settings";
import Layout from "./components/Layout";
import type { Entry } from "./types/entry";
import type { Client } from "./types/client";
import Meetings from "./pages/Meetings";
import './styles/App.css';
import NotFound from "./pages/NotFound";
import ToDoDetails from "./pages/ToDoDetails";
import MeetingDetail from "./pages/MeetingDetails";
import { Landing } from "./pages/Landing";
import { ProtectedRoute } from "./utils/ProtectedRoute";
import { useAuth } from "./context/AuthProvider";


function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [nextAlterationId, setNextAlterationId] = useState(1);
  const [nextMeetingId, setNextMeetingId] = useState(1);
  const { token } = useAuth();

  useEffect(() => {
    async function loadEntries() {
      try {
        const [alterationsRes, meetingsRes] = await Promise.all([
          fetch("http://localhost:3000/api/todo", {
            headers: { 
              "Content-Type": "application/json", 
              "Authorization": `Bearer ${token}` 
            }
          }),
          fetch("http://localhost:3000/api/meetings", {
            headers: { 
              "Content-Type": "application/json", 
              "Authorization": `Bearer ${token}` 
            }
          }),
        ]);

        if (!alterationsRes.ok || !meetingsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [alterations, meetings] = await Promise.all([
          alterationsRes.json(),
          meetingsRes.json()
        ]);

        const allEntries: Entry[] = [
          ...alterations.map((a: any) => ({ ...a, type: "alteration" })),
          ...meetings.map((m: any) => ({ ...m, type: "meeting" })),
        ];

        setEntries(allEntries);

        setNextAlterationId(
          alterations.length > 0 ? Math.max(...alterations.map((a: any) => a.id)) + 1 : 1
        );

        setNextMeetingId(
          meetings.length > 0 ? Math.max(...meetings.map((m: any) => m.id)) + 1 : 1
        );
      } catch (err) {
        console.error(err);
      }
    }

    loadEntries();
  }, [token]);

  const addMeeting = async (meetingData: {
    due: string;
    client: Client;
    description: string;
  }) => {
    try {
      const id = nextMeetingId;
      const body = { ...meetingData, id };
      const res = await fetch("http://localhost:3000/api/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Failed to create meeting");
      }

      const newMeeting = await res.json();
      setEntries(prev => [...prev, { ...newMeeting, type: "meeting" }]);
      setNextMeetingId(prev => prev + 1);
    } catch (err){
      console.error(err);
    }
  }

  const addTodo = async (TodoData: {
    due: string;
    client: Client;
    price?: number;
    description: string;
  }) => {
    try {
      const id = nextAlterationId;
      const body = { ...TodoData, id };
      const res = await fetch("http://localhost:3000/api/todo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Failed to create todo");
      }

      const newTodo = await res.json();
      setEntries(prev => [...prev, { ...newTodo, type: "alteration" }]);
      setNextAlterationId(prev => prev + 1);
    } catch (err){
      console.error(err);
    }
  }

  const updateMeeting = async (updatedMeeting: Entry, statusOnly = false) => {
    try {
      const { id, type, ...rest } = updatedMeeting;
      let body;
      if (statusOnly) {
        body = { status: rest.status };
      } else {
        body = {
          due: rest.due,
          description: rest.description,
          client: {
            _id: rest.client._id,
            name: rest.client.name
          },
          status: rest.status
        };
      }
      const res = await fetch(`http://localhost:3000/api/meetings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Failed to update meeting");
      } 
      const updated = await res.json();
      setEntries(prev =>
        prev.map(e =>
          e.id === updated.id && e.type === "meeting"
            ? { ...updated, type: "meeting" }
            : e
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const updateTodo = async (updatedTodo: Entry, statusOnly = false) => {
    try {
      const { id, type, ...rest } = updatedTodo;
      let body;
      if (statusOnly) {
        body = { status: rest.status };
      } else {
        body = {
          due: rest.due,
          description: rest.description,
          price: rest.price,
          client: {
            _id: rest.client._id,
            name: rest.client.name
          },
          status: rest.status
        };
      }
      const res = await fetch(`http://localhost:3000/api/todo/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Failed to update todo");
      } 
      const updated = await res.json();
      setEntries(prev =>
        prev.map(e =>
          e.id === updated.id && e.type === "alteration"
            ? { ...updated, type: "alteration" }
            : e
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMeeting = async (id: number, type: Entry["type"]) => {
    try {
      const res = await fetch(`http://localhost:3000/api/meetings/${id}`, {
        method: "DELETE",
        headers: {"Authorization": `Bearer ${token}`}
      });
      if (!res.ok) {
        throw new Error("Failed to delete meeting");
      }
      setEntries(prev => 
        prev.filter(entry => !(entry.id === id && entry.type == type))
      )
    } catch (err) {
      console.error(err);
    }
  }

  const deleteTodo = async (id: number, type: Entry["type"]) => {
    try {
      const res = await fetch(`http://localhost:3000/api/todo/${id}`, {
        method: "DELETE",
        headers: {"Authorization": `Bearer ${token}`}
      });
      if (!res.ok) {
        throw new Error("Failed to delete todo entry");
      }
      setEntries(prev => 
        prev.filter(entry => !(entry.id === id && entry.type == type))
      )
    } catch (err) {
      console.error(err);
    }
  }

  const todoEntries = entries.filter(i => i.type === 'alteration');
  const meetingEntries = entries.filter(i => i.type === 'meeting');

  return (
    <>
      <Routes>
        {/* Public page */}
        <Route path="/" element={<Landing />} />

        {/* Protected pages */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Layout addTodo={addTodo} addMeeting={addMeeting}>
                <Dashboard entries={entries} />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="money"
          element={
            <ProtectedRoute>
              <Layout addTodo={addTodo} addMeeting={addMeeting}>
                <Money />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="calendar"
          element={
            <ProtectedRoute>
              <Layout addTodo={addTodo} addMeeting={addMeeting}>
                <Calendar />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="todo"
          element={
            <ProtectedRoute>
              <Layout addTodo={addTodo} addMeeting={addMeeting}>
                <ToDo key={entries.length} entries={entries} />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <Layout addTodo={addTodo} addMeeting={addMeeting}>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="meetings"
          element={
            <ProtectedRoute>
              <Layout addTodo={addTodo} addMeeting={addMeeting}>
                <Meetings entries={entries} />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/todo/:id"
          element={
            <ProtectedRoute>
              <Layout addTodo={addTodo} addMeeting={addMeeting}>
                <ToDoDetails
                  entries={todoEntries}
                  updateTodo={updateTodo}
                  deleteTodo={deleteTodo}
                />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/meetings/:id"
          element={
            <ProtectedRoute>
              <Layout addTodo={addTodo} addMeeting={addMeeting}>
                <MeetingDetail
                  entries={meetingEntries}
                  updateMeeting={updateMeeting}
                  deleteMeeting={deleteMeeting}
                />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>  
  )
}

export default App;
