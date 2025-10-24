import React from "react";

const MONTHS = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек",
];
const SKELETON_ROWS_COUNT = 5;
const ROW_HEIGHT = 75;

const ProjectDescriptionSkeleton = () => (
  <div className="project-description-container">
    <div className="skeleton-line desc-skeleton-short"></div>
    <div className="skeleton-line"></div>
    <div className="skeleton-line"></div>
    <div className="skeleton-line desc-skeleton-medium"></div>
  </div>
);

const GanttChartSkeleton = () => {
  const fixedBoardsContentHeight =
    SKELETON_ROWS_COUNT * ROW_HEIGHT + ROW_HEIGHT;

  const skeletonRows = Array(SKELETON_ROWS_COUNT)
    .fill(0)
    .map((_, index) => {
      const randomWidth = Math.floor(Math.random() * 50) + 30;
      const randomLeft = Math.floor(Math.random() * (100 - randomWidth));
      const topPosition = index * ROW_HEIGHT + 10;

      return (
        <div
          key={index}
          className="gantt-board-row gantt-skeleton-bar"
          style={{
            left: `${randomLeft}%`,
            width: `${randomWidth}%`,
            top: `${topPosition}px`,
            height: `60px`,
          }}
        >
          <div className="gantt-skeleton-text"></div>
        </div>
      );
    });

  return (
    <div className="gantt-chart-wrapper">
      <div className="gantt-year-selector">
        <div className="gantt-skeleton-year-select"></div>
      </div>

      <div className="gantt-main-container">
        <div className="gantt-header">
          {MONTHS.map((month) => (
            <div key={month} className="gantt-month-column">
              <div className="gantt-month-column-text gantt-skeleton-month-text">
                {month}
              </div>
            </div>
          ))}
        </div>

        <div className="gantt-timeline-container">
          <div
            className="gantt-boards-content"
            style={{ height: `${fixedBoardsContentHeight}px` }}
          >
            {skeletonRows}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function InfoSkeleton() {
  return (
    <div className="info-container">
      <ProjectDescriptionSkeleton />
      <GanttChartSkeleton />
    </div>
  );
}
