import Navbar from "./Navbar";
import '../styles/layout.css'

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  children,
}) => {
  return (
    <div>
      <main>
        <div className="layout">
          <Navbar/>
          {children}
        </div>
      </main>
    </div>
  )
}



export default Layout;