import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./Profile.css";

const ProfileSkeleton = () => {
  const inputStyle = { borderRadius: "1.5rem" };
  const buttonStyle = {
    borderRadius: "1.5rem",
    height: "48px",
    width: "160px",
  };
  const titleStyle = { height: "30px", width: "200px" };
  const editButtonStyle = {
    height: "30px",
    width: "30px",
    borderRadius: "0.5rem",
  };
  const fieldHeight = "64px";

  return (
    <div className="profile-container-wrapper">
      <div className="profile-container">
        <div className="profile-header-group">
          <p className="profile-title-text">
            <Skeleton style={titleStyle} />
          </p>
          <div className="profile-separation-line">
            <Skeleton height={1} />
          </div>

          <div className="profile-avatar-line-container">
            <div className="profile-avatar-container">
              <Skeleton circle={true} height={240} width={240} />
              <div className="load-avatar-button">
                <Skeleton
                  height={65}
                  width={65}
                  style={{ borderRadius: "1rem" }}
                />
              </div>
            </div>
            <Skeleton style={buttonStyle} />
            <Skeleton style={{ ...buttonStyle, marginLeft: "10px" }} />
            <Skeleton style={{ ...buttonStyle, marginLeft: "10px" }} />
          </div>
        </div>

        <div className="profile-title-container">
          <p className="profile-title-text">
            <Skeleton style={titleStyle} />
          </p>
          <button className="profile-edit-button">
            <Skeleton style={editButtonStyle} />
          </button>
        </div>
        <div className="profile-separation-line">
          <Skeleton height={1} />
        </div>

        <div className="profile-data-container">
          <div className="profile-data-row">
            <div
              className="floating-label-group"
              style={{ flex: 1, marginRight: "20px" }}
            >
              <Skeleton height={fieldHeight} style={inputStyle} />
            </div>
            <div className="floating-label-group" style={{ flex: 1 }}>
              <Skeleton height={fieldHeight} style={inputStyle} />
            </div>
          </div>

          <div className="profile-data-row">
            <div
              className="floating-label-group"
              style={{ flex: 1, marginRight: "20px" }}
            >
              <Skeleton height={fieldHeight} style={inputStyle} />
            </div>
            <div
              className="floating-label-group"
              style={{ flex: 1, position: "relative" }}
            >
              <Skeleton height={fieldHeight} style={inputStyle} />
              <div
                style={{
                  position: "absolute",
                  right: 5,
                  top: 0,
                  height: fieldHeight,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Skeleton
                  height={40}
                  width={40}
                  style={{ borderRadius: "0.5rem" }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="profile-title-container">
          <p className="profile-title-text">
            <Skeleton style={titleStyle} />
          </p>
          <button className="profile-edit-button">
            <Skeleton style={editButtonStyle} />
          </button>
        </div>
        <div className="profile-separation-line">
          <Skeleton height={1} />
        </div>

        <div className="profile-data-container">
          <div className="profile-data-row">
            <div
              className="floating-label-group"
              style={{ flex: 1, marginRight: "20px" }}
            >
              <Skeleton height={fieldHeight} style={inputStyle} />
            </div>
            <div className="floating-label-group" style={{ flex: 1 }}>
              <Skeleton height={fieldHeight} style={inputStyle} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
