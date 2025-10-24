import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./Project_list.css";

const ProjectSkeleton = () => {
  return (
    <div className="project-card" style={{ marginTop: "1rem" }}>
      <Skeleton height={250} />
      <div className="card-bottom">
        <div className="creator-info">
          <Skeleton circle={true} height={40} width={40} />
          <div className="text-info">
            <Skeleton count={1} />
            <Skeleton count={1} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSkeleton;
