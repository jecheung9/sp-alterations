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
    <div className="flex-1">
      <h1 className="text-4xl p-2 font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 items-start">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col box-border" style={{ backgroundColor: "#ECECEC" }}>
            <h2 className="text-2xl p-4 pb-0 font-bold">Upcoming Meetings</h2>
              <div>
                {meetingsLength === 0 ? (
                  <div className="text-2xl text-gray-500 text-center flex items-center justify-center flex-1 py-4">
                    No upcoming meetings!
                  </div>
                ) : (
                  <div className="grid grid-cols-[max-content_max-content_auto] gap-4 p-4">
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
              className="block mr-4 mb-4 ml-auto"
              onClick={() => navigate("/meetings")}> View Previous Meetings</button>
          </div>
          <div className="flex flex-col box-border min-h-[25rem]" style={{ backgroundColor: "#ECECEC" }}>
            <h2 className="text-2xl p-4 pb-0 font-bold">Calendar</h2>
              <div className="text-2xl text-gray-500 text-center flex items-center justify-center flex-1 py-4">
                The calendar should eventually go here
              </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col box-border" style={{ backgroundColor: "#ECECEC" }}>
            <div className="flex items-baseline">
              <h2 className="text-2xl p-4 pb-0 font-bold">To-do</h2>
              <p className="text-gray-500"><i>up to 7 days</i></p>
            </div>
              <div>
                {entriesLength === 0 ? (
                  <div className="text-2xl text-gray-500 text-center flex items-center justify-center flex-1 py-4">
                    No upcoming to-dos for the next 7 days!
                  </div>
                  ) : (
                    <div className="grid grid-cols-[max-content_max-content_auto] py-2">
                      {incompleteEntries.map(val => (
                        <div
                          key={val.id}
                          className="todo-row contents group cursor-pointer"
                          onClick={() => navigate(`/todo/${val.id}`)}
                        >
                          <div className="py-2 pl-4 group-hover:bg-gray-300">{formatDate(val.due)}</div>
                          <div className="py-2 pl-4 group-hover:bg-gray-300">{val.client?.name}</div>
                          <div className="py-2 pl-4 group-hover:bg-gray-300">{val.description}</div>
                        </div>
                      ))}
                    </div>
                )}
              </div>
            <button
              className="block mr-4 mb-4 ml-auto"
              onClick={() => navigate("/todo")}> View Full To-do List</button>
          </div>

          <div className="flex flex-col box-border" style={{ backgroundColor: "#ECECEC" }}>
            <h2 className="text-2xl p-4 pb-0 font-bold">Money</h2>
            <div className="grid grid-cols-4 p-4">
              <div>All-time Total</div>
              <div>{grandTotal}</div>
              <div>{currentYear} total</div>
              <div>{yearTotal}</div>
            </div>
            <div className="flex gap-8">
              <div className="money-grid-column">
                <div className="flex flex-col gap-8 pt-0 p-4">
                  <div>Current Month ({currentMonth}) total: {currentMonthTotal}</div>
                  <div>Current Month Breakdown</div>
                </div>
                  <div className="grid grid-cols-[auto_1fr] gap-4 pt-0 p-4">
                    {clients.map(c => (
                      <>
                        <div>{c}</div>
                        <div>{clientMonthTotals[c]}</div>
                      </>
                    ))}
                  </div>
              </div>

              <div className="money-grid-column">
                <div className="flex flex-col gap-8 pt-0 p-4">
                  <div>Previous Month ({prevMonth}) total: {prevMonthTotal}</div>
                  <div>Previous Month Breakdown</div>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-4 pt-0">
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
              className="block mr-4 mb-4 ml-auto"
              onClick={() => navigate("/money")}> View Money Details</button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Dashboard;