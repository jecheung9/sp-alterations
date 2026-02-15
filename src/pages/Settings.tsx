import { useEffect, useState } from "react";
import '../styles/settings.css';
import type { Client } from "../types/client.ts";


const Settings = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await fetch("http://localhost:3000/api/clients");
        const data = await res.json();

        setClients(data);

      } catch (err) {
        console.error("Error loading clients:", err);
      }
    }

    loadClients();
  }, []);



  const addClient = async () => {
    if (!input.trim()) {
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: input })
      });

      const newClient = await res.json();
      setClients(prev => [...prev, newClient]);
      setInput("");
    } catch (err) {
      console.error("Error adding client:", err);
    }
  }

  const removeClient = async (_id: string) => {
    try {
      await fetch(`http://localhost:3000/api/clients/${_id}`, {
        method: "DELETE",
      });
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
          
          {clients.length === 0 && <p>No clients yet. Add some!</p>}
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