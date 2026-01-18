import { useState } from "react";
import Navbar from "./Navbar";
import '../styles/layout.css'
import AddForm from "./AddForm";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  children,
}) => {

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);


  return (
    <div>
      <main>
        <div className="layout">
          <Navbar onOpen={() => setIsAddFormOpen(true)}/>
          {children}
          {isAddFormOpen && (
            <AddForm onClose={() => setIsAddFormOpen(false)}/>
          )}
        </div>
      </main>
    </div>
  )
}



export default Layout;