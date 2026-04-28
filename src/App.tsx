import { Routes, Route, useNavigate } from "react-router-dom";
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
import { FetchHelper } from "./utils/Fetch";
import Confirmation from "./components/Confirmation";


function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [nextAlterationId, setNextAlterationId] = useState(1);
  const [nextMeetingId, setNextMeetingId] = useState(1);
  const [toast, setToast] = useState<{
    message: string;
    type: "default" | "delete";
  } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Entry | null>(null);
  const [deleteTimeoutId, setDeleteTimeoutId] = useState<number | null>(null);
  const { token, onLogout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadEntries() {
      try {
      const [alterationsRes, meetingsRes] = await Promise.all([
        FetchHelper("http://localhost:3000/api/todo", {}, token, onLogout, navigate),
        FetchHelper("http://localhost:3000/api/meetings", {}, token, onLogout, navigate)
      ]);

        if (!alterationsRes || !meetingsRes) {
          return;
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

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 8000);

    return () => clearTimeout(timer);
  }, [toast]);

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
        prev.filter(entry => !(entry.id === id && entry.type === type))
      )
    } catch (err) {
      console.error(err);
    }
  }

  const todoEntries = entries.filter(i => i.type === 'alteration');
  const meetingEntries = entries.filter(i => i.type === 'meeting');


  const showToast = (
    message: string,
    type: "default" | "delete" = "default"
  ) => {
    setToast({message, type });
  };

  const deleteMeetingUndo = (entry: Entry) => {
    setPendingDelete(entry);
    setEntries(prev =>
      prev.filter(e => !(e.id === entry.id && e.type === entry.type))
    );
    showToast("Meeting deleted successfully!", "delete");

    const timeoutId = window.setTimeout(async () => {
      await deleteMeeting(entry.id, entry.type);
      setPendingDelete(null);
      setToast(null);
      setDeleteTimeoutId(null);
    }, 8000);
    
    setDeleteTimeoutId(timeoutId);
  };

  const undoDelete = () => { //restore the entry
    if (!pendingDelete) return;
    if (deleteTimeoutId) {
      clearTimeout(deleteTimeoutId);
    }

    setEntries(prev => [...prev, pendingDelete]);
    setPendingDelete(null);
    setToast(null);
    setDeleteTimeoutId(null);
  }

  const deleteTodoUndo = (entry: Entry) => {
    setPendingDelete(entry);
    setEntries(prev =>
      prev.filter(e => !(e.id === entry.id && e.type === entry.type))
    );
    showToast("Todo deleted successfully!", "delete");

    const timeoutId = window.setTimeout(async () => {
      await deleteTodo(entry.id, entry.type);
      setPendingDelete(null);
      setToast(null);
      setDeleteTimeoutId(null);
    }, 8000);
    
    setDeleteTimeoutId(timeoutId);
  };



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
              <Layout addTodo={addTodo} addMeeting={addMeeting} showToast={showToast}>
                <Dashboard entries={entries} />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="money"
          element={
            <ProtectedRoute>
              <Layout addTodo={addTodo} addMeeting={addMeeting} showToast={showToast}>
                <Money entries={todoEntries}/>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="calendar"
          element={
            <ProtectedRoute>
              <Layout addTodo={addTodo} addMeeting={addMeeting} showToast={showToast}>
                <Calendar entries={entries}/>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="todo"
          element={
            <ProtectedRoute>
              <Layout addTodo={addTodo} addMeeting={addMeeting} showToast={showToast}>
                <ToDo entries={entries} addTodo={addTodo} showToast={showToast} />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <Layout addTodo={addTodo} addMeeting={addMeeting} showToast={showToast}>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="meetings"
          element={
            <ProtectedRoute>
              <Layout addTodo={addTodo} addMeeting={addMeeting} showToast={showToast}>
                <Meetings entries={entries} addMeeting={addMeeting} showToast={showToast}/>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/todo/:id"
          element={
            <ProtectedRoute>
              <Layout addTodo={addTodo} addMeeting={addMeeting} showToast={showToast}>
                <ToDoDetails
                  entries={todoEntries}
                  updateTodo={updateTodo}
                  deleteTodo={deleteTodoUndo}
                  showToast={showToast}
                />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/meetings/:id"
          element={
            <ProtectedRoute>
              <Layout addTodo={addTodo} addMeeting={addMeeting} showToast={showToast}>
                <MeetingDetail
                  entries={meetingEntries}
                  updateMeeting={updateMeeting}
                  deleteMeeting={deleteMeetingUndo}
                  showToast={showToast}
                />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>

      {toast && (
        <Confirmation
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          onUndo={toast.type === "delete" ? undoDelete : undefined}
      />
      )}
    </>  
  )
}

export default App;
