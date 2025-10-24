import React, { useState, useEffect } from "react";
import styles from "./Form.module.css";
import api from "../../../../service/apiService.js";
import { useNavigate } from "react-router-dom";
import "../../../../service/errors.css";

const handleLogin = async (
  login,
  password,
  navigate,
  setError,
  setPassword
) => {
  try {
    const response = await api.post("/auth/login", {
      UserEmail: login,
      UserPassword: password,
    });

    localStorage.setItem("token", response.data.accessToken);
    navigate("/home");
  } catch (err) {
    setPassword("");
    const status = err.response?.status;
    switch (status) {
      case 400:
        setError("Некорректные данные. Пожалуйста, проверьте логин и пароль");
        break;
      case 500:
        setError("Внутренняя ошибка сервера. Пожалуйста, попробуйте позже");
        break;
      default:
        setError("Неправильный логин или пароль");
    }
  }
};

const Form = ({ isRegister }) => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Значение токена из localStorage:", token);
    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (isRegister) {
      if (password !== passwordConfirm) {
        setError("Пароли не совпадают");
        return;
      }
      try {
        await api.post("/auth/register", {
          UserEmail: login,
          UserPassword: password,
        });
        alert("Регистрация завершена!");
      } catch (err) {
        const status = err.response?.status;
        switch (status) {
          case 400:
            setError("Некорректные данные. Проверьте правильность заполнения");
            break;
          case 409:
            setError("Пользователь с таким email уже существует");
            break;
          case 500:
            setError("Внутренняя ошибка сервера. Пожалуйста, попробуйте позже");
            break;
          default:
            setError(
              "Произошла непредвиденная ошибка. Пожалуйста, попробуйте позже"
            );
        }
      }
    } else {
      try {
        await handleLogin(login, password, navigate, setError, setPassword);
      } catch (err) {
        console.error("Ошибка при входе:", err);
      }
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles["floating-label-group"]}>
        <input
          type="text"
          className={styles["profile-input"]}
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder=" "
          required
        />
        <label className={styles["floating-label"]}>Почта</label>
      </div>
      <div className={styles["floating-label-group"]}>
        <input
          type="password"
          className={styles["profile-input"]}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder=" "
          required
        />
        <label className={styles["floating-label"]}>Пароль</label>
      </div>
      {isRegister && (
        <div className={styles["floating-label-group"]}>
          <input
            type="password"
            className={styles["profile-input"]}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder=" "
            required
          />
          <label className={styles["floating-label"]}>Повторите пароль</label>
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
      <button type="submit" className={styles["profile-button"]}>
        {isRegister ? "Создать" : "Войти"}
      </button>
    </form>
  );
};

export default Form;
