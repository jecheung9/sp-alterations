import { Routes, Route } from "react-router";
import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Money from "./pages/Money";
import Calendar from "./pages/Calendar";
import ToDo from "./pages/ToDo";
import Settings from "./pages/Settings";
import Layout from "./components/Layout";
import type { TodoEntry } from "./types/todo";
import { todoData } from "./mockdata/todo";
import Meetings from "./pages/Meetings";
import './styles/App.css';


function App() {
  const [todoList, setTodoList] = useState<TodoEntry[]>(todoData);

  const addTodoEntry = (entry: { duedate: string; client: string; price: number; description: string }) => {
    const newEntry: TodoEntry = {
      id: todoList.length + 1,
      completed: false,
      ...entry
    };

    setTodoList(prev => [...prev, newEntry]);
  };
  return (
    <Routes>
      <Route path="/" element={<Layout addTodoEntry={addTodoEntry}><Dashboard todoList={todoList}/></Layout>} />
      <Route path="money" element={<Layout addTodoEntry={addTodoEntry}><Money /></Layout>} />
      <Route path="calendar" element={<Layout addTodoEntry={addTodoEntry}><Calendar /></Layout>} />
      <Route path="todo" element={<Layout addTodoEntry={addTodoEntry}><ToDo todoList={todoList} /></Layout>} />
      <Route path="settings" element={<Layout addTodoEntry={addTodoEntry}><Settings /></Layout>} />
      <Route path="meetings" element={<Layout addTodoEntry={addTodoEntry}><Meetings /></Layout>} />
    </Routes>
  )
}

export default App;
