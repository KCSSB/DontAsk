import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchWithAuth,
  patchWithAuth,
  refreshAndSetToken,
  autoCropImageToSquare,
  postWithAuth,
  logout,
} from "../../../../service/api";
import { useToast } from "../../../../components/Toast/ToastContext";
import ProfileSkeleton from "./Profile_skeleton";
import "./Profile.css";
import default_avatar from "../../../Home/components/Navbar/avatar.png";
import load_image_logo from "./load_image_logo.png";
import copy_inviteId_logo from "./copy_inviteId_logo.png";
import edit_icon from "./edit_icon.png";
import confirmChanges_icon from "./confirmChanges_icon.png";
import resetChanges_icon from "./resetChanges_icon.png";
import hide_logo from "./hide_logo.png";
import show_logo from "./show_logo.png";

const isValidName = (name) => {
  const regex = /^[a-zA-Zа-яА-ЯёЁ\s'-]+$/;
  return regex.test(name);
};

export default function Profile() {
  const showToast = useToast();
  const navigate = useNavigate();

  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditingGeneralInfo, setIsEditingGeneralInfo] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [userAvatar, setUserAvatar] = useState(default_avatar);
  const [serverAvatar, setServerAvatar] = useState(default_avatar);
  const [selectedFile, setSelectedFile] = useState(null);
  const [croppedFile, setCroppedFile] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [inviteId, setInviteId] = useState("");
  const fileInputRef = useRef(null);
  const [gender, setGender] = useState("unknown");
  const [userEmail, setUserEmail] = useState("");
  const [initialData, setInitialData] = useState(null);

  const [isEditingSecurity, setIsEditingSecurity] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatNewPassword, setRepeatNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRepeatNewPassword, setShowRepeatNewPassword] = useState(false);

  const displayGender = (g) => {
    if (g === "male") return "Мужской";
    if (g === "female") return "Женский";
    return "Не указан";
  };

  const fetchSettingsPageData = async () => {
    try {
      setPageLoading(true);
      const data = await fetchWithAuth("/GetPages/GetSettingsPage");
      const avatarUrl = data.userAvatarUrl || default_avatar;
      setUserAvatar(avatarUrl);
      setServerAvatar(avatarUrl);
      setFirstName(data.firstUserName || "");
      setSecondName(data.lastUserName || "");
      setInviteId(data.inviteId || "");
      setInitialData(data);
      let initialGender;
      if (data.sex === 0) initialGender = "unknown";
      else if (data.sex === 1) initialGender = "male";
      else initialGender = "female";
      setGender(initialGender);
      setUserEmail(data.userEmail || "");
    } catch (err) {
      console.error("Ошибка при получении данных настроек:", err);
      showToast(
        "Не удалось загрузить данные. Пожалуйста, попробуйте снова.",
        "error"
      );
      setError("Не удалось загрузить данные. Пожалуйста, попробуйте снова.");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsPageData();
  }, []);

  const handleLoadClick = () => {
    if (isEditingGeneralInfo || isEditingSecurity) return;
    fileInputRef.current.click();
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserAvatar(URL.createObjectURL(file));
      setSelectedFile(file);
      setError(null);
      autoCropImageToSquare(file, (blob) => setCroppedFile(blob));
    }
  };
  const handleDeleteClick = () => {
    if (isEditingGeneralInfo || isEditingSecurity) return;
    setUserAvatar(serverAvatar);
    setSelectedFile(null);
    setCroppedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    showToast("Выбор изображения отменен", "info");
  };
  const handleUpload = async () => {
    if (isEditingGeneralInfo || isEditingSecurity) return;
    if (!croppedFile) {
      showToast("Пожалуйста, сначала выберите файл", "error");
      return;
    }
    setAvatarUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("File", croppedFile, "avatar.jpg");
    try {
      await postWithAuth("/User/UploadUserAvatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await refreshAndSetToken();
      window.dispatchEvent(new Event("tokenUpdated"));
      const newAvatarUrl = URL.createObjectURL(croppedFile);
      setUserAvatar(newAvatarUrl);
      setServerAvatar(newAvatarUrl);
      setSelectedFile(null);
      setCroppedFile(null);
      showToast("Аватар успешно загружен!", "success");
    } catch (err) {
      console.error("Ошибка при загрузке аватара:", err);
      showToast("Не удалось загрузить аватар. Попробуйте снова", "error");
      setError("Не удалось загрузить аватар. Попробуйте снова.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedSecondName = secondName.trim();

    if (!trimmedFirstName) {
      showToast("Имя не может быть пустым!", "error");
      return;
    }
    if (!trimmedSecondName) {
      showToast("Фамилия не может быть пустой!", "error");
      return;
    }

    if (!isValidName(trimmedFirstName) || !isValidName(trimmedSecondName)) {
      showToast(
        "Имя и фамилия могут содержать только буквы, пробелы, дефисы и апострофы!",
        "error"
      );
      return;
    }

    if (initialData) {
      let currentSexValue;
      if (gender === "unknown") currentSexValue = 0;
      else if (gender === "male") currentSexValue = 1;
      else currentSexValue = 2;
      const isFirstNameChanged =
        firstName.trim() !== (initialData.firstUserName || "").trim();
      const isSecondNameChanged =
        secondName.trim() !== (initialData.lastUserName || "").trim();
      const isGenderChanged = currentSexValue !== initialData.sex;
      if (!isFirstNameChanged && !isSecondNameChanged && !isGenderChanged) {
        showToast("Вы не внесли никаких изменений", "info");
        setIsEditingGeneralInfo(false);
        return;
      }
    }
    setIsSavingChanges(true);
    setError(null);
    try {
      let sexValue;
      if (gender === "unknown") sexValue = 0;
      else if (gender === "male") sexValue = 1;
      else sexValue = 2;
      const payload = {
        firstUserName: firstName.trim(),
        lastUserName: secondName.trim(),
        sex: sexValue,
      };
      await patchWithAuth("/User/UpdateGeneralUserInfo", payload);
      setInitialData((prev) => ({
        ...prev,
        firstUserName: firstName.trim(),
        lastUserName: secondName.trim(),
        sex: sexValue,
      }));
      showToast("Изменения успешно сохранены!", "success");
      await refreshAndSetToken();
      window.dispatchEvent(new Event("tokenUpdated"));
      setIsEditingGeneralInfo(false);
    } catch (err) {
      console.error("Ошибка при сохранении изменений:", err);
      showToast("Не удалось сохранить изменения. Попробуйте снова", "error");
    } finally {
      setIsSavingChanges(false);
    }
  };

  const handleCopyInviteId = () => {
    if (isEditingGeneralInfo || isEditingSecurity) return;
    navigator.clipboard.writeText(inviteId);
    showToast("ID скопирован в буфер обмена!", "success");
  };

  const handleResetChanges = () => {
    if (initialData) {
      setFirstName(initialData.firstUserName || "");
      setSecondName(initialData.lastUserName || "");
      let initialGender;
      if (initialData.sex === 0) initialGender = "unknown";
      else if (initialData.sex === 1) initialGender = "male";
      else initialGender = "female";
      setGender(initialGender);
      setError(null);
      showToast("Изменения отменены", "info");
      setIsEditingGeneralInfo(false);
    }
  };

  const handleLogout = async () => {
    if (isEditingGeneralInfo || isEditingSecurity) return;
    try {
      await logout();
    } catch (err) {
      console.error("Ошибка при выходе из системы:", err);
      showToast(
        "Не удалось полностью выйти из системы. Попробуйте снова",
        "error"
      );
    } finally {
      localStorage.removeItem("token");
      navigate("/auth/login");
    }
  };

  const handleEditSecurityClick = () => {
    setIsEditingSecurity(true);
  };

  const handleCancelPasswordChange = () => {
    setIsEditingSecurity(false);
    setOldPassword("");
    setNewPassword("");
    setRepeatNewPassword("");
  };

  const handleUpdatePassword = async (event) => {
    event.preventDefault();

    if (!oldPassword || !newPassword || !repeatNewPassword) {
      showToast("Все поля обязательны для заполнения!", "error");
      return;
    }
    if (newPassword !== repeatNewPassword) {
      showToast("Новые пароли не совпадают!", "error");
      return;
    }
    if (newPassword === oldPassword) {
      showToast("Новый пароль не может совпадать со старым!", "error");
      return;
    }

    if (newPassword.length < 6) {
      showToast("Новый пароль должен быть не короче 6 символов!", "error");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const payload = { oldPassword: oldPassword, newPassword: newPassword };
      await patchWithAuth("/User/ChangePassword", payload);
      showToast("Пароль успешно изменен!", "success");
      handleCancelPasswordChange();
    } catch (err) {
      console.error("Ошибка при смене пароля:", err);
      showToast(
        "Не удалось изменить пароль. Проверьте верность текущего и нового паролей!",
        "error"
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (pageLoading) {
    return <ProfileSkeleton />;
  }

  const isEditing = isEditingGeneralInfo || isEditingSecurity;
  const isNameFieldDisabled = !isEditingGeneralInfo;

  return (
    <div className="profile-container-wrapper">
      <div className="profile-container">
        <div className="profile-header-group">
          <p className="profile-title-text">Аватар</p>
          <div className="profile-separation-line"></div>
          <div className="profile-avatar-line-container">
            <div className="profile-avatar-container">
              <img src={userAvatar} alt="AVATAR" className="profile-avatar" />
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <button
                className="load-avatar-button"
                onClick={handleLoadClick}
                disabled={isEditing}
              >
                <img src={load_image_logo} alt="LOAD" />
              </button>
            </div>
            <button
              className="profile-button"
              onClick={handleUpload}
              disabled={!croppedFile || avatarUploading || isEditing}
            >
              {avatarUploading ? "Загрузка..." : "Загрузить"}
            </button>
            <button
              className="profile-button delete"
              onClick={handleDeleteClick}
              disabled={isEditing}
            >
              Отменить
            </button>
          </div>
        </div>

        <div className="profile-title-container">
          <p className="profile-title-text">Данные профиля</p>
          {!isEditingGeneralInfo ? (
            <button
              className="profile-edit-button"
              onClick={() => setIsEditingGeneralInfo(true)}
              disabled={isSavingChanges || isEditingSecurity}
            >
              <img src={edit_icon} alt="EDIT" />
            </button>
          ) : (
            <div className="edit-buttons-group">
              <button
                className="profile-edit-button confirm-button"
                onClick={handleSaveChanges}
                disabled={isSavingChanges}
              >
                <img src={confirmChanges_icon} alt="CONFIRM" />
              </button>
              <button
                className="profile-edit-button reset-button"
                onClick={handleResetChanges}
                disabled={isSavingChanges}
              >
                <img src={resetChanges_icon} alt="RESET" />
              </button>
            </div>
          )}
        </div>
        <div className="profile-separation-line"></div>
        <div className="profile-data-container">
          <div className="profile-data-row">
            <div className="floating-label-group">
              <input
                type="text"
                className={`profile-field ${
                  isNameFieldDisabled ? "read-only-field" : ""
                }`}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                readOnly={isNameFieldDisabled}
              />
              <label className="floating-label">Имя</label>
            </div>

            {!isEditingGeneralInfo ? (
              <div className="floating-label-group">
                <input
                  type="text"
                  className="profile-field read-only-field const-field"
                  value={displayGender(gender)}
                  readOnly
                />
                <label className="floating-label">Пол</label>
              </div>
            ) : (
              <div className="gender-selection-container">
                <label className="info-label">Пол</label>
                <div className="gender-buttons-group">
                  <button
                    className={`gender-button ${
                      gender === "unknown" ? "active" : ""
                    }`}
                    onClick={() => setGender("unknown")}
                  >
                    Не указан
                  </button>
                  <button
                    className={`gender-button ${
                      gender === "male" ? "active" : ""
                    }`}
                    onClick={() => setGender("male")}
                  >
                    Мужской
                  </button>
                  <button
                    className={`gender-button ${
                      gender === "female" ? "active" : ""
                    }`}
                    onClick={() => setGender("female")}
                  >
                    Женский
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="profile-data-row">
            <div className="floating-label-group">
              <input
                type="text"
                className={`profile-field ${
                  isNameFieldDisabled ? "read-only-field" : ""
                }`}
                value={secondName}
                onChange={(e) => setSecondName(e.target.value)}
                readOnly={isNameFieldDisabled}
              />
              <label className="floating-label">Фамилия</label>
            </div>

            {!isEditingGeneralInfo ? (
              <div className="floating-label-group">
                <input
                  type="text"
                  className="profile-field read-only-field const-field"
                  value={inviteId}
                  readOnly
                />
                <label className="floating-label">ID</label>
                <button
                  className="profile-invite-button"
                  onClick={handleCopyInviteId}
                  disabled={isEditing}
                >
                  <img src={copy_inviteId_logo} alt="COPY" />
                </button>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </div>

        <div className="profile-title-container">
          <p className="profile-title-text">Безопасность</p>
          {!isEditingSecurity ? (
            <button
              className="profile-edit-button"
              onClick={handleEditSecurityClick}
              disabled={isUpdatingPassword || isEditingGeneralInfo}
            >
              <img src={edit_icon} alt="EDIT" />
            </button>
          ) : (
            <div className="edit-buttons-group">
              <button
                className="profile-edit-button confirm-button"
                onClick={handleUpdatePassword}
                disabled={isUpdatingPassword}
              >
                <img src={confirmChanges_icon} alt="CONFIRM" />
              </button>
              <button
                className="profile-edit-button reset-button"
                onClick={handleCancelPasswordChange}
                disabled={isUpdatingPassword}
              >
                <img src={resetChanges_icon} alt="RESET" />
              </button>
            </div>
          )}
        </div>
        <div className="profile-separation-line"></div>
        <div className="profile-data-container">
          {!isEditingSecurity ? (
            <div className="profile-data-row">
              <div className="floating-label-group">
                <input
                  type="text"
                  className="profile-field read-only-field const-field"
                  value={userEmail}
                  readOnly
                />
                <label className="floating-label">Почта</label>
              </div>
              <div className="floating-label-group">
                <input
                  type="password"
                  className="profile-field read-only-field"
                  value="********"
                  readOnly
                />
                <label className="floating-label">Пароль</label>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="full-width-form">
              <div className="profile-data-row">
                <div className="floating-label-group">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    className="profile-field"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                  <label className="floating-label">Текущий пароль</label>
                  <button
                    type="button"
                    className="toggle-password-button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    <img
                      src={showOldPassword ? hide_logo : show_logo}
                      alt="Toggle"
                    />
                  </button>
                </div>
                <div className="new-passwords-column">
                  <div className="floating-label-group">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="profile-field"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <label className="floating-label">Новый пароль</label>
                    <button
                      type="button"
                      className="toggle-password-button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      <img
                        src={showNewPassword ? hide_logo : show_logo}
                        alt="Toggle"
                      />
                    </button>
                  </div>
                  <div className="floating-label-group">
                    <input
                      type={showRepeatNewPassword ? "text" : "password"}
                      className="profile-field"
                      value={repeatNewPassword}
                      onChange={(e) => setRepeatNewPassword(e.target.value)}
                      required
                    />
                    <label className="floating-label">Повторите пароль</label>
                    <button
                      type="button"
                      className="toggle-password-button"
                      onClick={() =>
                        setShowRepeatNewPassword(!showRepeatNewPassword)
                      }
                    >
                      <img
                        src={showRepeatNewPassword ? hide_logo : show_logo}
                        alt="Toggle"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
        {!isEditingSecurity && (
          <div className="button-quit-container">
            <button
              className="profile-button quit"
              onClick={handleLogout}
              disabled={isEditing}
            >
              Выйти
            </button>
          </div>
        )}
      </div>
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
}
