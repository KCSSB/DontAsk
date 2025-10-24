import React from "react";
import { Link } from "react-router-dom";
import "./StartWork.css";
import dontask_logo from "./dontask_logo.png";

export default function StartWork() {
  return (
    <div className="start-container">
      <div className="img-container">
        <img src={dontask_logo} alt="DONTASK" />
      </div>
      <h1 className="gradient-text">ОТ ГОРЯЩИХ СРОКОВ К ЧЕТКИМ ПЛАНАМ</h1>
      <p>Все необходимое для эффективной работы теперь в одном месте</p>
      <Link to="/auth/register">
        <button>Начать работу</button>
      </Link>
    </div>
  );
}
