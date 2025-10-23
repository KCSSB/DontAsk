// WorkspaceContext.jsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useParams, useLocation } from "react-router-dom";
import { useToast } from "../../components/Toast/ToastContext";
import { fetchWithAuth, postWithAuth } from "../../service/api.js";

// --- Вспомогательные функции для генерации уникальных ID ---
const generateUniqueId = (prefix = "temp") =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const WorkspaceContext = createContext(null);

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error(
      "useWorkspace должен использоваться внутри WorkspaceProvider"
    );
  }
  return context;
};

export const WorkspaceProvider = ({ children }) => {
  const { boardId } = useParams();
  const location = useLocation();
  const incomingProjectId = location.state?.projectId;
  const incomingProjectName = location.state?.projectName;
  const showToast = useToast();

  const [workspaceData, setWorkspaceData] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Функция обновления данных рабочей области (для добавления КОЛОНКИ ИЛИ ЗАДАЧИ) ---
  const updateWorkspaceData = useCallback((newData) => {
    setWorkspaceData((prevData) => {
      if (!prevData) return prevData;

      let newBoardLists = [...(prevData.boardLists || [])];

      // 1. ЛОГИКА ДОБАВЛЕНИЯ НОВОЙ КОЛОНКИ (КАРТОЧКИ)
      if (newData.newCard) {
        const normalizedNewList = {
          listId: newData.newCard.CardId || generateUniqueId("list"),
          listName: newData.newCard.CardName || "Новая карточка",
          cards: [],
          ...newData.newCard,
        };

        const finalLists = [...newBoardLists, normalizedNewList];

        console.log(
          "✅ Добавлена новая Колонка/Список ('Карточка'):",
          normalizedNewList
        );

        return {
          ...prevData,
          boardLists: finalLists,
        };
      }

      // 2. ЛОГИКА ДОБАВЛЕНИЯ НОВОЙ ЗАДАЧИ (ТАСКА)
      if (newData.newTask && newData.listId) {
        const { newTask, listId } = newData;

        const targetListIndex = newBoardLists.findIndex(
          (l) => l.listId === listId
        );

        if (targetListIndex === -1) {
          console.error(
            `Не удалось найти список с ID: ${listId} для добавления задачи.`
          );
          return prevData;
        }

        const normalizedNewTask = {
          cardId: newTask.CardId || generateUniqueId("task"),
          cardName: newTask.CardName || "Новая задача",
          ...newTask,
        };

        const targetList = newBoardLists[targetListIndex];

        const updatedList = {
          ...targetList,
          cards: [...(targetList.cards || []), normalizedNewTask],
        };

        const finalLists = [
          ...newBoardLists.slice(0, targetListIndex),
          updatedList,
          ...newBoardLists.slice(targetListIndex + 1),
        ];

        console.log(
          `✅ Добавлена новая задача в список ${listId}:`,
          normalizedNewTask
        );

        return {
          ...prevData,
          boardLists: finalLists,
        };
      }

      return { ...prevData, ...newData };
    });
  }, []);

  // --- Функция загрузки данных ---
  const fetchWorkspaceData = useCallback(
    async (id) => {
      if (!id) return;
      setLoading(true);
      setWorkspaceData(null);
      try {
        const data = await fetchWithAuth(`/GetPages/GetWorkSpacePage/${id}`);
        setWorkspaceData(data);
        console.log("Данные рабочей области успешно получены:", data);
      } catch (err) {
        console.error(
          "Ошибка при получении данных WorkSpace:",
          err.response || err.message
        );
        showToast(
          "Не удалось загрузить рабочую область. Пожалуйста, попробуйте снова.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    fetchWorkspaceData(boardId);
  }, [boardId]);

  // --- Извлечение данных из состояния ---
  const projectIdFromApi = workspaceData?.projectId;
  const projectId = projectIdFromApi || incomingProjectId;
  const projectNameFromApi = workspaceData?.projectName;
  const projectName =
    projectNameFromApi || incomingProjectName || "Загрузка проекта...";
  const boardName = workspaceData?.boardName || "Загрузка доски...";
  const members = workspaceData?.workSpaceMembers || [];
  const lists = workspaceData?.boardLists || [];

  // --- Функция создания новой КОЛОНКИ (которую вы называете "карточка") ---
  const createCard = useCallback(async () => {
    if (!projectId || !boardId) {
      console.error("Отсутствует Project ID или Board ID.");
      showToast(
        "Недостаточно данных для создания карточки (колонки).",
        "error"
      );
      return;
    }

    // Используем рабочий URL для создания колонки (без /api/, так как работает)
    const url = `/project/${projectId}/board/${boardId}/Card/CreateCard`;

    const payload = {
      CardName: "Новая карточка",
    };

    try {
      const newCard = await postWithAuth(url, payload, {
        headers: { "Content-Type": "application/json" },
      });

      showToast("Новая колонка успешно создана!", "success");

      updateWorkspaceData({ newCard: newCard });

      return newCard;
    } catch (err) {
      console.error(
        "Ошибка при создании карточки (колонки):",
        err.response || err.message
      );
      showToast(
        "Ошибка при создании карточки (колонки). Попробуйте снова.",
        "error"
      );
      throw err;
    }
  }, [projectId, boardId, showToast, updateWorkspaceData]);

  // --- Функция создания ЗАДАЧИ (Task) внутри существующей колонки ---
  const createTask = useCallback(
    async (listId, taskName) => {
      if (!projectId || !boardId || !listId) {
        console.error("Отсутствует Project ID, Board ID или List ID.", {
          projectId,
          boardId,
          listId,
        });
        showToast("Недостаточно данных для создания задачи.", "error");
        return;
      }

      // 🔑 ИСПРАВЛЕНИЕ: ПРИНУДИТЕЛЬНО ДОБАВЛЯЕМ ПРЕФИКС /api/
      // для соответствия документации API POST /api/project/.../Task/CreateTask
      const baseUrl = `/api/project/${projectId}/board/${boardId}/Task/CreateTask`;

      const payload = {
        ListId: listId,
        CardName: taskName, // Имя задачи
      };

      console.log("--- ОТЛАДКА TASK/CREATETASK ---");
      console.log("Используемый URL:", baseUrl);
      console.log("Payload:", payload);
      console.log("Project ID:", projectId);
      console.log("Board ID:", boardId);
      console.log("List ID:", listId);
      console.log("-------------------------------");

      try {
        const newTask = await postWithAuth(baseUrl, payload, {
          headers: { "Content-Type": "application/json" },
        });

        showToast("Новая задача успешно создана!", "success");

        updateWorkspaceData({ newTask: newTask, listId: listId });

        return newTask;
      } catch (err) {
        console.error(
          "Ошибка при создании задачи:",
          err.response || err.message
        );
        showToast(
          "Ошибка при создании задачи. Пожалуйста, проверьте URL в консоли и префикс /api.",
          "error"
        );
        throw err;
      }
    },
    [projectId, boardId, showToast, updateWorkspaceData]
  );

  const contextValue = {
    workspaceData,
    loading,
    projectName,
    boardName,
    members,
    projectId,
    createCard,
    createTask,
    fetchWorkspaceData,
    lists,
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};
