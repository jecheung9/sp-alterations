import { useEffect, useState } from "react";
import '../styles/settings.css';
import type { Client } from "../types/client.ts";
import { useAuth } from "../context/AuthProvider.tsx";
import { FetchHelper } from "../utils/Fetch.tsx";
import { useNavigate } from "react-router";


const Settings = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [input, setInput] = useState("");
  const { token, onLogout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await FetchHelper("http://localhost:3000/api/clients", {}, token, onLogout, navigate);
        if (!res) {
          return;
        }
        const data = await res.json();

        setClients(data);

      } catch (err) {
        console.error("Error loading clients:", err);
      }
    }

    if (token) {
      loadClients();
    }
  }, [token]);



  const addClient = async () => {
    if (!input.trim()) {
      return;
    }
    try {
      const res = await FetchHelper("http://localhost:3000/api/clients",
        {
          method: "POST",
          body: JSON.stringify({ name: input })
        },
        token,
        onLogout,
        navigate
      );
      if (!res) {
        return;
      }
      const newClient = await res.json();
      setClients(prev => [...prev, newClient]);
      setInput("");
    } catch (err) {
      console.error("Error adding client:", err);
    }
  }

  const removeClient = async (_id: string) => {
    try {
      await FetchHelper(`http://localhost:3000/api/clients/${_id}`, {method: "DELETE"}, token, onLogout, navigate);
      setClients(prev => prev.filter(c => c._id !== _id));
    } catch (err) {
      console.error("Error deleting client:", err);
    }
  }

  return (
    <div>
      <h1>Settings/Manage</h1>
        <div className="manage-clients">
          <h2> Manage Clients</h2>
          <form
            className="add-client-row"
            onSubmit={(e) => {
              e.preventDefault();
              addClient();
            }}  
            >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Add a client"
            />
            <button type="submit">Add</button>
          </form>
          
          {clients.length === 0 && <p className="text-gray-500">No clients yet. Add some!</p>}
          {clients.map(client => (
            <div key={client._id} className="client-row">
              <button
                onClick={() => removeClient(client._id)}
              >✕</button>
              {client.name}
            </div>
          ))}
        </div> 
    </div>
  )
}

export default Settings;