import React, { useState, useEffect, useCallback } from "react";
// Импортируем из общего контекста, который включает isEditMode и updateTaskName
import { useWorkspace } from "../../WorkspaceContext.jsx";
import { useWorkspaceEdit } from "../../WorkspaceEditContext.jsx";

// Этот компонент отвечает за рендеринг одной задачи
const TaskItem = ({ task, updateTaskNameInState }) => {
  // 🔑 Получаем состояние редактирования и функцию обновления
  const { updateTaskName } = useWorkspace();
  const { isEditMode } = useWorkspaceEdit();
  // 🔑 ВРЕМЕННЫЙ ЛОГ
  console.log(`Task ${task.cardId}: isEditMode =`, isEditMode);
  // Используем ID задачи (cardId)
  const taskId = task.cardId;

  // Локальное состояние для управления текстом в поле ввода
  const [name, setName] = useState(task.cardName || "Новая задача");

  // Синхронизация: если внешние данные (task.cardName) изменились, обновляем локальное состояние
  useEffect(() => {
    setName(task.cardName || "Новая задача");
  }, [task.cardName]);

  // Обработчик сохранения при потере фокуса или нажатии Enter
  const handleSave = async () => {
    const newName = name.trim();

    // 1. Проверяем, изменилось ли имя
    if (
      newName === (task.cardName || "Новая задача").trim() ||
      newName === ""
    ) {
      // Если пусто, или не изменилось, просто возвращаем
      if (newName === "") setName(task.cardName || "Новая задача");
      return;
    }

    // 2. Вызываем API из контекста
    const success = await updateTaskName(taskId, newName);

    if (!success) {
      // Если ошибка, откатываемся к исходному имени
      setName(task.cardName || "Новая задача");
    }
  };

  // Обработчик нажатия Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Предотвращаем стандартное действие (например, отправку формы)
      e.target.blur(); // Принудительно вызываем onBlur, который сохранит данные
    }
  };

  // ----------------------------------------------------
  // 🔑 УСЛОВНЫЙ РЕНДЕРИНГ НАЗВАНИЯ ЗАДАЧИ
  // ----------------------------------------------------
  return (
    <div className="task-item-container">
      <div className="task-name-wrapper">
        {isEditMode ? (
          // РЕЖИМ РЕДАКТИРОВАНИЯ: Поле ввода
          <input
            type="text"
            className="task-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            // Фокусируемся только если перешли в режим редактирования и элемент активен
            autoFocus
          />
        ) : (
          // ОБЫЧНЫЙ РЕЖИМ: Отображение текста (например, "Элемент внутри колонки")
          <div className="task-name-display">
            {task.cardName || "Элемент внутри колонки"}
          </div>
        )}
      </div>

      {/* ... Остальной контент задачи: подзадачи, приоритет, дедлайн и т.д. ... */}
    </div>
  );
};

export default TaskItem;
