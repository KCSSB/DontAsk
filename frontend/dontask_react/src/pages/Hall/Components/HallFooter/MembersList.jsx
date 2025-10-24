import React, { useState } from "react";
import { useToast } from "../../../../components/Toast/ToastContext";
import { useProject } from "../../HallContext.jsx";
import invite_icon from "./invite_icon.png";
import removeMember_icon from "./removeMember_icon.png";
import "./MembersList.css";

export default function MembersList({
  isCreating,
  setIsCreating,
  members,
  isEditMode,
}) {
  const [newMemberName, setNewMemberName] = useState("");
  const showToast = useToast();
  const { currentUserId, addMemberToKick, isOwner } = useProject();

  const handleInviteMemberClick = () => {
    setIsCreating(true);
  };

  const handleInviteMember = (e) => {
    e.preventDefault();
    showToast("Приглашение отправлено!", "success");
    setIsCreating(false);
    setNewMemberName("");
  };

  const getMemberRole = (role) => {
    return role === "owner" ? "Лидер проекта" : "Участник";
  };

  const handleRemoveMember = (memberId, memberName) => {
    addMemberToKick(memberId);
  };

  return (
    <div className="members-list-container">
      <div className="members-list-wrapper">
        {isOwner &&
          !isEditMode &&
          (isCreating ? (
            <form
              className="member-invite-card-form"
              onSubmit={handleInviteMember}
            >
              <div className="member-input-group member-floating-label-group">
                <input
                  type="text"
                  className="member-name-input"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  required
                  placeholder=" "
                />
                <label className="member-floating-label">Invite ID</label>
              </div>
              <button className="member-invite-button" type="submit">
                Пригласить{" "}
              </button>{" "}
            </form>
          ) : (
            <button
              className="member-card member-invite-card"
              onClick={handleInviteMemberClick}
            >
              <img
                src={invite_icon}
                alt="INVITE"
                className="member-invite-logo"
              />
              <p className="member-invite-text">Добавить участника</p>{" "}
            </button>
          ))}
        {members &&
          members.map((member) => (
            <div key={member.projectUserId} className="member-card">
              <img
                src={member.userUrl}
                alt="AVATAR"
                className="member-avatar"
              />
              <div className="member-text-container">
                <p className="member-name">
                  {member.firstName} {member.lastName}
                </p>
                <p className="member-role">
                  {getMemberRole(member.projectRole)}
                </p>
              </div>
              {isEditMode &&
                currentUserId &&
                member.userId.toString() !== currentUserId && (
                  <button
                    className="member-remove-button"
                    onClick={() =>
                      handleRemoveMember(
                        member.projectUserId,
                        `${member.firstName} ${member.lastName}`
                      )
                    }
                  >
                    <img src={removeMember_icon} alt="KICK" />
                  </button>
                )}
            </div>
          ))}
      </div>
    </div>
  );
}
