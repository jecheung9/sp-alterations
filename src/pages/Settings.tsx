import { useEffect, useState } from "react";
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
      <h1 className="text-3xl p-2 font-bold">Settings/Manage</h1>
        <div className="min-w-[30vw] bg-[#ECECEC] box-border flex flex-col gap-4 pb-4">
          <h2 className="p-4 pb-0 text-xl p-2 font-bold"> Manage Clients</h2>
          <form
            className="flex w-full items-stretch gap-4 h-8"
            onSubmit={(e) => {
              e.preventDefault();
              addClient();
            }}  
            >
          <input
            className="flex-1 p-2 text-base m-0 ml-4 rounded-md border"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Add a client"
            />
            <button type="submit" className="!px-3 !mr-4">Add</button>
          </form>
          
          {clients.length === 0 && <p className="text-gray-500 ml-4">No clients yet. Add some!</p>}
          {clients.map(client => (
            <div key={client._id} className="flex gap-4 items-center ml-4">
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