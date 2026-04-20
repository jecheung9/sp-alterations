import { useState } from "react";
import type { Entry } from "../types/entry";
import { useNavigate } from "react-router-dom";
import AddForm from "../components/AddForm";
import type { Client } from "../types/client";

interface TodoProps {
  entries: Entry[];
  addTodo: (entry: {
    due: string;
    client: Client;
    price?: number;
    description: string;
}) => void;
}

const ToDo: React.FC<TodoProps> = ({
  entries,
  addTodo

 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const navigate = useNavigate();

  const incompleteEntries = entries
    .filter(i => i.type === 'alteration' && (i.status === 'Not Started' || i.status === 'Started'))
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
  const incompleteLength = incompleteEntries.length;

  const completeEntries = entries
    .filter(i => i.type === 'alteration' && i.status === 'Complete')
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
  const completeLength = completeEntries.length;

  const deliveredEntries = entries
    .filter(i => i.type === 'alteration' && i.status === "Dropped Off")
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
  const deliveredLength = deliveredEntries.length;

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

  const isLate = (entry: Entry) => {
    const today = new Date(); //ignore time for todos
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = entry.due.split("-").map(Number);
    const dueDate = new Date(year, month - 1, day);

    return (
      (dueDate < today) && (entry.status === "Not Started" || entry.status === "Started")
    );
  }

  return (
    <div className="flex-1">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-3xl"> To-Do ({incompleteLength})</h1>
        <button className="!text-2xl !font-bold"
          onClick={() => setIsAddOpen(true)}>
          + Add Todo
        </button>
      </div>

      {isAddOpen && (
        <AddForm
          onClose={() => setIsAddOpen(false)}
          onAddEntry={(entry) => {
            addTodo(entry)
            setIsAddOpen(false);
          }}
        />
      )}

        {incompleteLength === 0 ? (
        <div className="text-2xl text-gray-500 text-center flex items-center justify-center flex-1 py-4">
          No upcoming to-dos!
        </div>
        ) : (
        <table className="border-2 border-gray-500 w-full text-xl mb-8 border-collapse table-fixed">
          <thead>
            <tr>
              <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-[5%]">id</th>
              <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-[15%]">Due Date</th>
              <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-[13%]">Status</th>
              <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-[25%]">Client</th>
              <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-[7.5%]">Price</th>
              <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-auto">Description</th>
            </tr>
          </thead>
          <tbody>
            {incompleteEntries.map(val => (
              <tr
                className="cursor-pointer hover:bg-[#e0e0e0]"
                key={val.id}
                onClick={() => navigate(`/todo/${val.id}`)}
              >
                <td className="border-r-2 border-gray-500 p-[0.2rem]">{val.id}</td>
                <td className={`border-r-2 border-gray-500 p-[0.2rem]
                 ${isLate(val) ? "text-red-600 font-bold" : ""}`}>
                  {formatDate(val.due)}
                </td>
                <td className={`border-r-2 border-gray-500 p-[0.2rem] 
                  ${val.status === "Not Started" ? "bg-[#e74c3c] text-white" : ""}
                  ${val.status === "Started" ? "bg-[#f1c40f]" : ""}
                  ${val.status === "Complete" ? "bg-[#2ecc71] text-white" : ""}
                  `}
                >{val.status}</td>
                <td className="border-r-2 border-gray-500 p-[0.2rem]">{val.client?.name}</td>
                <td className="border-r-2 border-gray-500 p-[0.2rem]">{val.price}</td>
                <td className="border-r-2 border-gray-500 p-[0.2rem] overflow-hidden truncate whitespace-nowrap">{val.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        )}

      
        <h1 className="font-bold text-3xl">Completed - Not Delivered ({completeLength})</h1>
        {completeLength === 0 ? (
          <div className="text-2xl text-gray-500 text-center flex items-center justify-center flex-1 py-4">
            No completed items yet!
          </div>
        ) : (
          <table className="border-2 border-gray-500 w-full text-xl mb-8 border-collapse table-fixed">
            <thead>
              <tr>
                <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-[5%]">id</th>
                <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-[15%]">Due Date</th>
                <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-[13%]">Status</th>
                <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-[25%]">Client</th>
                <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-[7.5%]">Price</th>
                <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-auto">Description</th>
              </tr>
            </thead>
            <tbody>
              {completeEntries.map(val => (
                <tr
                  className="cursor-pointer hover:bg-[#e0e0e0]"
                  key={val.id}
                  onClick={() => navigate(`/todo/${val.id}`)}
                >
                  <td className="border-r-2 border-gray-500 p-[0.2rem]">{val.id}</td>
                  <td className="border-r-2 border-gray-500 p-[0.2rem]">{formatDate(val.due)}</td>
                  <td className={`border-r-2 border-gray-500 p-[0.2rem] 
                    ${val.status === "Not Started" ? "bg-[#e74c3c] text-white" : ""}
                    ${val.status === "Started" ? "bg-[#f1c40f]" : ""}
                    ${val.status === "Complete" ? "bg-[#2ecc71] text-white" : ""}
                    `}
                  >{val.status}</td>
                  <td className="border-r-2 border-gray-500 p-[0.2rem]">{val.client?.name}</td>
                  <td className="border-r-2 border-gray-500 p-[0.2rem]">{val.price}</td>
                  <td className="border-r-2 border-gray-500 p-[0.2rem] overflow-hidden truncate whitespace-nowrap">{val.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}


        <h1 className="flex gap-4 items-center font-bold text-3xl">
          Completed - Dropped Off ({deliveredLength}) 
          {deliveredLength > 0 && (
            <button onClick={() => setIsOpen(!isOpen)} className="!p-2 !text-xl">
              {isOpen ? "Collapse" : "Expand"}
            </button>
          )}
        </h1>

          {deliveredLength === 0 ? (
            <div className="text-2xl text-gray-500 text-center flex items-center justify-center flex-1 py-4">
              No completed and dropped off items yet!
            </div>
          ) : (
            isOpen && (
              <table className="border-2 border-gray-500 w-full text-xl mb-8 border-collapse table-fixed">
                <thead>
                  <tr>
                    <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-[5%]">id</th>
                    <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-[15%]">Due Date</th>
                    <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-[13%]">Status</th>
                    <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-[25%]">Client</th>
                    <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-[7.5%]">Price</th>
                    <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-auto">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveredEntries.map(val => (
                    <tr
                      className="cursor-pointer hover:bg-[#e0e0e0]"
                      key={val.id}
                      onClick={() => navigate(`/todo/${val.id}`)}
                    >
                      <td className="border-r-2 border-gray-500 p-[0.2rem]">{val.id}</td>
                      <td className="border-r-2 border-gray-500 p-[0.2rem]">{formatDate(val.due)}</td>
                      <td className={`border-r-2 border-gray-500 p-[0.2rem] 
                        ${val.status === "Not Started" ? "bg-[#e74c3c] text-white" : ""}
                        ${val.status === "Started" ? "bg-[#f1c40f]" : ""}
                        ${val.status === "Complete" ? "bg-[#2ecc71] text-white" : ""}
                        `}
                      >{val.status}</td>
                      <td className="border-r-2 border-gray-500 p-[0.2rem]">{val.client?.name}</td>
                      <td className="border-r-2 border-gray-500 p-[0.2rem]">{val.price}</td>
                      <td className="border-r-2 border-gray-500 p-[0.2rem] overflow-hidden truncate whitespace-nowrap">{val.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

    </div>
  )
}

export default ToDo;