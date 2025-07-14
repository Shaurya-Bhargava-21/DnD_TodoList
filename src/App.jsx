import { useReducer, useRef, useEffect, useState, createContext } from "react";
import { DatePicker, Space } from "antd";
import dayjs from "dayjs";
import "antd/dist/reset.css";
import SortableItem from "./SortableItem";
import SortableTask from "./SortableTask";
import "./App.css";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

export const ThemeContext = createContext();

function todoReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const { column, item } = action.payload;
      const updated = { ...state };
      if (!updated[column]) updated[column] = [];
      updated[column] = [...updated[column], { ...item, status: false }];
      return updated;
    }
    case "REMOVE": {
      const { column, index } = action.payload;
      const updated = { ...state };
      updated[column] = updated[column].filter((_, i) => i !== index);
      return updated;
    }
    case "CLEAR":
      return {};
    case "EDIT": {
      const { column, index, item } = action.payload;
      const updated = { ...state };
      updated[column][index] = { ...updated[column][index], ...item };
      return updated;
    }
    case "TOGGLE": {
      const { column, index } = action.payload;
      const items = [...(state[column] || [])];
      const item = { ...items[index], status: !items[index].status };
      items[index] = item;
      return { ...state, [column]: items };
    }

    case "MOVE": {
      const { column, fromIndex, toIndex } = action.payload;
      const colItems = [...state[column]];
      const [movedItem] = colItems.splice(fromIndex, 1);
      colItems.splice(toIndex, 0, movedItem);
      return { ...state, [column]: colItems };
    }
    case "REMOVE_COLUMN": {
      const updated = { ...state };
      delete updated[action.payload.column];
      return updated;
    }
    case "SET_STATE":
      return action.payload;
    default:
      return state;
  }
}

