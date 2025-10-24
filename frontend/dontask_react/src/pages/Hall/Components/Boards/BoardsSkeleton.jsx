import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const BoardListItemSkeleton = () => {
  return (
    <div
      className="board-list-item"
      style={{
        padding: "15px",
        borderRadius: "1.5rem",
        backgroundColor: "#f9f9f9",
      }}
    >
      <Skeleton height={20} width="60%" style={{ marginBottom: "3rem" }} />
      <Skeleton height={14} width="85%" />
      <div
        style={{
          marginTop: "15px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Skeleton height={30} width={70} style={{ borderRadius: "1.5rem" }} />
      </div>
    </div>
  );
};

const BoardsSkeleton = () => {
  return (
    <div className="board-container" style={{ padding: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <Skeleton height={32} width={250} />
          <Skeleton height={14} width={100} />
        </div>
        <Skeleton height={40} width={160} style={{ borderRadius: "1.5rem" }} />
      </div>

      <div
        className="board-list-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {[...Array(6)].map((_, index) => (
          <BoardListItemSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

export default BoardsSkeleton;
