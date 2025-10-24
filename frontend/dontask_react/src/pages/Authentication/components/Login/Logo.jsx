import React from "react";
import styles from "./Logo.module.css";
import dontask_logo from "./dontask_logo.png";

const Logo = () => (
  <div className={styles.imgcontainer}>
    <img src={dontask_logo} alt="DONTASK" />
  </div>
);

export default Logo;
