import { useParams } from "react-router";
import type { Entry } from "../types/entry";
import StatusButtons from "../components/StatusButtons";
import { useNavigate } from "react-router";

interface TodoDetailProps {
  entries: Entry[];
  updateStatus: (id: number, status: Entry['status']) => void;
}

const TodoDetail: React.FC<TodoDetailProps> = ({
  entries,
  updateStatus
}) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const todo = entries.find(e => e.id.toString() === id);

  if (!todo) {
    return <div className="page-container"><p>Todo not found</p></div>;
  }

  return (
    <div className="page-container">
      <h1>Todo #{todo.id}</h1>
      <p>Status: {todo.status}</p>
      <p>Client: {todo.client}</p>
      <p>Due: {todo.due}</p>
      <p>Description:{todo.description}</p>

      <StatusButtons
        entryId={todo.id}
        onChange={updateStatus}
        currentStatus={todo.status}
      />

      <button onClick={() => navigate(`/todo`)}>
        Return back to dashboard
      </button>

    </div>


  );
}


export default TodoDetail;
