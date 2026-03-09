import type { Entry } from "../types/entry";

interface MoneyProps {
  entries: Entry[];
}

const Money: React.FC<MoneyProps> = ({ entries }) => {
  const getMonth = (date: string) =>
    new Date(date).toLocaleString("en-US", {
      month: "long",
      year: "numeric"
    });

  const getYear = (date: string) => new Date(date).getFullYear();

  const clients = [...new Set(entries.map(e => e.client?.name))]; //unique list of clients

  const months = [...new Set(entries.map(e => getMonth(e.due)))].sort((a, b) => { //sort month descending
    const dateA = new Date(entries.find(e => getMonth(e.due) === a)!.due);
    const dateB = new Date(entries.find(e => getMonth(e.due) === b)!.due);
    return dateB.getTime() - dateA.getTime();
  });

  const monthlyData = months.map(month => {
    const monthEntries = entries.filter(e => getMonth(e.due) === month);

    const clientTotals: Record<string, any> = {};
    clients.forEach(client => { //each client has a complete/incomplete, initlaization
      clientTotals[client] = { completed: 0, incomplete: 0 };
    });

    let completedTotal = 0;
    let incompleteTotal = 0;

    monthEntries.forEach(entry => { //each month math
      const client = entry.client?.name;
      if (entry.status === "Dropped Off" || entry.status === "Complete") {
        clientTotals[client].completed += entry.price || 0;
        completedTotal += entry.price || 0;
      } else {
        clientTotals[client].incomplete += entry.price || 0;
        incompleteTotal += entry.price || 0;
      }
    });

    return {
      month,
      clientTotals,
      totals: { completed: completedTotal, incomplete: incompleteTotal, grandMonth: completedTotal + incompleteTotal }
    };
  });

  const years = [...new Set(entries.map(e => getYear(e.due)))].sort((a, b) => b - a);

  const yearlyData = years.map(year => {
    const yearEntries = entries.filter(e => getYear(e.due) === year);
    const clientTotals: Record<string, number> = {}; //array to hold each clients total
    let yearlyTotal = 0;

    clients.forEach(client => {
      clientTotals[client] = 0;
    });

    yearEntries.forEach(entry => {
      const client = entry.client?.name;
      const price = entry.price || 0;
      clientTotals[client] += price;
      yearlyTotal += price;
    });

    return { year, clientTotals, total: yearlyTotal };
  });

  //last row for summary
  const columnTotals: Record<string, number> = {};
  clients.forEach(client => columnTotals[client] = 0);
  let grandTotal = 0;
  entries.forEach(entry => {
    const client = entry.client?.name;
    const price = entry.price || 0;
    columnTotals[client] += price;
    grandTotal += price;
  });


  return (
    <div className="page-container">
      <h1>Money</h1>
      <h2>Summary (profits/incomplete combined)</h2>
      <table className="todo-table">
        <thead>
          <tr>
            <th>Year</th>
              {clients.map(client => <th>{client}</th>)}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {yearlyData.map(y => (
            <tr>
              <td>{y.year}</td>
                {clients.map(client => <td>{y.clientTotals[client]}</td>)}
              <td><b>{y.total}</b></td>
            </tr>
          ))}
          <tr>
            <td><b>Total</b></td>
              {clients.map(client => <td><b>{columnTotals[client]}</b></td>)}
            <td><b>{grandTotal}</b></td>
          </tr>
        </tbody>
      </table>


      {monthlyData.map(e => (
        <div>
          <h2>{e.month}</h2>
          <table className="todo-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Profit</th>
                <th>Incomplete</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr>
                  <td>{client}</td>
                  <td>{e.clientTotals[client].completed}</td>
                  <td>{e.clientTotals[client].incomplete}</td>
                  <td>{e.clientTotals[client].completed + e.clientTotals[client].incomplete}</td>
                </tr>
              ))}
              <tr>
                <td><b>Total</b></td>
                <td><b>{e.totals.completed}</b></td>
                <td><b>{e.totals.incomplete}</b></td>
                <td><b>{e.totals.grandMonth}</b></td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
};

export default Money;