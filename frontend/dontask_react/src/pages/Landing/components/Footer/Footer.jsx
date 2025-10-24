import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import dontask_logo from "./dontask_logo.png";

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-left">
        <img src={dontask_logo} alt="DONTASK" className="footer-logo" />
        <Link to="/home">
          <button className="faq-button">FAQ</button>
        </Link>
      </div>
      <div className="footer-right">
        <p>bpestov@sfedu.ru</p>
        <p>+7 (989) 806-59-57</p>
      </div>
    </footer>
  );
}
