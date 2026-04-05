import { useState } from "react";
import type { Entry } from "../types/entry"
import { useNavigate } from "react-router-dom";

interface MeetingsProps {
  entries: Entry[];
}

const Meetings: React.FC<MeetingsProps> = ({entries}) => {
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  const incompleteMeetings = entries
    .filter(i => i.type === 'meeting' && (i.status === 'Not Started'))
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
  const incompleteLength = incompleteMeetings.length;

  const completeMeetings = entries
    .filter(i => i.type === 'meeting' && (i.status === 'Complete'))
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
  const completeLength = completeMeetings.length;

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

  return (
    <div className="flex-1">
      <h1 className="font-bold text-3xl">Upcoming Meetings ({incompleteLength})</h1>
      {incompleteLength === 0 ? (
        <div className="text-2xl text-gray-500 text-center flex items-center justify-center flex-1 py-4">
          No upcoming meetings!
        </div>
      ) : ( 
      <table className="border-2 border-gray-500 w-full text-xl mb-8 border-collapse table-fixed">
        <thead>
          <tr>
            <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-[5%]">id</th>
            <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-[25%]">Meeting Time</th>
            <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-[25%]">Client</th>
            <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-[45%]">Description</th>
          </tr>
        </thead>
        <tbody>
          {incompleteMeetings.map(val => {
            return (
              <tr
                className="cursor-pointer hover:bg-[#e0e0e0]"
                key={val.id}
                onClick={() => navigate(`/meetings/${val.id}`)}
              >
                <td className="border-r-2 border-gray-500 p-[0.2rem]">{val.id}</td>
                <td className="border-r-2 border-gray-500 p-[0.2rem]">{formatDateTime(val.due)}</td>
                <td className="border-r-2 border-gray-500 p-[0.2rem]">{val.client?.name}</td>
                <td className="border-r-2 border-gray-500 p-[0.2rem] overflow-hidden truncate whitespace-nowrap">{val.description}</td>
              </tr>
            )
          })}
        </tbody>
      </table>  
      )}

      <h1 className="flex gap-4 items-center font-bold text-3xl">
        Completed ({completeLength}) 
        {completeLength > 0 && (
          <button onClick={() => setIsOpen(!isOpen)} className="!p-2 !text-xl">
          {isOpen ? "Collapse" : "Expand"}
          </button>
        )}
      </h1>

      {completeLength === 0 ? (
        <div className="text-2xl text-gray-500 text-center flex items-center justify-center flex-1 py-4">
          No completed meetings yet!
        </div>
      ) : (
        isOpen && (
        <table className="border-2 border-gray-500 w-full text-xl mb-8 border-collapse table-fixed">
          <thead>
            <tr>
              <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-[5%]">id</th>
              <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-[25%]">Meeting Time</th>
              <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-[25%]">Client</th>
              <th className="border-b border-black text-left border-r-2 border-gray-500 p-[0.2rem] w-[45%]">Description</th>
            </tr>
          </thead>
          <tbody>
            {completeMeetings.map(val => {
              return (
                <tr
                  className="cursor-pointer hover:bg-[#e0e0e0]"
                  key={val.id}
                  onClick={() => navigate(`/meetings/${val.id}`)}
                >
                  <td className="border-r-2 border-gray-500 p-[0.2rem]">{val.id}</td>
                  <td className="border-r-2 border-gray-500 p-[0.2rem]">{formatDateTime(val.due)}</td>
                  <td className="border-r-2 border-gray-500 p-[0.2rem]">{val.client?.name}</td>
                  <td className="border-r-2 border-gray-500 p-[0.2rem] overflow-hidden truncate whitespace-nowrap">{val.description}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        )
      )}
    </div>
  )
}

export default Meetings;