import React from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import Logo from "./Logo";
import Title from "./Title";
import Form from "./Form";
import Footer from "./Footer";
import arrow_logo from "./arrow_logo.png";

const Login = () => (
  <div className={styles.wrapper}>
    <Link to="/">
      <button className={styles.backButton}>
        <img src={arrow_logo} alt="BACK" />
      </button>
    </Link>
    <div className={styles.container}>
      <Logo />
      <Title text="ВХОД" />
      <Form />
    </div>
    <Footer />
  </div>
);

export default Login;
