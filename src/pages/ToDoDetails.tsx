import { useParams } from "react-router-dom";
import type { Entry } from "../types/entry";
import StatusButtons from "../components/StatusButtons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AddForm from "../components/AddForm";
import ConfirmDelete from "../components/ConfirmDelete";

interface TodoDetailProps {
  entries: Entry[];
  deleteTodo: (entry: Entry) => void;
  updateTodo: (updatedTodo: Entry, statusOnly: boolean) => void;
  showToast: (message: string, type?: "default" | "delete") => void;
}

const TodoDetail: React.FC<TodoDetailProps> = ({
  entries,
  deleteTodo,
  updateTodo,
  showToast,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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
    return <div className="page-container"><p className="text-gray-500">Todo not found</p></div>;
  }

  const handleDelete = async () => {
    deleteTodo(todo);
    setIsConfirmOpen(false);
    navigate(`/todo`);
  }

  return (
    <div className="page-container">
      <h1 className="font-bold text-3xl">Todo #{todo.id}</h1>
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
      <button onClick={() => setIsConfirmOpen(true)}>Delete</button>

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
            showToast("Alteration todo updated successfully!", "default");
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

      {isConfirmOpen && (
        <ConfirmDelete
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={handleDelete}
          message="Are you sure you want to delete this todo item?"
        />
      )}

    </div>


  );
}


export default TodoDetail;
