import Layout from "../components/Layout";
import "../styles/todo.css"
import { useState } from "react";

const data = [
  { id: 1, duedate: "2026-01-28", client: "Hall Madden", price: "16", completed: false, description: "Alex D gray suit -0.5 sleeve" },
  { id: 2, duedate: "2026-01-30", client: "Benny - B&B Menswear", price: "60", completed: false, description: "pants +0.5 length -1 waist" },
  { id: 3, duedate: "2026-01-28", client: "Catherine - 11th State", price: "75", completed: false, description: "some very long description to test truncation asdfasdfasfadsfasdfdsa" },
  { id: 4, duedate: "2026-01-28", client: "A.P.C", price: "17", completed: true }
]

const ToDo = () => {
  const [isOpen, setIsOpen] = useState(false);

  const incompleteEntries = data
    .filter(i => i.completed === false)
    .sort((a, b) => new Date(a.duedate).getTime() - new Date(b.duedate).getTime());
  const incompleteLength = incompleteEntries.length;

  const completeEntries = data
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