import "../styles/todo.css"
import { useState } from "react";
import type { Entry } from "../types/entry";

interface TodoProps {
  entries: Entry[];
}

const ToDo: React.FC<TodoProps> = ({ entries }) => {
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <div className="page-container">
      <h1>To-Do ({incompleteLength})</h1>
      <table className="todo-table">
        <tr>
          <th className="table-id">id</th>
          <th className="table-date">Due Date</th>
          <th className="table-status">Status</th>
          <th className="table-client">Client</th>
          <th className="table-price">Price</th>
          <th className="table-description">Description</th>
        </tr>
        {incompleteEntries.map((val, key) => {
          return (
            <tr key={key}>
              <td>{val.id}</td>
              <td>{formatDate(val.due)}</td>
              <td className={
                val.status === "Not Started" ? "not-started" :
                val.status === "Started" ? "started" :
                val.status === "Complete" ? "complete" :
                val.status === "Dropped Off" ? "dropped-off" :
                ""}>{val.status}</td>
              <td>{val.client}</td>
              <td>{val.price}</td>
              <td className="row-description">{val.description}</td>
            </tr>
          )
        })}
      </table>

      <h1>Completed - Not Delivered ({completeLength})</h1>
      <table className="todo-table">
        <tr>
          <th className="table-id">id</th>
          <th className="table-date">Due Date</th>
          <th className="table-status">Status</th>
          <th className="table-client">Client</th>
          <th className="table-price">Price</th>
          <th className="table-description">Description</th>
        </tr>
        {completeEntries.map((val, key) => {
          return (
            <tr key={key}>
              <td>{val.id}</td>
              <td>{formatDate(val.due)}</td>
              <td className={
                val.status === "Not Started" ? "not-started" :
                val.status === "Started" ? "started" :
                val.status === "Complete" ? "complete" :
                val.status === "Dropped Off" ? "dropped-off" :
                ""}>
              {val.status}</td>
              <td>{val.client}</td>
              <td>{val.price}</td>
              <td className="row-description">{val.description}</td>
            </tr>
          )
        })}
      </table>
      <h1 className="completed-header">
        Completed - Dropped Off ({deliveredLength}) 
        <button onClick={() => setIsOpen(!isOpen)} className="expand-button">
          {isOpen ? "Collapse" : "Expand"}
        </button>
      </h1>
      {isOpen &&
        <table className="todo-table">
          <tr>
            <th className="table-id">id</th>
            <th className="table-date">Due Date</th>
            <th className="table-status">Status</th>
            <th className="table-client">Client</th>
            <th className="table-price">Price</th>
            <th className="table-description">Description</th>
          </tr>
          {deliveredEntries.map((val, key) => {
            return (
              <tr key={key}>
                <td>{val.id}</td>
                <td>{formatDate(val.due)}</td>
                <td className={
                val.status === "Not Started" ? "not-started" :
                val.status === "Started" ? "started" :
                val.status === "Complete" ? "complete" :
                ""}>{val.status}</td>
                <td>{val.client}</td>
                <td>{val.price}</td>
                <td className="row-description">{val.description}</td>
              </tr>
            )
          })}
        </table>
      }
    </div>
  )
}

export default ToDo;