import React from "react";
import { useProject } from "../../HallContext.jsx";
import BoardHeader from "./BoardHeader.jsx";
import BoardList from "./Board_list.jsx";
import "./Boards.css";
import BoardsSkeleton from "./BoardsSkeleton.jsx";

export default function Boards() {
  const { projectData, loading, isFilteredByMember } = useProject();

  const allBoards = projectData?.boards || [];
  const filteredBoards = isFilteredByMember
    ? allBoards.filter((board) => board.isMember)
    : allBoards;
  const boardsCount = filteredBoards.length;

  if (loading) {
    return <BoardsSkeleton />;
  }

  return (
    <div className="board-container">
      <BoardHeader boardsCount={boardsCount} />{" "}
      <BoardList
        boards={filteredBoards}
        loading={loading}
        projectId={projectData?.projectId}
      />{" "}
    </div>
  );
}
