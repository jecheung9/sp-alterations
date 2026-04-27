import React from "react";
import { useState } from "react";
import Navbar from "./Navbar";
import AddForm from "./AddForm";
import type { Client } from "../types/client";
import { useLocation } from "react-router-dom";

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
  showToast: (message: string, type?: "default" | "delete") => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  addTodo,
  addMeeting,
  showToast,
}) => {

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const location = useLocation();

  let pageMode: "alteration" | "meeting";
  if (location.pathname.startsWith("/meetings")) {
    pageMode = "meeting"
  } else {
    pageMode = "alteration";
  }

  return (
    <div>
      <main>
        <div className="flex flex-col sm:flex-row sm:gap-4">
          <Navbar onOpen={() => setIsAddFormOpen(true)}/>
          {children}
          {isAddFormOpen && (
            <AddForm
              initialMode={pageMode}
              onClose={() => setIsAddFormOpen(false)}
              onAddEntry={async (entry) => {
                if (entry.type === "meeting" && entry.client) {
                  await addMeeting({
                    due: entry.due,
                    client: entry.client,
                    description: entry.description,
                  });
                  showToast("Meeting added successfully!", "default");
                } else {
                  addTodo(entry)
                  showToast("Alteration todo added successfully!", "default");
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