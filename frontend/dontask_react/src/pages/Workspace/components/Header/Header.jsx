// src/pages/Workspace/components/Header/Header.jsx

import React from "react";
import "./Header.css";
import "../../../../fonts/fonts.css";

// Изменяем пропсы, чтобы принимать массив аватарок
const ProjectHeader = ({
  boardName,
  projectName,
  memberAvatars,
  defaultAvatarUrl,
  loading,
}) => {
  const visibleAvatars = memberAvatars.slice(0, 5);
  // Логика showFallbackAvatar удалена по вашему запросу

  return (
    <header className="workspace-header">
      <div className="workspace-row">
        <div className="workspace-titles">
          {/* Показываем имя проекта и доски */}
          <h1 className="workspace-project-name">{projectName}</h1>
          <h2 className="workspace-board-name">{boardName}</h2>
        </div>
        <div className="workspace-user-avatar-container">
          {loading ? (
            <div className="avatar-placeholder">Загрузка аватарок...</div>
          ) : (
            <>
              {/* Рендерим аватарки участников. 
              Этот блок теперь отвечает за отображение аватаров, 
              даже если их всего один (текущий пользователь) */}
                           {" "}
              {visibleAvatars.map((avatar, index) => {
                // 🎯 Теперь avatar.userAvatar будет содержать URL
                // console.log(`Avatar ${index} URL:`, avatar.userAvatar);
                return (
                  <img
                    key={index} // Используем прямое поле, так как оно теперь корректно передается
                    src={avatar.userAvatar || defaultAvatarUrl}
                    alt={avatar.alt || "Участник"}
                    className="workspace-user-avatar"
                  />
                );
              })}
              {/* Отображение счетчика "+N" */}
              {memberAvatars.length > visibleAvatars.length && (
                <div className="avatar-count-more">
                  +{memberAvatars.length - visibleAvatars.length}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default ProjectHeader;