function App() {
  const [todoList, dispatch] = useReducer(todoReducer, {}, () => {
    return JSON.parse(localStorage.getItem("todoList")) || {};
  });

  const [columns, setColumns] = useState(() => {
    return JSON.parse(localStorage.getItem("columns")) || ["TODO's"];
  });

  const [newColumn, setNewColumn] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("TODO's");
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );
  const [inputValue, setInputValue] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState(null);
  const [editDetails, setEditDetails] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(
    () => localStorage.setItem("todoList", JSON.stringify(todoList)),
    [todoList]
  );
  useEffect(
    () => localStorage.setItem("columns", JSON.stringify(columns)),
    [columns]
  );
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.className = theme === "dark" ? "dark-theme" : "light-theme";
  }, [theme]);

  columns.forEach((col) => {
    if (!Array.isArray(todoList[col])) {
      todoList[col] = [];
    }
  });

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const addColumn = () => {
    const trimmed = newColumn.trim();
    if (!trimmed) return alert("Please enter a valid column name.");
    if (columns.includes(trimmed)) return alert("Column already exists.");
    setColumns([...columns, trimmed]);
    setNewColumn("");
  };

  const removeColumn = (colName) => {
    if (colName === "TODO's") return alert("Default column can't be removed.");
    if (!window.confirm(`Delete column "${colName}" and its tasks?`)) return;
    setColumns(columns.filter((col) => col !== colName));
    dispatch({ type: "REMOVE_COLUMN", payload: { column: colName } });
  };

  const saveToDoList = (e) => {
    e.preventDefault();
    const todo = inputValue.trim();
    if (!todo) return alert("Please enter a task");
    const item = {
      value: todo,
      description: description.trim(),
      time: time ? time.toISOString() : "",
    };
    const existingItems = Array.isArray(todoList[selectedColumn])
      ? todoList[selectedColumn]
      : [];
    const isDuplicate = existingItems.some(
      (itemObj, idx) =>
        (!editDetails || idx !== editDetails.index) &&
        itemObj.value.trim().toLowerCase() === todo.toLowerCase()
    );
    if (isDuplicate) return alert("Task already exists in this column.");
    if (editDetails) {
      dispatch({ type: "EDIT", payload: { ...editDetails, item } });
      setEditDetails(null);
    } else {
      dispatch({ type: "ADD", payload: { column: selectedColumn, item } });
    }
    setInputValue("");
    setDescription("");
    setTime(null);
  };

  const clearAll = () => {
    if (window.confirm("Are you sure you want to delete all tasks?")) {
      dispatch({ type: "CLEAR" });
      setInputValue("");
      setDescription("");
      setTime(null);
      setEditDetails(null);
    }
  };

  const handleEdit = (column, index) => {
    const item = todoList[column][index];
    setInputValue(item.value);
    setDescription(item.description || "");
    setTime(item.time ? dayjs(item.time) : null);
    setSelectedColumn(column);
    setEditDetails({ column, index });
  };

  const handleDelete = (column, index) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      dispatch({ type: "REMOVE", payload: { column, index } });
      setInputValue("");
      setDescription("");
      setTime(null);
      setEditDetails(null);
    }
  };

  const toggleStatus = (column, index) => {
    dispatch({ type: "TOGGLE", payload: { column, index } });
  };

  const handleMove = (column, fromIndex, toIndex) => {
    dispatch({ type: "MOVE", payload: { column, fromIndex, toIndex } });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;

    if (active.id.startsWith("column:") && over.id.startsWith("column:")) {
      const oldIndex = columns.indexOf(active.id.replace("column:", ""));
      const newIndex = columns.indexOf(over.id.replace("column:", ""));
      setColumns(arrayMove(columns, oldIndex, newIndex));
    }

    if (active.id.startsWith("task:")) {
      const [fromCol, fromIdx] = active.id.replace("task:", "").split("__");

      let toCol = fromCol;
      let toIndex = 0;

      if (over.id.startsWith("task:")) {
        const [overCol, overIdx] = over.id.replace("task:", "").split("__");
        toCol = overCol;
        toIndex = parseInt(overIdx);
      } else if (over.id.startsWith("column:") || over.id === "placeholder") {
        const matchCol = columns.find((col) => `column:${col}` === over.id);
        toCol = matchCol || fromCol;
        toIndex = 0;
      }

      const fromIndex = parseInt(fromIdx);
      if (!todoList[fromCol] || fromIndex === -1) return;

      const item = todoList[fromCol][fromIndex];
      const updated = { ...todoList };
      updated[fromCol] = [...updated[fromCol]];
      updated[fromCol].splice(fromIndex, 1);

      if (!updated[toCol]) updated[toCol] = [];
      updated[toCol] = [...updated[toCol]];
      updated[toCol].splice(toIndex, 0, item);

      dispatch({ type: "SET_STATE", payload: updated });
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      <div className="app-container">
        <h1>TODO List</h1>

        <div className="sticky-form">
          <div className="formcontainer">
            <input
              type="text"
              value={newColumn}
              onChange={(e) => setNewColumn(e.target.value)}
              placeholder="New Column Name"
            />
            <button onClick={addColumn}>Add Column</button>

            <form onSubmit={saveToDoList} className="formcontainer">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter a task..."
              />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a description..."
              />
              <select
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
              >
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
              <Space direction="vertical" style={{ width: "100%" }}>
                <DatePicker
                  showTime
                  value={time}
                  onChange={(date) => setTime(date)}
                  placeholder="Select date & time"
                  style={{ width: "100%" }}
                />
              </Space>
              <button>{editDetails ? "Update" : "Save"}</button>
              <button type="button" onClick={clearAll} className="clear-btn">
                Clear All
              </button>
              <button type="button" onClick={toggleTheme}>
                Switch to {theme === "dark" ? "Light" : "Dark"} Theme
              </button>
            </form>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={columns.map((c) => `column:${c}`)}
            strategy={verticalListSortingStrategy}
          >
            <div class="outer-scroll-wrapper">
              <div className="columns-wrapper">
                {columns.map((colName) => {
                  const items = Array.isArray(todoList[colName])
                    ? todoList[colName]
                    : [];
                  return (
                    <SortableItem key={colName} id={`column:${colName}`}>
                      <div className="column">
                        <h3>
                          {colName}
                          {colName !== "TODO's" && (
                            <span
                              onClick={() => removeColumn(colName)}
                              style={{
                                marginLeft: 8,
                                cursor: "pointer",
                                color: "red",
                              }}
                            >
                              &times;
                            </span>
                          )}
                        </h3>
                        <SortableContext
                          items={
                            items.length
                              ? items.map((_, idx) => `task:${colName}__${idx}`)
                              : ["placeholder"]
                          }
                          strategy={verticalListSortingStrategy}
                        >
                          <ul>
                            {items.length === 0 ? (
                              <li
                                style={{
                                  padding: "20px",
                                  textAlign: "center",
                                  opacity: 0.5,
                                }}
                              >
                                Drop task here
                              </li>
                            ) : (
                              items.map((item, idx) => (
                                <SortableTask
                                  key={`task:${colName}__${idx}`}
                                  id={`task:${colName}__${idx}`}
                                  itemProps={{
                                    value: item.value,
                                    description: item.description,
                                    time: item.time,
                                    indexNo: idx,
                                    totalItems: items.length,
                                    onEdit: () => handleEdit(colName, idx),
                                    onDelete: () => handleDelete(colName, idx),
                                    onToggle: () => toggleStatus(colName, idx),
                                    onMove: (from, to) =>
                                      handleMove(colName, from, to),
                                    status: item.status,
                                  }}
                                />
                              ))
                            )}
                          </ul>
                        </SortableContext>
                      </div>
                    </SortableItem>
                  );
                })}
              </div>
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
