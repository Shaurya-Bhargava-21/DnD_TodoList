import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TodoListItem from "./TodoListItem";

function SortableTask({ id, itemProps }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TodoListItem {...itemProps} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

export default SortableTask;
