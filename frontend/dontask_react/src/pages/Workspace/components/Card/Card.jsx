// card.jsx

import React, { useState } from "react";
import { useWorkspace } from "../../WorkspaceContext.jsx";
import add_icon from "./add_icon.png";
// import close_icon from "./close_icon.png"; // УДАЛЕНО, чтобы избежать ошибки 404
import "./Card.css";

// -----------------------------------------------------------
// Компонент для отображения существующей ЗАДАЧИ (Task)
// -----------------------------------------------------------
const TaskItem = ({ card }) => {
  return (
    <div key={card.cardId} className="list-card-item">
      {card.cardName || "Элемент внутри колонки"}
    </div>
  );
};

// -----------------------------------------------------------
// Компонент ФОРМЫ для создания новой ЗАДАЧИ
// -----------------------------------------------------------
const CreateTaskForm = ({ listId, onCreate, onCancel, isSubmitting }) => {
  const [taskName, setTaskName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Не отправляем пустую задачу
    const trimmedName = taskName.trim();

    if (trimmedName) {
      await onCreate(listId, trimmedName);
    } else {
      // Если текст пуст, просто закрываем форму
      onCancel();
    }
    setTaskName("");
  };

  const handleBlur = (e) => {
    // Отправляем при потере фокуса, только если текст не пуст
    if (taskName.trim()) {
      // В React onBlur срабатывает, даже если фокус уходит на submit button,
      // поэтому лучше использовать onClick/onSubmit, а onBlur использовать только
      // для закрытия формы без сохранения, если поле пусто.

      // Чтобы избежать двойной отправки (onBlur + onSubmit), лучше не вызывать handleSubmit
      // здесь, а просто проверить, что фокус ушел не на кнопку "Добавить".
      // Однако, поскольку здесь нет ссылки на кнопку, мы полагаемся на onCancel.
      // В текущей реализации лучше просто закрыть, если не было отправки.

      // Для упрощения, если поле не пустое, предполагаем, что пользователь может
      // захотеть отправить, но т.к. onBlur может сработать перед onSubmit,
      // мы просто закрываем, если пользователь не кликнул "Добавить"
      // и поле не было пустым при onBlur.
      // В этой версии: если поле пустое при onBlur -> закрываем.
      onCancel();
    } else {
      onCancel();
    }
  };

  // Новая логика: onBlur на textarea используется только для закрытия формы,
  // если пользователь не кликнул "Добавить" и убрал фокус.
  const handleTextareaBlur = (e) => {
    // Проверяем, куда ушел фокус
    if (!e.currentTarget.contains(e.relatedTarget)) {
      // Если фокус ушел за пределы формы/кнопок
      if (taskName.trim()) {
        // Если текст есть, отправляем
        handleSubmit(e);
      } else {
        // Если текста нет, отменяем
        onCancel();
      }
    }
  };

  return (
    <form className="task-form-container" onSubmit={handleSubmit}>
      <textarea
        className="task-input-field"
        placeholder="Введите текст задачи..."
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        disabled={isSubmitting}
        autoFocus
        // onBlur={handleBlur} // Изменим onBlur, чтобы оно не вызывало отправку по умолчанию
        onBlur={(e) => {
          // Использование relatedTarget для проверки, что фокус ушел не на кнопки внутри
          if (
            e.relatedTarget &&
            (e.relatedTarget.type === "submit" ||
              e.relatedTarget.className.includes("cancel-button"))
          ) {
            // Игнорируем, если фокус ушел на кнопку внутри формы
            return;
          }
          // Если фокус ушел за пределы формы или на другой элемент вне
          if (taskName.trim()) {
            handleSubmit(e); // Отправляем, если текст есть
          } else {
            onCancel(); // Отменяем, если текста нет
          }
        }}
      />
      <div className="task-form-actions">
        <button
          type="submit"
          className="task-form-save-button"
          disabled={isSubmitting}
        >
          Добавить
        </button>
        <button
          type="button"
          className="task-form-cancel-button"
          onClick={onCancel}
        >
          X
        </button>
      </div>
    </form>
  );
};

// -----------------------------------------------------------
// Компонент для отображения одной "Карточки" (Колонки/Списка)
// -----------------------------------------------------------
const ListColumn = ({ list }) => {
  const { createTask, loading } = useWorkspace();
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTask = async (listId, taskName) => {
    if (loading || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createTask(listId, taskName);
      // Форма закроется, так как в CreateTaskForm onCancel вызывается при успехе/отмене.
    } catch (e) {
      // Ошибка обработана в контексте
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelTaskCreation = () => {
    // Просто закрываем форму, submit уже не вызывается при onBlur, если нет текста
    setIsCreatingTask(false);
  };

  return (
    <div className="existing-list-container">
      <h3 className="list-title">{list.listName || `ID: ${list.listId}`}</h3>
      <div className="list-cards-wrapper">
        {/* Рендеринг существующих задач */}
        {(list.cards || []).map((card) => (
          <TaskItem key={card.cardId} card={card} />
        ))}

        {/* Форма создания задачи (условный рендеринг) */}
        {isCreatingTask && (
          <CreateTaskForm
            listId={list.listId}
            onCreate={handleCreateTask}
            onCancel={handleCancelTaskCreation}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Кнопка "Добавить задачу" (пунктир) */}
        {!isCreatingTask && (
          <button
            type="button"
            className="add-task-button"
            onClick={() => setIsCreatingTask(true)}
            disabled={loading}
          >
            + Добавить задачу
          </button>
        )}
      </div>
    </div>
  );
};

// -----------------------------------------------------------
// Основной компонент доски (Card)
// -----------------------------------------------------------
export default function Card() {
  const { createCard, loading, lists } = useWorkspace();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateCardColumn = async () => {
    if (loading || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createCard();
    } catch (e) {
      // Ошибка обработана в контексте
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
