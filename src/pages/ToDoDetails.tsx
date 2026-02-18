import { useParams } from "react-router";
import type { Entry } from "../types/entry";
import StatusButtons from "../components/StatusButtons";
import { useNavigate } from "react-router";

interface TodoDetailProps {
  entries: Entry[];
  updateStatus: (id: number, type: Entry["type"], status: Entry["status"]) => void;
}

const TodoDetail: React.FC<TodoDetailProps> = ({
  entries,
  updateStatus
}) => {
  const { id } = useParams();
  const navigate = useNavigate();

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
      <p>Description: {todo.description}</p>

      <StatusButtons
        entryId={todo.id}
        onChange={(id, status) => 
          updateStatus(id, todo.type, status)
        }
        currentStatus={todo.status}
      />

      <button onClick={() => navigate(`/todo`)}>
        Return back to To-do list
      </button>

    </div>


  );
}


export default TodoDetail;
