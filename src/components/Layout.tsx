import React from "react";
import { useState } from "react";
import Navbar from "./Navbar";
import '../styles/layout.css'
import AddForm from "./AddForm";

interface LayoutProps {
  children: React.ReactNode;
  addTodoEntry: (entry: { duedate: string; client: string; price: number; description: string }) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  addTodoEntry,
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
              onAddEntry={addTodoEntry} />
          )}
        </div>
      </main>
    </div>
  )
}



export default Layout;