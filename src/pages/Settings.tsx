import Layout from "../components/Layout"
import { useState } from "react";
import '../styles/settings.css';
import type { Client } from "../mockdata/clients";
import { clientsData } from "../mockdata/clients";



const Settings = () => {
  const [clients, setClients] = useState<Client[]>(clientsData);
  const [input, setInput] = useState("");

  const addClient = () => {
    if (!input.trim()) {
      return;
    }
    setClients(prev => [...prev, { id: Date.now(), name: input }]);
    setInput("");
  }

  const removeClient = (id: number) => {
    setClients(prev => prev.filter(c => c.id !== id));
  }

  return (
  <Layout>
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
            <div key={client.id} className="client-row">
              <button onClick={() => removeClient(client.id)}>✕</button>
              {client.name}
            </div>
          ))}
        </div> 
    </div>

  </Layout>
  )
}

export default Settings;