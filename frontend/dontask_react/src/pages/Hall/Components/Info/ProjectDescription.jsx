import React from "react";
import { useProject } from "../../HallContext.jsx";
import "./ProjectDescription.css";

export default function ProjectDescription() {
  const {
    projectData,
    loading,
    isEditMode,
    projectChanges,
    updateProjectDescriptionChange,
  } = useProject();

  if (loading) {
    return <div>Загрузка...</div>;
  }

  const currentDescription =
    isEditMode && projectChanges.newProjectDescription !== null
      ? projectChanges.newProjectDescription
      : projectData?.description || "Описание проекта отсутствует.";

  const descriptionValue =
    currentDescription === "Описание проекта отсутствует."
      ? ""
      : currentDescription;

  const handleDescriptionChange = (e) => {
    updateProjectDescriptionChange(e.target.value);
  };

  return (
    <div className="project-description-container">
      {isEditMode ? (
        <textarea
          className="project-description-textarea"
          value={descriptionValue}
          onChange={handleDescriptionChange}
          placeholder="Введите подробное описание проекта..."
        />
      ) : (
        <p style={{ whiteSpace: "pre-wrap" }}>{currentDescription}</p>
      )}
    </div>
  );
}
