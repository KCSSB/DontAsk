import React from "react";
import { Link } from "react-router-dom";
import "./Demo.css";

export default function Demo() {
  return (
    <div className="demo-container">
      <h2 className="h2-style-demo">УСКОРЬТЕ РАБОТУ В ОДИН КЛИК</h2>
      <Link to="/auth/register">
        <button>Попробовать Демо</button>
      </Link>
    </div>
  );
}
