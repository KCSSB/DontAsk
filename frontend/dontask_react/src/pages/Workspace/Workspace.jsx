// src/pages/Workspace/Workspace.jsx - ИСПРАВЛЕННЫЙ КОД

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import default_avatar from "./components/Header/avatar.png";
import Header from "./components/Header/Header.jsx";
import Navbar from "../Home/components/Navbar/Navbar.jsx";
import Card from "./components/Card/Card.jsx";
import { WorkspaceProvider, useWorkspace } from "./WorkspaceContext.jsx";
import {
  WorkspaceEditProvider,
  useWorkspaceEdit,
} from "./WorkspaceEditContext.jsx";
import WorkspaceFooter from "./WorkspaceFooter.jsx";
import "./Workspace.css";
import "../../fonts/fonts.css";

// --- Вспомогательный компонент для отображения контента (Остается без изменений) ---
const WorkspaceContent = ({ defaultAvatarUrl }) => {
  const {
    loading,
    projectName,
    boardName,
    members,
    projectId: projectIdFromContext,
    lists,
  } = useWorkspace();

  // 🔑 Здесь useWorkspace() и useWorkspaceEdit() будут работать корректно,
  // так как они оба обернуты в свои провайдеры в родительском компоненте
  const { isEditMode } = useWorkspaceEdit();

  const { projectId, boardId } = useParams(); // Предполагаем, что Workspace использует эти параметры

  // 🔑 Эффект для сохранения последнего посещенного проекта и доски
  useEffect(() => {
    const finalProjectId = projectIdFromContext;

    if (finalProjectId && boardId) {
      localStorage.setItem("lastVisitedWorkspaceProjectId", finalProjectId);
      localStorage.setItem("lastVisitedWorkspaceBoardId", boardId);
      console.log(
        `[Workspace] Сохранен последний путь: ${finalProjectId}/${boardId}`
      );
    }
  }, [projectIdFromContext, boardId]);

  const memberAvatars = members.map((member) => ({
    url: member.userImageUrl,
    alt: member.userName,
  }));

  if (loading) {
    return (
      <div className="workspace-main-content">
        <Header
          projectType="Загрузка..."
          projectName="Загрузка..."
          memberAvatars={[]}
          defaultAvatarUrl={defaultAvatarUrl}
          loading={true}
        />
        <div className="loading-state">Загрузка данных рабочей области...</div>
      </div>
    );
  }

  return (
    <div className="workspace-main-content">
      <Header
        projectName={projectName}
        boardName={boardName}
        memberAvatars={memberAvatars}
        defaultAvatarUrl={defaultAvatarUrl}
        loading={false}
      />
      <Card />
      <WorkspaceFooter />
    </div>
  );
};

// --- Основной компонент Workspace ---
export default function Workspace() {
  return (
    <div className="workspace-container">
      <Navbar />
      {/* 🔑 ИСПРАВЛЕНО: WorkspaceProvider теперь снаружи */}
      <WorkspaceProvider>
        {/* 🔑 WorkspaceEditProvider теперь внутри,
           и может безопасно вызывать useWorkspace() */}
        <WorkspaceEditProvider>
          <WorkspaceContent defaultAvatarUrl={default_avatar} />
        </WorkspaceEditProvider>
      </WorkspaceProvider>
    </div>
  );
}
