import "../styles/meetings.css"
import { useState } from "react";
import type { Entry } from "../types/entry"

interface MeetingsProps {
  entries: Entry[];
}

const Meetings: React.FC<MeetingsProps> = ({entries}) => {
  const [isOpen, setIsOpen] = useState(false);

  const incompleteMeetings = entries
    .filter(i => i.type === 'meeting' && i.completed === false)
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
  const incompleteLength = incompleteMeetings.length;

  const completeMeetings = entries
    .filter(i => i.type === 'meeting' && i.completed === true)
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
    <div className="page-container">
      <h1>Upcoming Meetings ({incompleteLength})</h1>
      <table>
        <tr>
          <th className="table-date">Meeting Time</th>
          <th className="table-client">Client</th>
          <th className="table-description">Description</th>
        </tr>
        {incompleteMeetings.map((val, key) => {
          return (
            <tr key={key}>
              <td>{formatDateTime(val.due)}</td>
              <td>{val.client}</td>
              <td className="row-description">{val.description}</td>
            </tr>
          )
        })}
      </table>
      <h1 className="completed-header">
        Completed ({completeLength}) 
        <button onClick={() => setIsOpen(!isOpen)} className="expand-button">
          {isOpen ? "Collapse" : "Expand"}
        </button>
      </h1>
      {isOpen &&
        <table>
          <tr>
            <th className="table-date">Due Date</th>
            <th className="table-client">Client</th>
            <th className="table-description">Description</th>
          </tr>
          {completeMeetings.map((val, key) => {
            return (
              <tr key={key}>
                <td>{formatDateTime(val.due)}</td>
                <td>{val.client}</td>
                <td className="row-description">{val.description}</td>
              </tr>
            )
          })}
        </table>
      }
    </div>
  )
}

export default Meetings;