// WorkspaceFooter.jsx (Новый файл для футера)

import React from "react";
import { useWorkspaceEdit } from "./WorkspaceEditContext.jsx";
import "./WorkspaceFooter.css";
import edit_icon from "./edit_icon.png";
import confirmChanges_icon from "./confirmChanges_icon.png";
import resetChanges_icon from "./resetChanges_icon.png";

const WorkspaceFooter = () => {
  const context = useWorkspaceEdit();
  const { isEditMode, toggleEditMode, applyChanges, resetChanges } =
    useWorkspaceEdit();

  return (
    <div className="workspace-footer-container">
      <div className="edit-mode-toggle">
        {isEditMode ? (
          // РЕЖИМ РЕДАКТИРОВАНИЯ
          <div className="edit-mode-controls">
            <button
              className="edit-button apply-button"
              onClick={applyChanges}
              title="Применить изменения"
            >
              <img
                src={confirmChanges_icon}
                alt="Применить"
                className="edit-icon-img"
              />
            </button>
            <button
              className="edit-button cancel-button"
              onClick={resetChanges}
              title="Отменить изменения"
            >
              <img
                src={resetChanges_icon}
                alt="Отменить"
                className="edit-icon-img"
              />
            </button>
          </div>
        ) : (
          <div className="normal-mode-controls">
            <button
              className="edit-button enter-edit-button"
              onClick={toggleEditMode}
              title="Войти в режим редактирования"
            >
              <img
                src={edit_icon}
                alt="Редактировать"
                className="edit-icon-img"
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceFooter;
