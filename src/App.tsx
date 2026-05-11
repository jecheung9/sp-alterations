import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Money from "./pages/Money";
import Calendar from "./pages/Calendar";
import ToDo from "./pages/ToDo";
import Settings from "./pages/Settings";
import Layout from "./components/Layout";
import type { Entry, AlterationEntry, MeetingEntry } from "./types/entry";
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
    description?: string;
    meetingType?: string;
    alterationIds?: number[];
    id?: number;
  }) => {
    try {
      const id = meetingData.id ?? nextMeetingId;
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
      if (!meetingData.id) {
        setNextMeetingId(prev => prev + 1);
      }
    } catch (err){
      console.error(err);
    }
  }

  const addTodo = async (TodoData: {
    due: string;
    client: Client;
    price?: number;
    description: string;
    id?: number;
  }) => {
    try {
      const id = TodoData.id ?? nextAlterationId;
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
      if (!TodoData.id) {
        setNextAlterationId(prev => prev + 1);
      }
    } catch (err){
      console.error(err);
    }
  }

  const updateMeeting = async (updatedMeeting: Entry, statusOnly = false) => {
    try {
      if (updatedMeeting.type !== "meeting") {
        throw new Error("Invalid entry type for updateMeeting");
      }
      
      const meeting = updatedMeeting as MeetingEntry;
      const { id, type, ...rest } = meeting;
      let body;
      if (statusOnly) {
        body = { status: rest.status };
      } else {
        body = {
          due: rest.due,
          description: meeting.meetingType === "pickup" ? (meeting as any).description : undefined,
          meetingType: rest.meetingType,
          alterationIds: meeting.meetingType === "dropoff" ? (meeting as any).alterationIds : undefined,
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

      if (updated.type === "meeting" && updated.meetingType === "dropoff" && updated.status === "Complete") {
        await Promise.all(
          updated.alterationIds.map((alterationId: number) => {
            fetch(`http://localhost:3000/api/todo/${alterationId}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                status: "Dropped Off"
              })
            })
          })
        )
      }


      setEntries(prev =>
        prev.map(e => {
          if (e.id === updated.id && e.type === "meeting") {
            return { ...updated, type: "meeting" };
          }

          if (updated.type === "meeting" &&
            updated.meetingType === "dropoff" &&
            updated.status === "Complete" &&
            e.type === "alteration" &&
            updated.alterationIds.includes(e.id)) {
            
            return {
              ...e, status: "Dropped Off"
            }
          }
          return e;
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  const updateTodo = async (updatedTodo: Entry, statusOnly = false) => {
    try {
      if (updatedTodo.type !== "alteration") {
        throw new Error("Invalid entry type for updateTodo");
      }
      
      const { id, type, ...rest } = updatedTodo;
      const alteration = rest as Omit<typeof updatedTodo, 'id' | 'type'>;
      let body;
      if (statusOnly) {
        body = { status: alteration.status };
      } else {
        body = {
          due: alteration.due,
          description: alteration.description,
          price: alteration.price,
          client: {
            _id: alteration.client._id,
            name: alteration.client.name
          },
          status: alteration.status
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
      setEntries(prev => prev
        .filter(entry => !(entry.id === id && entry.type === type))
        .map(entry => {
          if (entry.type === "meeting" && entry.meetingType === "dropoff") {
            return {
              ...entry,
              alterationIds: entry.alterationIds.filter(aid => aid !== id)
            };
          }
          return entry;
        })
        .filter(entry => {
          if (entry.type === "meeting" && entry.meetingType === "dropoff") {
            return entry.alterationIds.length > 0;
          }
          return true;
        }))
    } catch (err) {
      console.error(err);
    }
  }

  const todoEntries = entries.filter((i): i is AlterationEntry => i.type === 'alteration');


  const showToast = (
    message: string,
    type: "default" | "delete" = "default"
  ) => {
    setToast({message, type });
  };

  const deleteMeetingUndo = async (entry: Entry) => {
    await deleteMeeting(entry.id, entry.type);
    setEntries(prev =>
      prev.filter(e => !(e.id === entry.id && e.type === entry.type))
    );
    setPendingDelete(entry);
    showToast("Meeting deleted successfully!", "delete");

    const timeoutId = window.setTimeout(async () => {
      setPendingDelete(null);
      setToast(null);
      setDeleteTimeoutId(null);
    }, 8000);
    
    setDeleteTimeoutId(timeoutId);
  };

  const undoDelete = async () => {
    if (!pendingDelete) return;

    const entry = pendingDelete;

    try {
      if (entry.type === "alteration") {
        await addTodo(entry);
      } else if (entry.type === "meeting") {
        await addMeeting(entry);
      }
    } catch (err) {
      console.error(err);
    }

    setPendingDelete(null);
    setToast(null);

    if (deleteTimeoutId) {
      clearTimeout(deleteTimeoutId);
      setDeleteTimeoutId(null);
    }
  };

  const deleteTodoUndo = async (entry: Entry) => {
    await deleteTodo(entry.id, entry.type);
    setEntries(prev =>
      prev.filter(e => !(e.id === entry.id && e.type === entry.type))
    );
    setPendingDelete(entry);
    showToast("Todo deleted successfully!", "delete");

    const timeoutId = window.setTimeout(async () => {
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
              <Layout addTodo={addTodo} addMeeting={addMeeting} showToast={showToast} entries={todoEntries}>
                <Dashboard entries={entries} />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="money"
          element={
            <ProtectedRoute>
              <Layout addTodo={addTodo} addMeeting={addMeeting} showToast={showToast} entries={todoEntries}>
                <Money entries={todoEntries}/>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="calendar"
          element={
            <ProtectedRoute>
              <Layout addTodo={addTodo} addMeeting={addMeeting} showToast={showToast} entries={todoEntries}>
                <Calendar entries={entries}/>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="todo"
          element={
            <ProtectedRoute>
              <Layout addTodo={addTodo} addMeeting={addMeeting} showToast={showToast} entries={todoEntries}>
                <ToDo entries={entries} addTodo={addTodo} showToast={showToast} />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <Layout addTodo={addTodo} addMeeting={addMeeting} showToast={showToast} entries={todoEntries}>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="meetings"
          element={
            <ProtectedRoute>
              <Layout addTodo={addTodo} addMeeting={addMeeting} showToast={showToast} entries={todoEntries}>
                <Meetings entries={entries} addMeeting={addMeeting} showToast={showToast}/>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/todo/:id"
          element={
            <ProtectedRoute>
              <Layout addTodo={addTodo} addMeeting={addMeeting} showToast={showToast} entries={todoEntries}>
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
              <Layout addTodo={addTodo} addMeeting={addMeeting} showToast={showToast} entries={todoEntries}>
                <MeetingDetail
                  entries={entries}
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
