import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import dontask_logo from "./dontask_logo.png";

export default function Header() {
  const navigate = useNavigate();
  return (
    <div className="header-container">
      <div className="header-left">
        <img src={dontask_logo} alt="DONTASK" />
        <h1>DONTASK</h1>
      </div>
      <div className="header-right">
        <Link to="/auth/login">
          <button>Войти</button>
        </Link>
      </div>
    </div>
  );
}
