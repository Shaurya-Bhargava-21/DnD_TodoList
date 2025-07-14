import { useContext } from "react";
import { ThemeContext } from "./App";

function TodoListItem({
  value,
  description,
  time,
  indexNo,
  onEdit,
  onDelete,
  onToggle,
  onMove,
  status,
  totalItems,
  dragHandleProps = {},
}) {
  const theme = useContext(ThemeContext);

  function formatDateTime(datetimeStr) {
    if (!datetimeStr) return "";
    const date = new Date(datetimeStr);
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleString("en-IN", options);
  }

  return (
    <li
      className={`${status ? "completetodo" : ""} ${theme === "light" ? "light-card" : ""}`}
      onClick={onToggle}

    >
      <div className="text">
        <strong>{indexNo + 1}. {value}</strong>
        {description && <div className="desc">{description}</div>}
        {time && <div className="time">🕒 {formatDateTime(time)}</div>}
      </div>

      <div className="btn-group">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(indexNo);
          }}
          className="edit-btn"
        >
          Edit
        </button>

        <div className="updown">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMove(indexNo, indexNo - 1);
            }}
            disabled={indexNo === 0}
          >
            ↑
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMove(indexNo, indexNo + 1);
            }}
            disabled={indexNo === totalItems - 1}
          >
            ↓
          </button>
        </div>
        
        <span {...dragHandleProps} className="drag">
          ⠿
        </span>
        <span
          onClick={(e) => {
            e.stopPropagation();
            onDelete(indexNo);
          }}
        >
          &times;
        </span>

      </div>
    </li>
  );
}

export default TodoListItem;
