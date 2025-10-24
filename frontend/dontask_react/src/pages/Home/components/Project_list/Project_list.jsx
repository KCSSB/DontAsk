import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Project_list.css";
import ProjectSkeleton from "./Project_list_skeleton";
import {
  fetchWithAuth,
  postWithAuth,
  getAvatarFromToken,
} from "../../../../service/api";
import { useToast } from "../../../../components/Toast/ToastContext";
import people_logo from "./people_logo.png";
import create_logo from "./create_icon.png";
import load_logo from "./load_logo.png";
import default_avatar from "../Navbar/avatar.png";

export default function Project_list() {
  const showToast = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectImage, setProjectImage] = useState(null);
  const fileInputRef = useRef(null);
  const [imageLoadName, setImageLoadName] = useState("");
  const [leaderAvatar, setLeaderAvatar] = useState(default_avatar);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectsAndAvatar = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const payload = getAvatarFromToken(token);
          if (payload && payload.Avatar) {
            setLeaderAvatar(payload.Avatar);
          }
        }

        console.log("Начинаем отправку запроса к API...");
        const data = await fetchWithAuth("/getpages/GetHomePage");
        console.log("Данные списка проектов получены:", data);
        setProjects(data.summaryProject || []);
      } catch (err) {
        console.error("Ошибка при получении проектов:", err);
        showToast(
          "Не удалось загрузить проекты. Пожалуйста, попробуйте снова.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProjectsAndAvatar();
  }, [showToast]);

  const handleCreateProjectClick = () => {
    setIsCreating(true);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProjectImage(file);
      setImageLoadName(file.name);
    } else {
      setImageLoadName("");
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();

    if (!projectName.trim()) {
      showToast("Название проекта не может быть пустым.", "error");
      return;
    }
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("ProjectName", projectName);
      if (projectImage) {
        formData.append("Image", projectImage);
      }

      const newProject = await postWithAuth(
        "/Projects/CreateProject",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Проект успешно создан:", newProject);

      setProjects((prevProjects) => [...prevProjects, newProject]);
      setIsCreating(false);
      setProjectName("");
      setProjectImage(null);
      setImageLoadName("");

      showToast("Проект успешно создан!", "success");
    } catch (err) {
      console.error(
        "Ошибка при создании проекта:",
        err.response || err.message
      );
      showToast("Ошибка при создании проекта. Попробуйте снова.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProjectCardClick = async (projectId) => {
    try {
      const projectData = await fetchWithAuth(
        `/getpages/GetHallPage/${projectId}`
      );
      console.log("Данные проекта получены:", projectData);
      navigate(`/hall/${projectId}`);
    } catch (err) {
      console.error(
        `Ошибка при получении данных для проекта с ID ${projectId}:`,
        err
      );
      showToast(
        "Не удалось получить данные для проекта. Попробуйте снова",
        "error"
      );
    }
  };

  if (loading) {
    return (
      <div className="project-list-container">
        <div className="project-list-wrapper">
          {[...Array(6)].map((_, index) => (
            <ProjectSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="project-list-container">
      <h5 className="project-title">Ваши проекты</h5>
      <div className="project-list-wrapper">
        {projects.map((project) => (
          <button
            key={project.projectId}
            className="project-card"
            onClick={() => handleProjectCardClick(project.projectId)}
          >
            <div className="card-top">
              {project.projectImageUrl ? (
                <img
                  src={project.projectImageUrl}
                  alt="Project Logo"
                  className="project-logo"
                />
              ) : (
                <img
                  src={
                    "https://ik.imagekit.io/3vhw2fukp/UsersAvatars/ProjectAvatar.jpg"
                  }
                  alt="default_project_logo"
                  className="project-logo"
                />
              )}
            </div>
            <div className="card-bottom">
              <div className="creator-info">
                <img
                  src={project.projectLeader.projectLeaderImageUrl}
                  alt="Leader Avatar"
                  className="creator-avatar"
                />
                <div className="text-info">
                  <h5>{project.projectName}</h5>
                  <p>{project.projectLeader.projectLeaderName}</p>
                </div>
              </div>
              <div className="people-count">
                <img src={people_logo} alt="People" className="people-logo" />
                <h6>{project.countProjectUsers}</h6>
              </div>
            </div>
          </button>
        ))}
        {isCreating ? (
          <form
            className="project-card create-project-card"
            onSubmit={handleCreateProject}
          >
            <div className="card-top">
              <button
                className="upload-button"
                onClick={handleUploadClick}
                type="button"
                disabled={isSubmitting}
              >
                <img src={load_logo} alt="LOAD" className="load-logo" />
                {imageLoadName || "Загрузить обложку проекта (необязательно)"}
              </button>
              <button
                className="create-button"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Создание..." : "Создать"}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </div>
            <div className="card-bottom">
              <div className="input-group floating-label-group">
                <input
                  type="text"
                  className="project-name-input"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <label className="floating-label">Название проекта</label>
              </div>
            </div>
          </form>
        ) : (
          <button
            className="project-card create-card"
            onClick={handleCreateProjectClick}
          >
            <img
              src={create_logo}
              alt="Create Project"
              className="create-project-logo"
            />
          </button>
        )}
      </div>
    </div>
  );
}
