import { Link } from "react-router-dom"

const NotFound = () => {
  return (
    <div className="page-container">
      <h1> Alterations Dashboard Page Not Found</h1>
      <Link to="/">Back To Dashboard</Link>
    </div>
  )
}

export default NotFound