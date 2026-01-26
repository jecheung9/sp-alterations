import Layout from "../components/Layout";
import "../styles/todo.css"
import { useState } from "react";
import { todoData } from "../mockdata/todo";



const ToDo = () => {
  const [isOpen, setIsOpen] = useState(false);

  const incompleteEntries = todoData
    .filter(i => i.completed === false)
    .sort((a, b) => new Date(a.duedate).getTime() - new Date(b.duedate).getTime());
  const incompleteLength = incompleteEntries.length;

  const completeEntries = todoData
    .filter(i => i.completed === true)
    .sort((a, b) => new Date(a.duedate).getTime() - new Date(b.duedate).getTime());
  const completeLength = completeEntries.length;

  const formatDate = (date: string) => {
    const dateObject = new Date(date);
    return dateObject.toLocaleDateString("en-us", {
      weekday: "short",
      year: '2-digit',
      month: 'numeric',
      day: 'numeric'
    })
  } 

  return (
    <Layout>
      <div className="page-container">
        <h1>To-Do ({incompleteLength})</h1>
        <table>
          <tr>
            <th className="table-id">id</th>
            <th className="table-date">Due Date</th>
            <th className="table-client">Client</th>
            <th className="table-price">Price</th>
            <th className="table-description">Description</th>
          </tr>
          {incompleteEntries.map((val, key) => {
            return (
              <tr key={key}>
                <td>{val.id}</td>
                <td>{formatDate(val.duedate)}</td>
                <td>{val.client}</td>
                <td>{val.price}</td>
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
              <th className="table-id">id</th>
              <th className="table-date">Due Date</th>
              <th className="table-client">Client</th>
              <th className="table-price">Price</th>
              <th className="table-description">Description</th>
            </tr>
            {completeEntries.map((val, key) => {
              return (
                <tr key={key}>
                  <td>{val.id}</td>
                  <td>{formatDate(val.duedate)}</td>
                  <td>{val.client}</td>
                  <td>{val.price}</td>
                  <td className="row-description">{val.description}</td>
                </tr>
              )
            })}
          </table>
        }
      </div>
    </Layout>
  )
}

export default ToDo;