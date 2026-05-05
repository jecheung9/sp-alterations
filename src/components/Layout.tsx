import React from "react";
import { useState } from "react";
import Navbar from "./Navbar";
import AddForm from "./AddForm";
import { useLocation } from "react-router-dom";
import type { NewAlterationEntry, MeetingEntry } from "../types/entry";

interface LayoutProps {
  children: React.ReactNode;
  addTodo: (entry: NewAlterationEntry) => void;
  addMeeting: (entry: MeetingEntry) => Promise<any>;
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
                if (entry.type === "meeting") {
                  await addMeeting(entry as MeetingEntry);
                  showToast(
                    entry.meetingType === "pickup"
                      ? "Pickup meeting added successfully!"
                      : "Drop-off meeting added successfully!",
                    "default"
                  );

                  return;
                }
                addTodo(entry);
                showToast("Alteration added successfully!", "default");
              }}
            />
          )}
        </div>
      </main>
    </div>
  )
}



export default Layout;