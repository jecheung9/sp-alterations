import { useParams } from "react-router-dom";
import type { Entry } from "../types/entry";
import StatusButtons from "../components/StatusButtons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AddForm from "../components/AddForm";
import Confirmation from "../components/Confirmation";

interface TodoDetailProps {
  entries: Entry[];
  deleteTodo: (id: number, type: Entry["type"]) => void;
  updateTodo: (updatedTodo: Entry, statusOnly: boolean) => void;
}

const TodoDetail: React.FC<TodoDetailProps> = ({
  entries,
  deleteTodo,
  updateTodo,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const todo = entries.find(e => e.id.toString() === id);

  if (!todo) {
    return <div className="page-container"><p>Todo not found</p></div>;
  }

  return (
    <div className="page-container">
      <h1>Todo #{todo.id}</h1>
      <p>Status: {todo.status}</p>
      <p>Client: {todo.client?.name}</p>
      <p>Due: {formatDate(todo.due)}</p>
      <p>Price: {todo.price}</p>
      <p>Description: {todo.description}</p>

      <StatusButtons
        onChange={(status) =>
          updateTodo({ ...todo, status }, true) 
        }
        currentStatus={todo.status}
        mode="alteration"
      />

      <button onClick={() => setIsEditOpen(true)}>Edit</button>
      <button onClick={() => {
        deleteTodo(todo.id, todo.type);
        navigate(`/todo`);
      }}>Delete</button>

      <button onClick={() => navigate(`/todo`)}>
        Return back to To-do list
      </button>

      {isEditOpen && (
        <AddForm
          isEdit
          onClose={() => setIsEditOpen(false)}
          onAddEntry={() => { }}
          onUpdateEntry={(newData) => {
            updateTodo({
              ...todo,
              client: newData.client || todo.client,
              due: newData.due || todo.due,
              price: newData.price || todo.price,
              description: newData.description || todo.description,
              status: todo.status,
            }, false);
            setToastMessage("Alteration todo updated successfully!");
            setIsEditOpen(false);
          }}
          editHeader={`Edit todo alteration #${todo.id}`}
          initialMode="alteration"
          initialData={{
            client: todo.client,
            due: todo.due,
            description: todo.description,
            price: todo.price,
          }}
        />
      )}

      {toastMessage && (
        <Confirmation
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

    </div>


  );
}


export default TodoDetail;
