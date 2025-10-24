import React, { useEffect, useState } from "react";
import { useProject } from "../../HallContext.jsx";
import { useNavigate } from "react-router-dom";
import "./BoardHeader.css";
import filter_icon from "./filter_icon.png";
import board_icon from "./board_icon.png";

export default function BoardHeader({ boardsCount }) {
  const {
    projectData,
    loading,
    showToast,
    isFilteredByMember,
    toggleFilter,
    isEditMode,
    setProjectDataUI,
    updateProjectNameChange,
  } = useProject();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !projectData) {
      showToast(
        "Не удалось найти проект. Пожалуйста, попробуйте снова",
        "error"
      );
      const timer = setTimeout(() => {
        navigate("/home");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, projectData, navigate, showToast]);

  const handleProjectNameChange = (e) => {
    const newName = e.target.value;

    setProjectDataUI((prev) => ({
      ...prev,
      projectName: newName,
    }));

    updateProjectNameChange(newName);
  };

  const handleNoSave = (e) => {
    e.target.blur();
  };

  if (loading || !projectData) {
    return <div>Загрузка...</div>;
  }

  const handleFilterClick = () => {
    toggleFilter();
    showToast(
      isFilteredByMember
        ? "Показаны все доски"
        : "Показаны доски, в которых Вы состоите",
      "info"
    );
  };

  return (
    <div className="board-header-container">
      {isEditMode ? (
        <input
          type="text"
          className="project-title-input"
          value={projectData.projectName}
          onChange={handleProjectNameChange}
          onBlur={handleNoSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleNoSave(e);
          }}
        />
      ) : (
        <h5 className="project-title">{projectData.projectName}</h5>
      )}

      <div className="action-container">
        <div className="action-left-container">
          <h5 className="text-style">Доски</h5>
          <div className="board-counter">
            <img src={board_icon} alt="BOARDS" />
            <p>{boardsCount}</p>
          </div>
        </div>
        <div className="action-right-container">
          <button
            className={`filter-button ${isFilteredByMember ? "active" : ""}`}
            onClick={handleFilterClick}
          >
            <img src={filter_icon} alt="FILTER" />
          </button>
        </div>
      </div>
      <div className="separating-line"> </div>
    </div>
  );
}
