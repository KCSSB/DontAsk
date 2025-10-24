// Welcome.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getFirstNameFromToken } from "../../../../service/api";
import "./Welcome.css";
import welcome_photo from "./welcome_logo.png";
import arrow_right_logo from "./arrow_right_logo.png";

export default function Welcome() {
  const [firstName, setFirstName] = useState("User");
  const [lastProjectId, setLastProjectId] = useState(null);

  useEffect(() => {
    const name = getFirstNameFromToken();
    if (name) {
      setFirstName(name);
    }

    const storedProjectId = localStorage.getItem("lastVisitedProjectId");
    if (storedProjectId) {
      setLastProjectId(storedProjectId);
    }
  }, []);

  const hasLastProject = !!lastProjectId;
  const linkPath = hasLastProject ? `/hall/${lastProjectId}` : null;
  const containerClass = `welcome-container ${
    !hasLastProject ? "disabled" : ""
  }`;

  const WelcomeComponent = hasLastProject ? Link : "div";

  return (
    <WelcomeComponent to={linkPath} className="welcome-link">
      <div className={containerClass}>
        <div className="title-container">
          {/* Условный рендеринг заголовка */}
          <h5 className="welcome-title">
            {hasLastProject
              ? `С возвращением, ${firstName}!`
              : `Добро пожаловать, ${firstName}!`}
          </h5>
          {/* Условный рендеринг второй строки и стрелки */}
          {hasLastProject && (
            <div className="row">
              <h5 className="welcome-paragraph">
                На чем Вы остановились в прошлый раз?
              </h5>
              <img src={arrow_right_logo} alt="ARROW_RIGHT" />
            </div>
          )}
        </div>
        <div className="logo-container">
          <img src={welcome_photo} alt="WELCOME" />
        </div>
      </div>
    </WelcomeComponent>
  );
}
