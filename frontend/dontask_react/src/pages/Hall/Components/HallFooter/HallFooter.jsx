import React, { useState } from "react";
import { useProject } from "../../HallContext.jsx";
import { useToast } from "../../../../components/Toast/ToastContext";
import MembersList from "./MembersList.jsx";
import "./HallFooter.css";
import people_icon from "./people_icon.png";
import edit_icon from "./edit_icon.png";
import confirmChanges_icon from "./confirmChanges_icon.png";
import resetChanges_icon from "./resetChanges_icon.png";

export default function HallFooter() {
  const {
    projectData,
    isEditMode,
    toggleEditMode,
    resetChanges,
    applyChanges,
    isOwner,
  } = useProject();

  const [showMembersList, setShowMembersList] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const showToast = useToast();

  const handleEditClick = () => {
    toggleEditMode();
    setShowMembersList(true);
    setIsCreating(false);
    showToast("Вы вошли в режим редактирования", "info");
  };

  const handleConfirmClick = () => {
    console.log("Сохранение изменений...");
    applyChanges();
  };

  const handleResetClick = () => {
    console.log("Отмена изменений...");
    resetChanges();
  };

  const handleMembersClick = () => {
    if (isEditMode) return;

    setIsCreating(false);
    setShowMembersList((prev) => !prev);
  };

  return (
    <div className="hall-footer-container">
      <div className={`hall-mode-wrapper ${showMembersList ? "active" : ""}`}>
        <div className="hall-mode-container">
          {isOwner && isEditMode ? (
            <>
              <button className="hall-mode-button" onClick={handleConfirmClick}>
                <img src={confirmChanges_icon} alt="CONFIRM" />
              </button>
              <button className="hall-mode-button" onClick={handleResetClick}>
                <img src={resetChanges_icon} alt="RESET" />
              </button>
            </>
          ) : (
            isOwner && (
              <button
                className={`hall-mode-button ${isEditMode ? "active" : ""}`}
                onClick={handleEditClick}
              >
                <img src={edit_icon} alt="EDIT" />
              </button>
            )
          )}
          <button
            className={`hall-mode-button ${showMembersList ? "active" : ""} ${
              isEditMode ? "disabled-member" : ""
            }`}
            onClick={handleMembersClick}
            disabled={isEditMode}
          >
            <img src={people_icon} alt="MEMBERS" />
          </button>
        </div>
        {projectData && (
          <MembersList
            members={projectData.projectUsers}
            isCreating={isCreating}
            setIsCreating={setIsCreating}
            isEditMode={isEditMode}
          />
        )}
      </div>
    </div>
  );
}
