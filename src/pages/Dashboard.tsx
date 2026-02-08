import "../styles/dashboard.css"
import { useNavigate } from "react-router"
import type { Entry } from "../types/entry"

interface DashboardProps {
  entries: Entry[];
}

const Dashboard: React.FC<DashboardProps> = ({ entries }) => {
  const navigate = useNavigate();

  const formatDateTime = (dateTime: string) => {
    const dateTimeObject = new Date(dateTime);
    return dateTimeObject.toLocaleDateString("en-us", {
      weekday: "short",
      year: '2-digit',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  } 

  const formatDate = (date: string) => {
    const [year, month, day] = date.split('-').map(Number);
    const dateObject = new Date(year, month - 1, day);
    return dateObject.toLocaleDateString("en-us", {
      weekday: "short",
      year: '2-digit',
      month: 'numeric',
      day: 'numeric'
    })
  } 

  const incompleteMeetings = entries
    .filter(i => i.type === 'meeting' && (i.status === 'Not Started' || i.status === 'Started'))
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
  
  const meetingsLength = incompleteMeetings.length;
  
  const incompleteEntries = entries
    .filter(i => i.type === 'alteration' && (i.status === 'Not Started' || i.status === 'Started'))
    .filter(i => {
      const due = new Date(i.due).getTime();
      const future = new Date();
      future.setDate(future.getDate() + 7);
      return due <= future.getTime();
    })
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());;
  
  const entriesLength = incompleteEntries.length;

  
  return (
    <div className="page-container">
      <h1>Dashboard</h1>
      <div className="grid-dashboard">
        <div className="dashboard-column">
          <div className="dashboard-meetings">
            <h2>Upcoming Meetings</h2>
              <div>
                {meetingsLength === 0 ? (
                  <div className="empty-message">
                    No upcoming meetings!
                  </div>
                ) : (
                  <div className="meetings-grid">
                    {incompleteMeetings.map(val => (
                      <>
                        <div>{formatDateTime(val.due)}</div>
                        <div>{val.client}</div>
                        <div>{val.description}</div>
                      </>
                    ))}
                  </div>
                )}
              </div>
            <button
              className="prev-meetings-button"
              onClick={() => navigate("/meetings")}> View Previous Meetings</button>
          </div>
          <div className="dashboard-calendar">
            <h2>Calendar</h2>
              <div className="empty-message">
                The calendar should eventually go here
              </div>
          </div>
        </div>

        <div className="dashboard-column">
          <div className="dashboard-todo">
            <div className="todo-header">
              <h2>To-do</h2>
              <p><i>up to 7 days</i></p>
            </div>
              <div>
                {entriesLength === 0 ? (
                  <div className="empty-message">
                    No upcoming to-dos for the next 7 days!
                  </div>
                  ) : (
                    <div className="todo-grid">
                      {incompleteEntries.map(val => (
                        <div
                          key={val.id}
                          className="todo-row"
                          onClick={() => navigate(`/todo/${val.id}`)}
                        >
                          <div>{formatDate(val.due)}</div>
                          <div>{val.client}</div>
                          <div>{val.description}</div>
                        </div>
                      ))}
                    </div>
                )}
              </div>
            <button
              className="prev-meetings-button"
              onClick={() => navigate("/todo")}> View Full To-do List</button>
          </div>

          <div className="dashboard-money">
            <h2>Money</h2>
            <div className="empty-message">
              A display of profits/client/month should go here
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Dashboard;