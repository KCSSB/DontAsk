import React, { useState, useMemo, useEffect } from "react";
import "./Gantt_chart.css";
import { useProject } from "../../HallContext.jsx"; // Импорт для подключения к контексту

const BOARD_COLORS = [
  "#8E8DFF",
  "#6868EE",
  "#EE6868",
  "#EEDB68",
  "#68EE68",
  "#EE68BB",
];

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

const BOARD_BAR_HEIGHT = 60;
const ROW_HEIGHT = 75;

/**
 * @param {string} dateString
 * @returns {Date|null}
 */
const parseDateString = (dateString) => {
  if (!dateString) return null;
  const parts = dateString.split("-").map((p) => parseInt(p, 10));
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
};

/**
 * @param {Date} date
 * @param {number} year
 * @returns {number}
 */
const getDayOfYear = (date, year) => {
  const jan1 = Date.UTC(year, 0, 1);
  const currentDateUTC = date.getTime();
  return Math.floor((currentDateUTC - jan1) / (1000 * 60 * 60 * 24));
};

const GanttBoard = ({ board, index, selectedYear }) => {
  const { boardName, dateOfStartWork, dateOfDeadline, progressBar } = board;

  if (!dateOfStartWork || !dateOfDeadline) return null;

  const topPosition = index * ROW_HEIGHT + 10;

  const color = BOARD_COLORS[index % BOARD_COLORS.length];
  const nonProgressColor = `${color}4D`;

  const startDate = parseDateString(dateOfStartWork);
  const deadlineDate = parseDateString(dateOfDeadline);
  if (!startDate || !deadlineDate) return null;

  const boardStartYear = startDate.getUTCFullYear();
  const boardEndYear = deadlineDate.getUTCFullYear();

  const isLeap = new Date(selectedYear, 1, 29).getMonth() === 1;
  const daysInYear = isLeap ? 366 : 365;

  let startDayOfYear;
  let endDayOfYear;

  if (boardStartYear > selectedYear) {
    return null;
  } else if (boardStartYear < selectedYear) {
    startDayOfYear = 0;
  } else {
    startDayOfYear = getDayOfYear(startDate, selectedYear);
  }

  if (boardEndYear < selectedYear) {
    return null;
  } else if (boardEndYear > selectedYear) {
    endDayOfYear = daysInYear;
  } else {
    // ВАША ОРИГИНАЛЬНАЯ ЛОГИКА
    endDayOfYear = getDayOfYear(deadlineDate, selectedYear) + 1;
  }

  const widthInDays = endDayOfYear - startDayOfYear;
  if (widthInDays <= 0) return null;

  // ВАША ОРИГИНАЛЬНАЯ ЛОГИКА
  const left = (startDayOfYear / daysInYear) * 100 + 1.2;   
  const width = (widthInDays / daysInYear) * 100;

  const formatMonthDay = (date) => {
    return `${String(date.getUTCDate()).padStart(2, "0")}.${String(
      date.getUTCMonth() + 1
    ).padStart(2, "0")}`;
  };

  const datesDisplay = `${formatMonthDay(startDate)} - ${formatMonthDay(
    deadlineDate
  )}`;

  const progressWidth = progressBar > 0 ? `${progressBar}%` : `0%`;

  const showNonProgressText = progressBar < 40;

  return (
    <div
      className="gantt-board-row"
      style={{
        left: `${left}%`,
        width: `${width}%`,
        top: `${topPosition}px`,
        height: `${BOARD_BAR_HEIGHT}px`,
        backgroundColor: nonProgressColor,
      }}
      title={`${boardName} (${datesDisplay})`}
    >
      {showNonProgressText && (
        <div className="gantt-non-progress-text-container">
          <p className="gantt-board-name light-text">{boardName}</p>
          <p className="gantt-board-dates light-text">{datesDisplay}</p>
        </div>
      )}
      <div
        className="gantt-progress-bar"
        style={{
          width: progressWidth,
          backgroundColor: color,
        }}
      >
        {progressBar >= 40 && (
          <>
            <p className="gantt-board-name dark-text">{boardName}</p>
            <p className="gantt-board-dates dark-text">{datesDisplay}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default function Gantt_chart() {
  const { projectData } = useProject();
  const boards = projectData?.boards || []; // Получаем доски с бэка

  const currentYear = new Date().getFullYear();

  const allBoardYears = useMemo(() => {
    const years = new Set();
    boards.forEach((b) => {
      if (b.dateOfStartWork)
        years.add(parseDateString(b.dateOfStartWork).getUTCFullYear());
      if (b.dateOfDeadline)
        years.add(parseDateString(b.dateOfDeadline).getUTCFullYear());
    });
    return Array.from(years).sort();
  }, [boards]);

  const availableYears = useMemo(() => {
    const years = new Set(allBoardYears);

    years.add(currentYear);

    return Array.from(years)
      .filter((y) => y >= 2000 && y < 2100)
      .sort();
  }, [allBoardYears, currentYear]);

  // Вычисляем initialYear на основе данных с бэка
  const initialYear = boards.some(
    (b) =>
      (b.dateOfStartWork &&
        parseDateString(b.dateOfStartWork).getUTCFullYear() === currentYear) ||
      (b.dateOfDeadline &&
        parseDateString(b.dateOfDeadline).getUTCFullYear() === currentYear)
  )
    ? currentYear
    : availableYears.length > 0
    ? availableYears[0]
    : 2025; // Если нет досок, берем 2025, как было в моках

  const [selectedYear, setSelectedYear] = useState(initialYear);

  // Обновляем selectedYear, если initialYear изменился после загрузки данных
  useEffect(() => {
    if (initialYear !== selectedYear) {
      setSelectedYear(initialYear);
    }
  }, [initialYear]);

  const maxRowCount = useMemo(() => {
    let max = 0;

    const yearsToCheck = new Set([
      ...allBoardYears,
      currentYear,
      currentYear + 1,
    ]);

    yearsToCheck.forEach((year) => {
      const count = boards.filter((b) => {
        if (!b.dateOfStartWork || !b.dateOfDeadline) return false;
        const startYear = parseDateString(b.dateOfStartWork).getUTCFullYear();
        const endYear = parseDateString(b.dateOfDeadline).getUTCFullYear();
        return startYear <= year && endYear >= year;
      }).length;
      max = Math.max(max, count);
    });

    return max;
  }, [allBoardYears, currentYear, boards]);

  const fixedBoardsContentHeight = maxRowCount * ROW_HEIGHT + ROW_HEIGHT;

  const monthStartPositions = useMemo(() => {
    const positions = [];
    const daysInYear =
      new Date(selectedYear, 1, 29).getMonth() === 1 ? 366 : 365;

    for (let month = 1; month < 12; month++) {
      const firstDayOfMonth = new Date(Date.UTC(selectedYear, month, 1));
      const dayOfYear = getDayOfYear(firstDayOfMonth, selectedYear);

      const position = (dayOfYear / daysInYear) * 100;
      positions.push(position);
    }
    return positions;
  }, [selectedYear]);

  const todayPosition = useMemo(() => {
    const today = new Date();
    const currentYearCheck = today.getFullYear();

    if (currentYearCheck !== selectedYear) return -1;

    const todayUTC = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    );
    const dayOfYear = getDayOfYear(todayUTC, selectedYear);
    const daysInYear =
      new Date(selectedYear, 1, 29).getMonth() === 1 ? 366 : 365;

    return (dayOfYear / daysInYear) * 100;
  }, [selectedYear]);

  const currentMonthIndex =
    new Date().getFullYear() === selectedYear ? new Date().getMonth() : -1;

  const renderedBoards = boards
    .filter((b) => b.dateOfStartWork && b.dateOfDeadline)
    .filter((board) => {
      const startYear = parseDateString(board.dateOfStartWork).getUTCFullYear();
      const endYear = parseDateString(board.dateOfDeadline).getUTCFullYear();

      return startYear <= selectedYear && endYear >= selectedYear;
    });

  return (
    <div className="gantt-chart-wrapper">
      <div className="gantt-year-selector">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="gantt-main-container">
        <div className="gantt-header">
          {MONTHS.map((month, index) => (
            <div
              key={month}
              className={`gantt-month-column ${
                index === currentMonthIndex ? "current-month" : ""
              }`}
            >
              <p className="gantt-month-column-text">{month}</p>
            </div>
          ))}
        </div>
        {monthStartPositions.map((position, index) => (
          <div
            key={`vline-${index}`}
            className="gantt-month-line"
            style={{ left: `${position}%` }}
          ></div>
        ))}
        {todayPosition !== -1 && (
          <div
            className="gantt-today-line"
            style={{ left: `${todayPosition}%` }}
          ></div>
        )}
        <div className="gantt-timeline-container scrollbar-fixed">
          <div
            className="gantt-boards-content"
            style={{
              height: `${fixedBoardsContentHeight}px`,
            }}
          >
            {renderedBoards.map((board, index) => (
              <GanttBoard
                key={board.boardId}
                board={board}
                index={index}
                selectedYear={selectedYear}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
