import "../styles/dashboard.css"
import { useNavigate } from "react-router-dom"
import type { Entry } from "../types/entry"

interface DashboardProps {
  entries: Entry[];
}

const Dashboard: React.FC<DashboardProps> = ({
  entries
}) => {

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

  
  let grandTotal = 0;
  entries.forEach(entry => {
    grandTotal += entry.price || 0;
  })

  const now = new Date();
  const currentYear = now.getFullYear();

  let yearTotal = 0;
  entries.forEach(entry => {
    const entryYear = new Date(entry.due).getFullYear();
    if (entryYear === currentYear) {
      yearTotal += entry.price || 0;
    }
  });

  const getMonth = () =>
  new Date(now).toLocaleString("en-US", {
    month: "long",
    year: "numeric"
  });
  const currentMonth = getMonth();

  let currentMonthTotal = 0;
  entries.forEach(entry => {
  const entryMonth = new Date(entry.due).toLocaleString("en-US", {
    month: "long",
    year: "numeric"
    });
    if (entryMonth === currentMonth) {
      currentMonthTotal += entry.price || 0;
    }
  });

  const clientMonthTotals: Record<string, number> = {};
  const clients = [...new Set(entries.map(e => e.client?.name))];
  clients.forEach(client => clientMonthTotals[client] = 0);
  entries.forEach(entry => {
    const entryMonth = new Date(entry.due).toLocaleString("en-US", {
      month: "long",
      year: "numeric"
    });
    const clientName = entry.client?.name;
    if (entryMonth === currentMonth && clientName) {
      clientMonthTotals[clientName] += entry.price || 0;
    }
  });

  const prevMonthFirst = new Date(currentYear, now.getMonth() - 1, 1);
  const prevMonth = prevMonthFirst.toLocaleString("en-US", {
      month: "long",
      year: "numeric"
  });
  
  let prevMonthTotal = 0;
  const prevMonthClientTotals: Record<string, number> = {};
  clients.forEach(client => prevMonthClientTotals[client] = 0);

  entries.forEach(entry => {
    const entryMonth = new Date(entry.due).toLocaleString("en-US", {
      month: "long",
      year: "numeric"
    });
    const clientName = entry.client?.name;
    if (entryMonth === prevMonth) {
      prevMonthClientTotals[clientName] += entry.price || 0;
      prevMonthTotal += entry.price || 0;
    }

  });


  
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
                        <div>{val.client?.name}</div>
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
                          <div>{val.client?.name}</div>
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
            <div className="money-grid">
              <div>All-time Total</div>
              <div>{grandTotal}</div>
              <div>{currentYear} total</div>
              <div>{yearTotal}</div>
            </div>
            <div className="money-grid-side">
              <div className="money-grid-column">
                <div className="money-grid-2">
                  <div>Current Month ({currentMonth}) total: {currentMonthTotal}</div>
                  <div>Current Month Breakdown</div>
                </div>
                  <div className="money-grid-3">
                    {clients.map(c => (
                      <>
                        <div>{c}</div>
                        <div>{clientMonthTotals[c]}</div>
                      </>
                    ))}
                  </div>
              </div>

              <div className="money-grid-column">
                <div className="money-grid-2">
                  <div>Previous Month ({prevMonth}) total: {prevMonthTotal}</div>
                  <div>Previous Month Breakdown</div>
                </div>
                <div className="money-grid-3">
                  {clients.map(c => (
                    <>
                      <div></div>
                      <div>{prevMonthClientTotals[c]}</div>
                    </>
                  ))}
                </div>
              </div>
            
            </div>
              <button
              className="prev-meetings-button"
              onClick={() => navigate("/money")}> View Money Details</button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Dashboard;