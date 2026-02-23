import React from "react";
import { useState } from "react";
import Navbar from "./Navbar";
import '../styles/layout.css'
import AddForm from "./AddForm";
import type { Client } from "../types/client";

interface LayoutProps {
  children: React.ReactNode;
  addTodo: (entry: {
    due: string;
    client: Client;
    price?: number;
    description: string;
  }) => void;
  addMeeting: (entry: {
    due: string;
    client: Client;
    description: string;
  }) => Promise<any>;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  addTodo,
  addMeeting
}) => {

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  return (
    <div>
      <main>
        <div className="layout">
          <Navbar onOpen={() => setIsAddFormOpen(true)}/>
          {children}
          {isAddFormOpen && (
            <AddForm
              onClose={() => setIsAddFormOpen(false)}
              onAddEntry={async (entry) => {
                if (entry.type === "meeting" && entry.client) {
                  await addMeeting({
                    due: entry.due,
                    client: entry.client,
                    description: entry.description,
                  });
                } else {
                  addTodo(entry)
                }
              }

              } />
          )}
        </div>
      </main>
    </div>
  )
}



export default Layout;