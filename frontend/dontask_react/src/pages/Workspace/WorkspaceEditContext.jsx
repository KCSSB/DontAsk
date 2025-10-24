// WorkspaceEditContext.jsx

import React, { createContext, useContext, useState, useCallback } from "react";
import { useToast } from "../../components/Toast/ToastContext";
// 🔑 ИМПОРТ: Для доступа к функциям API и перезагрузки данных
import { useWorkspace } from "./WorkspaceContext.jsx";

const WorkspaceEditContext = createContext(null);

export const WorkspaceEditProvider = ({ children }) => {
  const showToast = useToast();
  // 🔑 ИЗМЕНЕНИЕ: Извлекаем функции API и загрузки данных из WorkspaceContext
  const { updateCardNames, fetchWorkspaceData } = useWorkspace();

  // Состояние, определяющее, находится ли доска в режиме редактирования
  const [isEditMode, setIsEditMode] = useState(false);
  // 🔑 Состояние для временного хранения изменений названий: { id: 'new name' }
  const [cardNameChanges, setCardNameChanges] = useState({});

  /**
   * Хранит изменения, внесенные пользователем в полях ввода, в локальном состоянии.
   * @param {string} id ID задачи (cardId) или колонки (listId).
   * @param {string} newName Новое название.
   */
  const updateCardChanges = useCallback((id, newName) => {
    setCardNameChanges((prevChanges) => ({
      ...prevChanges,
      [id]: newName,
    }));
  }, []);

  /**
   * 🚀 ФУНКЦИЯ: Применяет изменения, отправляет PATCH-запрос и выходит из режима.
   */
  const applyChanges = useCallback(async () => {
    console.log("Применение изменений...");

    // Форматируем изменения в массив объектов {id, name}
    const changesArray = Object.entries(cardNameChanges)
      .map(([id, name]) => ({ id, name }))
      .filter(
        (item) => String(item.id).length > 0 && item.name.trim().length > 0
      ); // Игнорируем пустые изменения

    if (changesArray.length > 0) {
      // Отправляем все изменения одним PATCH-запросом
      const success = await updateCardNames(changesArray);

      if (success) {
        showToast(
          `Успешно сохранено ${changesArray.length} изменений!`,
          "success"
        );
        // Перезагрузка данных для синхронизации локального состояния (особенно для unsaved changes)
        fetchWorkspaceData();
      } else {
        showToast("Не удалось сохранить все изменения.", "error");
        return; // Остаемся в режиме редактирования при ошибке
      }
    } else {
      showToast("Нет изменений для сохранения.", "info");
    }

    setCardNameChanges({}); // Очищаем временное хранилище
    setIsEditMode(false); // Выход из режима
  }, [cardNameChanges, updateCardNames, fetchWorkspaceData, showToast]);

  /**
   * ФУНКЦИЯ: Отменяет все локальные изменения и выходит из режима.
   */
  const resetChanges = useCallback(() => {
    console.log("Отмена изменений. Откат локального состояния...");

    setCardNameChanges({}); // Сбрасываем временное хранилище
    fetchWorkspaceData(); // Перезагружаем оригинальные данные с сервера
    showToast("Изменения отменены.", "info");

    setIsEditMode(false); // Выход из режима
  }, [fetchWorkspaceData, showToast]);

  /**
   * Переключает режим редактирования.
   */
  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
    // 🔑 ДОПОЛНИТЕЛЬНО: Если пользователь выходит из режима,
    // автоматически сбрасываем несохраненные изменения
    if (isEditMode) {
      resetChanges();
    }
  }, [isEditMode, resetChanges]);

  const value = {
    isEditMode,
    toggleEditMode,
    applyChanges,
    resetChanges,
    cardNameChanges, // 🔑 ДОБАВЛЕНО: Текущие изменения
    updateCardChanges, // 🔑 ДОБАВЛЕНО: Функция для записи изменений
  };

  return (
    <WorkspaceEditContext.Provider value={value}>
      {children}
    </WorkspaceEditContext.Provider>
  );
};

// Хук для использования контекста
export const useWorkspaceEdit = () => {
  const context = useContext(WorkspaceEditContext);
  if (context === undefined) {
    throw new Error(
      "useWorkspaceEdit должен использоваться внутри WorkspaceEditProvider"
    );
  }
  return context;
};
