import "../styles/meetings.css"
import { useState } from "react";
import type { Entry } from "../types/entry"
import { useNavigate } from "react-router";

interface MeetingsProps {
  entries: Entry[];
}

const Meetings: React.FC<MeetingsProps> = ({entries}) => {
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  const incompleteMeetings = entries
    .filter(i => i.type === 'meeting' && (i.status === 'Not Started' || i.status === 'Started'))
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
    <div className="page-container">
      <h1>Upcoming Meetings ({incompleteLength})</h1>
      {incompleteLength === 0 ? (
        <div className="empty-message">
          No upcoming meetings!
        </div>
      ) : ( 
      <table className="meetings-table">
        <thead>
          <tr>
            <th className="table-id">id</th>
            <th className="table-date">Meeting Time</th>
            <th className="table-client">Client</th>
            <th className="table-description">Description</th>
          </tr>
        </thead>
        <tbody>
          {incompleteMeetings.map(val => {
            return (
              <tr
                key={val.id}
                onClick={() => navigate(`/meetings/${val.id}`)}
              >
                <td>{val.id}</td>
                <td>{formatDateTime(val.due)}</td>
                <td>{val.client?.name}</td>
                <td className="row-description">{val.description}</td>
              </tr>
            )
          })}
        </tbody>
      </table>  
      )}

      <h1 className="completed-header">
        Completed ({completeLength}) 
        {completeLength > 0 && (
          <button onClick={() => setIsOpen(!isOpen)} className="expand-button">
          {isOpen ? "Collapse" : "Expand"}
          </button>
        )}
      </h1>

      {completeLength === 0 ? (
        <div className="empty-message">
          No completed meetings yet!
        </div>
      ) : (
        isOpen && (
        <table className="meetings-table">
          <thead>
            <tr>
              <th className="table-id">id</th>
              <th className="table-date">Due Date</th>
              <th className="table-client">Client</th>
              <th className="table-description">Description</th>
            </tr>
          </thead>
          <tbody>
            {completeMeetings.map(val => {
              return (
                <tr
                  key={val.id}
                  onClick={() => navigate(`/meetings/${val.id}`)}
                >
                  <td>{val.id}</td>
                  <td>{formatDateTime(val.due)}</td>
                  <td>{val.client?.name}</td>
                  <td className="row-description">{val.description}</td>
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