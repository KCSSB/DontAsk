import React from "react";
import "./Description.css";
import { features } from "../../data";

export default function Description() {
  return (
    <>
      <h2>ВСЕ ДЛЯ УДОБНОЙ РАБОТЫ КОМАНДЫ</h2>
      <ul className="description-container">
        {features.map((feature, index) => (
          <li key={index} className="feature-card">
            <img src={feature.logo} alt="LOGO" />
            <h3>{feature.title}</h3>
            <p className="p-style">{feature.description}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
