import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../../components/Toast/ToastContext";
import { postWithAuth, fetchWithAuth } from "../../../../service/api";
import { useProject } from "../../HallContext.jsx";
import create_board_icon from "./create_board_icon.png";
import sand_watches_icon from "./sand_watches_icon.png";
import people_icon from "./people_icon.png";
import deleteBoard_icon from "./deleteBoard_icon.png";
import "./Board_list.css";

const BOARD_COLORS = [
  "#8E8DFF",
  "#6868EE",
  "#EE6868",
  "#EEDB68",
  "#68EE68",
  "#EE68BB",
];

const BoardCard = ({ board, index }) => {
  const {
    isEditMode,
    addBoardToDelete,
    addBoardToUpdateName,
    checkBoardExistsInChanges,
    projectData, // <-- Содержит projectId и projectName
  } = useProject();
  const showToast = useToast();
  const [localBoardName, setLocalBoardName] = useState(board.boardName);
  const navigate = useNavigate();

  useEffect(() => {
    const currentBoard = projectData?.boards.find(
      (b) => b.boardId === board.boardId
    );
    if (currentBoard) {
      setLocalBoardName(currentBoard.boardName);
    }
  }, [projectData, board.boardId]);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}.${month}`;
  };

  /**
   * Обновленная асинхронная функция для обработки клика и навигации.
   * Передает projectId через state роутера, чтобы WorkspaceContext мог его получить.
   */
  const handleCardClick = async () => {
    if (isEditMode) {
      return;
    }

    // 1. Извлечение Project ID и Project Name
    const projectId = projectData?.projectId;
    const projectName = projectData?.projectName;

    if (!projectId) {
      console.error(
        "BoardCard: Не удалось получить Project ID из контекста Hall."
      );
      showToast(
        "Ошибка: ID проекта не найден. Пожалуйста, перезагрузите страницу.",
        "error"
      );
      return;
    }

    try {
      console.log(`Отправка GET запроса для доски с ID: ${board.boardId}`);

      // Выполняем GET запрос к указанному эндпоинту
      const workSpaceData = await fetchWithAuth(
        `/GetPages/GetWorkSpacePage/${board.boardId}`
      );

      console.log("Данные WorkSpace получены:", workSpaceData);

      // 2. Навигация и передача ProjectID и ProjectName через state
      navigate(`/workspace/${board.boardId}`, {
        state: {
          projectId: projectId,
          projectName: projectName, // Для надежности, если API-ответ не содержит названия
        },
      });
    } catch (err) {
      console.error(
        `Ошибка при получении данных для доски с ID ${board.boardId}:`,
        err.response || err.message
      );
      showToast(
        "Не удалось загрузить доску. Пожалуйста, попробуйте снова.",
        "error"
      );
    }
  };

  const handleBoardNameChange = (e) => {
    setLocalBoardName(e.target.value);
  };

  const handleSaveBoardName = (e) => {
    if (e.key === "Enter" || e.type === "blur") {
      if (e.type === "blur") e.target.blur();
      const trimmedName = localBoardName.trim();
      if (!trimmedName) {
        setLocalBoardName(board.boardName);
        return;
      }

      addBoardToUpdateName(board.boardId, trimmedName);
    }
  };

  const handleBoardDeleteClick = () => {
    addBoardToDelete(board.boardId);
    showToast(
      `Доска "${board.boardName}" помечена на удаление. Примените изменения, чтобы подтвердить`,
      "info"
    );
  };

  const { isMarkedForUpdate } = checkBoardExistsInChanges(board.boardId);

  return (
    <div
      className={`board-card ${isEditMode ? "disabled-edit" : ""} ${
        isMarkedForUpdate ? "board-card-updated" : ""
      }`}
      style={{
        backgroundColor: BOARD_COLORS[index % BOARD_COLORS.length],
      }}
      onClick={handleCardClick}
    >
      <div className="board-card-top">
        <div className="board-card-title-container">
          {isEditMode ? (
            <input
              type="text"
              className="board-card-title-input"
              value={localBoardName}
              onChange={handleBoardNameChange}
              onBlur={handleSaveBoardName}
              spellCheck="false"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveBoardName(e);
              }}
            />
          ) : (
            <h5 className="board-card-title">{board.boardName}</h5>
          )}

          {isEditMode && (
            <button
              className="board-card-delete-button"
              onClick={handleBoardDeleteClick}
            >
              <img
                src={deleteBoard_icon}
                alt="DELETE"
                className="board-card-delete"
              />
            </button>
          )}
        </div>
        <div className="board-card-info">
          {(board.dateOfStartwork || board.dateOfDeadline) && (
            <>
              <img
                src={sand_watches_icon}
                alt="DEADLINE"
                className="board-card-info watches"
              />
              <div className="board-card-info deadline">
                <p>
                  {board.dateOfStartwork
                    ? formatDate(board.dateOfStartwork)
                    : ""}
                  {board.dateOfStartwork && board.dateOfDeadline ? " - " : ""}
                  {board.dateOfDeadline ? formatDate(board.dateOfDeadline) : ""}
                </p>
              </div>
            </>
          )}
          <div className="board-card-info board-people">
            <img src={people_icon} alt="PEOPLE" />
            <p>{board.membersCount}</p>
          </div>
        </div>
      </div>
      <div className="board-card-bottom">
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${board.progressBar}%` }}
          ></div>
        </div>
        <p className="progress-text">{board.progressBar}%</p>
      </div>
    </div>
  );
};

export default function Board_list({ boards, loading, projectId }) {
  const showToast = useToast();
  const { updateBoards, isEditMode, projectData, isOwner } = useProject();
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [boardName, setBoardName] = useState("");

  const handleCreateBoardClick = () => {
    setIsCreating(true);
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!boardName.trim()) {
      showToast("Название доски не может быть пустым!", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // Здесь используется projectId, который приходит из пропсов (из Hall/ProjectContext)
      const newBoard = await postWithAuth(
        `/project/${projectData.projectId}/Board/CreateBoard`, // Используем projectId из projectData
        { BoardName: boardName },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      updateBoards(newBoard);

      setIsCreating(false);
      setBoardName("");
      showToast("Доска успешно создана!", "success");
    } catch (err) {
      console.error("Ошибка при создании доски:", err.response || err.message);
      showToast("Ошибка при создании доски. Попробуйте снова", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const boardsToRender = projectData?.boards || [];

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="board-list-container">
      <div className="board-list-wrapper">
        {isOwner &&
          !isEditMode &&
          (isCreating ? (
            <form
              key="create-form"
              className="board-create-card-form"
              onSubmit={handleCreateBoard}
            >
              <div className="board-create-card-top">
                <div className="board-input-group board-floating-label-group">
                  <input
                    type="text"
                    className="board-name-input"
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                    required
                    disabled={isSubmitting}
                    placeholder=" "
                  />
                  <label className="board-floating-label">Название доски</label>
                </div>
              </div>
              <div className="board-create-card-bottom">
                <button
                  className="board-create-button"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Создание..." : "Создать"}
                </button>
              </div>
            </form>
          ) : (
            <button
              key="create-button"
              className="board-card board-create-card"
              onClick={handleCreateBoardClick}
            >
              <img
                src={create_board_icon}
                alt="CREATE BOARD"
                className="board-create-logo"
              />
              <p className="board-create-text">Добавить доску</p>
            </button>
          ))}
        {boardsToRender.map((board, index) => (
          <BoardCard key={board.boardId} board={board} index={index} />
        ))}
      </div>
    </div>
  );
}
