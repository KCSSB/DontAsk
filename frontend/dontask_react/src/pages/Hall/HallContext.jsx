import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useToast } from "../../components/Toast/ToastContext";
import {
  patchWithAuth,
  getUserIdFromToken,
  deleteWithAuth,
} from "../../service/api.js";

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const [projectData, setProjectData] = useState(null);
  const [initialProjectData, setInitialProjectData] = useState(null);
  const [snapshotProjectData, setSnapshotProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFilteredByMember, setIsFilteredByMember] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const isOwner = projectData?.projectRole === "owner";

  const [projectChanges, setProjectChanges] = useState({
    newProjectName: null,
    newProjectDescription: null,
    boardsToDelete: [],
    boardsToUpdate: [],
    membersToKick: [],
  });
  const showToast = useToast();

  useEffect(() => {
    const userId = getUserIdFromToken();
    if (userId) {
      setCurrentUserId(userId);
    }
  }, []);

  const updateBoards = useCallback((newBoard) => {
    setProjectData((prevData) => ({
      ...prevData,
      boards: [...(prevData?.boards || []), newBoard],
    }));
    setSnapshotProjectData((prevData) => ({
      ...prevData,
      boards: [...(prevData?.boards || []), newBoard],
    }));
    setInitialProjectData((prevData) => ({
      ...prevData,
      boards: [...(prevData?.boards || []), newBoard],
    }));
  }, []);

  const toggleFilter = useCallback(() => {
    setIsFilteredByMember((prev) => !prev);
  }, []);

  const setProjectDataUI = useCallback((updater) => {
    setProjectData(updater);
  }, []);

  const updateProjectNameChange = useCallback((newName) => {
    setProjectChanges((prev) => ({
      ...prev,
      newProjectName: newName,
    }));
  }, []);

  const updateProjectDescriptionChange = useCallback((newDescription) => {
    setProjectChanges((prev) => ({
      ...prev,
      newProjectDescription: newDescription,
    }));
  }, []);

  const checkBoardExistsInChanges = useCallback(
    (boardId) => {
      const isMarkedForDeletion =
        projectChanges.boardsToDelete.includes(boardId);
      const isMarkedForUpdate = projectChanges.boardsToUpdate.some(
        (b) => b.boardId === boardId
      );
      return { isMarkedForDeletion, isMarkedForUpdate };
    },
    [projectChanges.boardsToDelete, projectChanges.boardsToUpdate]
  );

  const addBoardToDelete = useCallback(
    (boardId) => {
      setProjectChanges((prev) => {
        const updatedBoardsToUpdate = prev.boardsToUpdate.filter(
          (b) => b.boardId !== boardId
        );
        if (!prev.boardsToDelete.includes(boardId)) {
          return {
            ...prev,
            boardsToUpdate: updatedBoardsToUpdate,
            boardsToDelete: [...prev.boardsToDelete, boardId],
          };
        }
        return {
          ...prev,
          boardsToUpdate: updatedBoardsToUpdate,
        };
      });

      setProjectData((prevData) => {
        if (!prevData) return null;
        return {
          ...prevData,
          boards: prevData.boards.filter((board) => board.boardId !== boardId),
        };
      });
    },
    [setProjectData]
  );

  const addBoardToUpdateName = useCallback(
    (boardId, updatedName) => {
      if (projectChanges.boardsToDelete.includes(boardId)) {
        showToast(
          "Нельзя изменить имя доски, помеченной на удаление!",
          "warning"
        );
        return;
      }

      const trimmedName = updatedName.trim();

      const originalBoard = snapshotProjectData?.boards.find(
        (b) => b.boardId === boardId
      );
      const originalName = originalBoard?.boardName.trim();

      if (trimmedName === originalName) {
        setProjectChanges((prev) => ({
          ...prev,
          boardsToUpdate: prev.boardsToUpdate.filter(
            (b) => b.boardId !== boardId
          ),
        }));
        setProjectData((prevData) => ({
          ...prevData,
          boards: prevData.boards.map((b) =>
            b.boardId === boardId ? { ...b, boardName: originalName } : b
          ),
        }));
        return;
      }

      setProjectChanges((prev) => {
        const existingUpdate = prev.boardsToUpdate.find(
          (b) => b.boardId === boardId
        );

        if (existingUpdate) {
          return {
            ...prev,
            boardsToUpdate: prev.boardsToUpdate.map((b) =>
              b.boardId === boardId ? { ...b, updatedName: trimmedName } : b
            ),
          };
        } else {
          return {
            ...prev,
            boardsToUpdate: [
              ...prev.boardsToUpdate,
              { boardId, updatedName: trimmedName },
            ],
          };
        }
      });

      setProjectData((prevData) => {
        if (!prevData) return null;
        return {
          ...prevData,
          boards: prevData.boards.map((b) =>
            b.boardId === boardId ? { ...b, boardName: trimmedName } : b
          ),
        };
      });
    },
    [
      projectChanges.boardsToDelete,
      snapshotProjectData,
      setProjectData,
      showToast,
    ]
  );

  const addMemberToKick = useCallback(
    (projectUserId) => {
      setProjectChanges((prev) => {
        if (!prev.membersToKick.includes(projectUserId)) {
          return {
            ...prev,
            membersToKick: [...prev.membersToKick, projectUserId],
          };
        }
        return prev;
      });

      setProjectData((prevData) => {
        if (!prevData || !prevData.projectUsers) return null;
        return {
          ...prevData,
          projectUsers: prevData.projectUsers.filter(
            (member) => member.projectUserId !== projectUserId
          ),
        };
      });

      showToast("Участник помечен на удаление. Примените изменения", "warning");
    },
    [setProjectData, showToast]
  );

  const resetChanges = useCallback(() => {
    if (snapshotProjectData) {
      setProjectData(JSON.parse(JSON.stringify(snapshotProjectData)));
    } else if (initialProjectData) {
      setProjectData(JSON.parse(JSON.stringify(initialProjectData)));
    }

    setProjectChanges({
      newProjectName: null,
      newProjectDescription: null,
      boardsToDelete: [],
      boardsToUpdate: [],
      membersToKick: [],
    });
    setIsEditMode(false);
    showToast("Последние изменения отменены", "info");
  }, [snapshotProjectData, initialProjectData, showToast, setProjectData]);

  const applyChanges = useCallback(async () => {
    const projectId = projectData?.projectId;
    if (!projectId) {
      setIsEditMode(false);
      return;
    }

    const promises = [];
    let nameUpdateSuccess = true;

    if (projectChanges.newProjectName !== null) {
      const newName = projectChanges.newProjectName.trim();
      const originalName = initialProjectData?.projectName.trim();
      if (newName && newName !== originalName) {
        const updateNamePromise = patchWithAuth(
          `/Projects/${projectId}/UpdateProjectName`,
          { updatedProjectName: newName }
        )
          .then(() => {
            showToast("Название проекта успешно обновлено!", "success");
            setInitialProjectData((prev) => ({
              ...prev,
              projectName: newName,
            }));
            setSnapshotProjectData((prev) => ({
              ...prev,
              projectName: newName,
            }));
          })
          .catch((error) => {
            nameUpdateSuccess = false;
            showToast("Ошибка при обновлении названия проекта", "error");
            console.error("Ошибка обновления названия:", error);
            setProjectData((prev) => ({ ...prev, projectName: originalName }));
          });
        promises.push(updateNamePromise);
      }
    }

    if (projectChanges.newProjectDescription !== null) {
      const newDescription = projectChanges.newProjectDescription.trim();
      const originalDescription = initialProjectData?.description?.trim() || "";

      if (newDescription !== originalDescription) {
        const updateDescriptionPromise = patchWithAuth(
          `/Projects/${projectId}/UpdateProjectDescription`,
          { projectDescription: newDescription }
        )
          .then(() => {
            showToast("Описание проекта успешно обновлено!", "success");
            setInitialProjectData((prev) => ({
              ...prev,
              description: newDescription,
            }));
            setProjectData((prev) => ({
              ...prev,
              description: newDescription,
            }));
            setSnapshotProjectData((prev) => ({
              ...prev,
              description: newDescription,
            }));
          })
          .catch((error) => {
            showToast("Ошибка при обновлении описания проекта", "error");
            console.error("Ошибка обновления описания:", error);
            setProjectData((prev) => ({
              ...prev,
              description: originalDescription,
            }));
          });
        promises.push(updateDescriptionPromise);
      }
    }

    if (projectChanges.boardsToDelete.length > 0) {
      const boardsToDeleteNames = projectChanges.boardsToDelete.map(
        (boardId) => {
          const board = snapshotProjectData?.boards.find(
            (b) => b.boardId === boardId
          );
          return board ? board.boardName : `ID: ${boardId}`;
        }
      );

      const namesString = boardsToDeleteNames.join(", ");
      const deleteBoardsPromise = deleteWithAuth(
        `/project/${projectId}/Board/DeleteBoards`,
        { boardIds: projectChanges.boardsToDelete }
      )
        .then(() => showToast(`Доски удалены: ${namesString}`, "success"))
        .catch((error) => {
          showToast("Ошибка при удалении досок. Попробуйте снова", "error");
          console.error("Ошибка удаления досок:", error);
        });
      promises.push(deleteBoardsPromise);
    }

    const boardsToPatch = projectChanges.boardsToUpdate.filter(
      (board) => !projectChanges.boardsToDelete.includes(board.boardId)
    );

    if (boardsToPatch.length > 0) {
      const updateBoardsPromise = patchWithAuth(
        `/project/${projectId}/Board/UpdateBoardsName`,
        { updatedBoards: boardsToPatch }
      )
        .then(() =>
          showToast(
            `Успешно обновлено имя ${boardsToPatch.length} доски(ок)`,
            "success"
          )
        )
        .catch((error) => {
          showToast(
            "Ошибка при обновлении имен досок. Попробуйте снова",
            "error"
          );
          console.error("Ошибка обновления имен досок:", error);
        });
      promises.push(updateBoardsPromise);
    }

    if (projectChanges.membersToKick.length > 0) {
      const membersToKickNames = projectChanges.membersToKick.map((userId) => {
        const member = snapshotProjectData?.projectUsers.find(
          (u) => u.projectUserId === userId
        );
        return member
          ? `${member.firstName} ${member.lastName}`
          : `ID: ${userId}`;
      });

      const namesString = membersToKickNames.join(", ");

      const deleteMembersPayload = {
        projectUsers: projectChanges.membersToKick,
      };

      const deleteMembersPromise = deleteWithAuth(
        `/Projects/${projectId}/DeleteProjectUsers`,
        deleteMembersPayload
      )
        .then(() => {
          showToast(`Участники удалены: ${namesString}`, "success");

          setInitialProjectData((prev) => ({
            ...prev,
            projectUsers: prev.projectUsers.filter(
              (u) => !projectChanges.membersToKick.includes(u.projectUserId)
            ),
          }));
          setSnapshotProjectData((prev) => ({
            ...prev,
            projectUsers: prev.projectUsers.filter(
              (u) => !projectChanges.membersToKick.includes(u.projectUserId)
            ),
          }));
        })
        .catch((error) => {
          showToast(
            "Ошибка при удалении участников. Попробуйте снова",
            "error"
          );
          console.error("Ошибка удаления участников:", error);
        });
      promises.push(deleteMembersPromise);
    }

    await Promise.allSettled(promises);

    setProjectChanges({
      newProjectName: null,
      newProjectDescription: null,
      boardsToDelete: [],
      boardsToUpdate: [],
      membersToKick: [],
    });

    setIsEditMode(false);
  }, [
    projectChanges,
    projectData,
    initialProjectData,
    snapshotProjectData,
    showToast,
    deleteWithAuth,
    patchWithAuth,
  ]);

  const toggleEditMode = useCallback(() => {
    if (!isEditMode) {
      if (projectData) {
        setSnapshotProjectData(JSON.parse(JSON.stringify(projectData)));
      }
    } else {
      resetChanges();
    }
    setIsEditMode((prev) => !prev);
  }, [isEditMode, resetChanges, projectData]);

  const setProjectDataAndInitial = useCallback((data) => {
    setProjectData(data);
    if (data) {
      setInitialProjectData(data);
      setSnapshotProjectData(data);
    }
  }, []);

  const value = {
    projectData,
    setProjectData: setProjectDataAndInitial,
    setProjectDataUI,
    loading,
    setLoading,
    showToast,
    updateBoards,
    isFilteredByMember,
    toggleFilter,
    isEditMode,
    toggleEditMode,
    resetChanges,
    applyChanges,
    projectChanges,
    updateProjectNameChange,
    updateProjectDescriptionChange,
    currentUserId,
    addBoardToDelete,
    addBoardToUpdateName,
    addMemberToKick,
    checkBoardExistsInChanges,
    isOwner,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject должен использоваться внутри ProjectProvider");
  }
  return context;
};
