import React from "react";
import "./Steps.css";
import { steps } from "../../data";

export default function Steps() {
  return (
    <div className="steps-container">
      <h2 className="h2-style-steps">НАЧИНАЙТЕ РАБОТАТЬ ЗА 3 ПРОСТЫХ ШАГА</h2>
      <div className="steps-columns">
        <div className="steps-logos">
          {steps.map((step, idx) => (
            <div className="steps-logo-wrapper" key={idx}>
              <img src={step.logo} alt={step.title} />
            </div>
          ))}
        </div>
        <div className="steps-descriptions">
          {steps.map((step, idx) => (
            <div className="steps-description" key={idx}>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
