// Card.jsx

import React, { useState, useCallback, useMemo } from "react";
import { useWorkspace } from "../../WorkspaceContext.jsx";
import add_icon from "./add_icon.png";
import "./Card.css";
import edit_icon from "./edit_icon.png";
import priority_icon from "./priorities.png";
import deadline_icon from "./deadline.png";
import { useWorkspaceEdit } from "../../WorkspaceEditContext.jsx";

// Вспомогательная функция для форматирования даты
const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}.${month}`;
};

// Расчет крайнего срока по подзадачам

const calculateDeadline = (subTasks) => {
  if (!subTasks || subTasks.length === 0) {
    return null;
  }

  // Извлекаем даты дедлайнов.
  const deadlines = subTasks
    .map((subtask) => subtask.deadline)
    .filter((d) => d)
    .map((d) => new Date(d).getTime())
    .filter((t) => !isNaN(t));

  if (deadlines.length === 0) {
    return null;
  }

  // Находим самую позднюю дату (самый большой timestamp)
  const latestTimestamp = Math.max(...deadlines);
  return formatDate(latestTimestamp);
};

// Компонент для отображения одной ПОДЗАДАЧИ (SubTask)

const SubTaskItem = ({ subtask }) => {
  return (
    <div key={subtask.subTaskId} className="subtask-item">
      <input
        type="checkbox"
        checked={subtask.isCompleted}
        readOnly
        className="subtask-checkbox"
      />
      <span
        className={`subtask-name ${subtask.isCompleted ? "completed" : ""}`}
      >
        {subtask.subTaskName}
      </span>
    </div>
  );
};

// Компонент для отображения существующей ЗАДАЧИ (Task)

const TaskItem = ({ card }) => {
  const { createSubTask, loading } = useWorkspace();
  const { isEditMode, cardNameChanges, updateCardChanges } = useWorkspaceEdit();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔑 ID задачи
  const taskIdForApi = card.taskId;

  // Проверка, является ли ID временным, для блокировки редактирования названия
  const isTemporaryId = String(taskIdForApi).startsWith("temp-");

  // Текущее имя задачи (с учетом локальных изменений)
  const currentTaskName =
    cardNameChanges[taskIdForApi] !== undefined
      ? cardNameChanges[taskIdForApi]
      : card.cardName || "Новая задача";

  // Обработчик изменения названия задачи
  const handleNameChange = useCallback(
    (e) => {
      // Игнорируем изменения, если это новая (несохраненная) задача с временным ID
      if (isTemporaryId) return;

      updateCardChanges(taskIdForApi, e.target.value);
    },
    [taskIdForApi, updateCardChanges, isTemporaryId]
  );

  const handleCreateSubTask = useCallback(async () => {
    // Вызов блокируется, только если уже идет глобальная загрузка или локальный сабмит
    if (loading || isSubmitting) {
      console.warn("Попытка создать подзадачу во время загрузки или сабмита.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Внимание: Проверка на числовой ID для API теперь происходит внутри WorkspaceContext.jsx
      await createSubTask(taskIdForApi);
    } catch (e) {
      // Ошибка будет обработана в контексте с помощью Toast
    } finally {
      setIsSubmitting(false);
    }
  }, [taskIdForApi, createSubTask, loading, isSubmitting]);

  const subtasksToRender = card.subTasks || [];

  // Расчет дедлайна задачи (самая поздняя дата подзадачи)
  const taskDeadline = calculateDeadline(subtasksToRender);

  // Получение приоритета
  const taskPriority = card.priority || "Высокий";

  // Расчет прогресса
  const totalSubtasks = subtasksToRender.length;
  const completedSubtasks = subtasksToRender.filter(
    (s) => s.isCompleted
  ).length;
  const progressPercent =
    totalSubtasks > 0
      ? Math.round((completedSubtasks / totalSubtasks) * 100)
      : 0;

  return (
    <div key={card.cardId} className="list-card-item">
      <div className="task-header-row">
        {isEditMode ? (
          // 🔑 РЕЖИМ РЕДАКТИРОВАНИЯ: Поле ввода
          <input
            type="text"
            className="list-task-input-edit"
            value={currentTaskName}
            onChange={handleNameChange}
          />
        ) : (
          // 🔑 НОРМАЛЬНЫЙ РЕЖИМ: Статический текст
          <div className="list-task-content">
            {card.cardName || "Элемент внутри колонки"}
          </div>
        )}
        {taskDeadline && (
          <div className="task-info-compact-indicator">{taskDeadline}</div>
        )}
      </div>
      {/* 2. Место для описания */}
      <div className="task-description-placeholder">
        Место для дополнительной информации и описания задачи
      </div>
      {/* 3. Индикатор прогресса */}
      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
      {/* 4. СПИСОК ПОДЗАДАЧ И КНОПКА СОЗДАНИЯ */}
      <div className="list-subtask">
        {/* Отображение статуса подзадач */}
        <div className="subtask-progress-status">
          {totalSubtasks > 0 ? (
            <span className="subtask-status-text">
              &#10003; {completedSubtasks} из {totalSubtasks}
            </span>
          ) : (
            <span className="subtask-status-text-empty">&#9711; 0 из 0</span>
          )}
        </div>

        {/* Рендеринг подзадач */}
        {subtasksToRender.map((subtask) => (
          <SubTaskItem key={subtask.subTaskId} subtask={subtask} />
        ))}

        {/* Кнопка создания подзадачи */}
        <button
          type="button"
          className="add-subtask-button"
          onClick={handleCreateSubTask}
          disabled={loading || isSubmitting}
        >
          {/* 🔑 Упрощенная логика: только Создание... или Добавить подзадачу */}
          {isSubmitting ? "Создание..." : "+ Добавить подзадачу"}
        </button>
      </div>
      <div className="task-details-footer">
        {/* Приоритет */}
        <div
          className={`task-footer-item priority-footer priority-${taskPriority.toLowerCase()}`}
        >
          <img src={priority_icon} alt="Приоритет" className="indicator-icon" />
          <span className="priority-text">{taskPriority}</span>
        </div>

        {/* Дедлайн */}
        {taskDeadline && (
          <div className="task-footer-item deadline-footer">
            <img src={deadline_icon} alt="Дедлайн" className="indicator-icon" />
            <span className="deadline-text">{taskDeadline}</span>
          </div>
        )}

        {/* Участники (обновленная заглушка) */}
        <div className="task-footer-item members-footer"></div>
      </div>
    </div>
  );
};

// Компонент для отображения одной "Карточки" (Колонки/Списка)
const ListColumn = ({ list }) => {
  const { createTask, loading } = useWorkspace();
  const { isEditMode, cardNameChanges, updateCardChanges } = useWorkspaceEdit();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const listIdForApi = list.listId;
  const isListSaved = !String(listIdForApi).startsWith("temp-");

  // Текущее имя колонки (с учетом локальных изменений)
  const currentListName =
    cardNameChanges[listIdForApi] !== undefined
      ? cardNameChanges[listIdForApi]
      : list.listName || `ID: ${list.listId}`;

  // Обработчик изменения названия колонки
  const handleNameChange = useCallback(
    (e) => {
      // Игнорируем изменения, если это новая (несохраненная) колонка
      if (!isListSaved) return;

      updateCardChanges(listIdForApi, e.target.value);
    },
    [listIdForApi, updateCardChanges, isListSaved]
  );

  const handleCreateTask = async () => {
    if (loading || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createTask(list.listId);
    } catch (e) {
      // Ошибка будет обработана в контексте с помощью Toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="existing-list-container">
      {/* Заголовок и подчеркивание */}
      <div className="list-header-wrapper">
        {isEditMode ? (
          // РЕЖИМ РЕДАКТИРОВАНИЯ: Поле ввода
          <input
            type="text"
            className="list-title-input-edit"
            value={currentListName}
            onChange={handleNameChange}
          />
        ) : (
          // НОРМАЛЬНЫЙ РЕЖИМ: Статический заголовок
          <h3 className="list-title">
            {list.listName || `ID: ${list.listId}`}
          </h3>
        )}
      </div>
      <div className="list-cards-wrapper">
        {/* Рендеринг существующих задач */}
        {(list.cards || []).map((card) => (
          <TaskItem key={card.cardId} card={card} />
        ))}
        {}
        <button
          type="button"
          className="add-task-button"
          onClick={handleCreateTask}
          disabled={loading || isSubmitting}
        >
          {isSubmitting ? "Создание..." : "+ Добавить задачу"}
        </button>
      </div>
    </div>
  );
};

// Основной компонент доски (Card)

export default function Card() {
  const { createCard, loading, lists } = useWorkspace();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateCardColumn = async () => {
    if (loading || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createCard();
    } catch (e) {
      // Ошибка будет обработана в контексте с помощью Toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const listsToRender = lists || [];

  return (
    <div className="card-container">
      {listsToRender.map((list) => (
        <ListColumn key={list.listId} list={list} />
      ))}
      <button
        type="button"
        className="list-create-container list-create-button-style"
        onClick={handleCreateCardColumn}
        disabled={loading || isSubmitting}
      >
        <>
          <img
            src={add_icon}
            alt="Добавить карточку (колонку)"
            className="card-create-icon"
          />
          <p className="card-create-text">Добавить карточку</p>
        </>
      </button>
    </div>
  );
}
