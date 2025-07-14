# 📝 Trello-Inspired Todo App (React + DnD Kit)

A fully-featured Todo List app built with React and [@dnd-kit](https://github.com/clauderic/dnd-kit), featuring:

* 🗂️ Multiple dynamic columns (like Trello)
* 🔄 Drag-and-drop of tasks *within* and *between* columns
* 🧩 Reorder columns via drag-and-drop
* ✅ Task complete toggle
* ✏️ Edit, delete, and move tasks up/down
* 📅 Due dates with time using Ant Design DatePicker
* 🌗 Light/Dark theme toggle
* 💾 LocalStorage persistence

---

## 🚀 Features

* **Multiple Columns**: Add/remove custom named columns.
* **Tasks Management**: Add, edit, delete, reorder, and move tasks.
* **Drag & Drop**:

  * Drag tasks within or across columns.
  * Drag columns horizontally to reorder.
* **Due Dates**: Pick date/time using Ant Design’s DatePicker.
* **Persistence**: Tasks and columns are stored in `localStorage`.
* **Responsive UI**: Mobile-friendly layout.
* **Dark Mode**: Toggle between light and dark themes.

---

## 🛠️ Tech Stack

* **React 18**
* **@dnd-kit/core & @dnd-kit/sortable** – For drag-and-drop support
* **Ant Design** – Date/time picker
* **Day.js** – Date formatting
* **CSS Modules / Custom Styling**

---

## 📦 Installation

```bash
git clone https://github.com/your-username/trello-todo-app.git
cd trello-todo-app
npm install
npm run dev
```

> Make sure you're using **Node.js 16+** and **npm 7+**

---

## 🧩 Folder Structure

```
📁 src
├── App.jsx                 # Main app component
├── App.css                # Global styles and themes
├── SortableItem.jsx       # Wrapper for draggable columns
├── SortableTask.jsx       # Wrapper for draggable tasks
├── TodoListItem.jsx       # Individual task item
└── index.js               # Entry point
```

---

## 🔄 Drag-and-Drop Logic

* Columns and tasks are wrapped with `SortableContext` from `@dnd-kit/sortable`.
* Task IDs follow format: `task:column__index`
* Column IDs follow format: `column:columnName`
* On drag end:

  * Columns are reordered using `arrayMove`
  * Tasks are transferred or reordered based on drag source/destination

---

## 💾 Data Storage

All tasks, columns, and theme settings are stored in `localStorage` under:

* `todoList`
* `columns`
* `theme`

This ensures persistence across page reloads.

---

## 🌓 Theming

* Toggle between dark and light themes.
* `document.body.className` is updated based on `theme` state.

---

## 🧪 Testing

Basic functionality can be tested by:

* Adding/deleting columns
* Creating/editing/deleting tasks
* Dragging tasks and columns around
* Reloading the page to verify data persistence

