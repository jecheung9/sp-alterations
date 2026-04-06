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
    <div className="flex-1">
      <h1 className="text-4xl p-2 pl-0 font-bold">Money</h1>
      <h2 className="text-xl p-2 pl-0 font-bold">Summary (profits/incomplete combined)</h2>
      <table className="border-2 border-gray-500 w-full text-xl mb-8 border-collapse table-fixed">
        <thead>
          <tr>
            <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem]">Year</th>
              {clients.map(client => <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem]">{client}</th>)}
            <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem]">Total</th>
          </tr>
        </thead>
        <tbody>
          {yearlyData.map(y => (
            <tr>
              <td className="border-r-2 border-gray-500 p-[0.2rem]">{y.year}</td>
                {clients.map(client => <td className="border-r-2 border-gray-500 p-[0.2rem]">{y.clientTotals[client]}</td>)}
              <td className="border-r-2 border-gray-500 p-[0.2rem]"><b>{y.total}</b></td>
            </tr>
          ))}
          <tr>
            <td className="border-r-2 border-gray-500 p-[0.2rem]"><b>Total</b></td>
              {clients.map(client => <td className="border-r-2 border-gray-500 p-[0.2rem]"><b>{columnTotals[client]}</b></td>)}
            <td className="border-r-2 border-gray-500 p-[0.2rem]"><b>{grandTotal}</b></td>
          </tr>
        </tbody>
      </table>


      {monthlyData.map(e => (
        <div>
          <h2 className="text-xl p-2 pl-0 font-bold">{e.month}</h2>
          <table className="border-2 border-gray-500 w-full text-xl mb-8 border-collapse table-fixed">
            <thead>
              <tr>
                <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem]">Client</th>
                <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem]">Profit</th>
                <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem]">Incomplete</th>
                <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem]">Total</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr>
                  <td className="border-r-2 border-gray-500 p-[0.2rem]">{client}</td>
                  <td className="border-r-2 border-gray-500 p-[0.2rem]">{e.clientTotals[client].completed}</td>
                  <td className="border-r-2 border-gray-500 p-[0.2rem]">{e.clientTotals[client].incomplete}</td>
                  <td className="border-r-2 border-gray-500 p-[0.2rem]">{e.clientTotals[client].completed + e.clientTotals[client].incomplete}</td>
                </tr>
              ))}
              <tr>
                <td className="border-r-2 border-gray-500 p-[0.2rem]"><b>Total</b></td>
                <td className="border-r-2 border-gray-500 p-[0.2rem]"><b>{e.totals.completed}</b></td>
                <td className="border-r-2 border-gray-500 p-[0.2rem]"><b>{e.totals.incomplete}</b></td>
                <td className="border-r-2 border-gray-500 p-[0.2rem]"><b>{e.totals.grandMonth}</b></td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
};

export default Money;