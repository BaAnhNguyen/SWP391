import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../../config";
import "./FindNear.css";

function FindNear({ needRequestId, excludedUserId }) {
  const { t } = useTranslation();
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState({});
  const [showInvite, setShowInvite] = useState({});
  const [invitingAll, setInvitingAll] = useState(false);

  // Invite All Confirmation Modal state
  const [showInviteAllModal, setShowInviteAllModal] = useState(false);
  const [showInviteAllSuccessModal, setShowInviteAllSuccessModal] = useState(false);
  const [inviteAllResults, setInviteAllResults] = useState({ success: 0, error: 0 });

  // Tìm donor gần đây
  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ lấy vị trí!");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        try {
          const response = await fetch(
            `${API_BASE_URL}/user/nearby?lng=${lng}&lat=${lat}&maxDistance=1000000`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          if (!response.ok) {
            const errText = await response.text();
            throw new Error(errText || `HTTP ${response.status}`);
          }

          const result = await response.json();
          setResult(result);
        } catch (err) {
          alert("Lỗi API: " + (err.message || "Không rõ nguyên nhân"));
          setResult([]);
        }
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        alert("Không lấy được vị trí của bạn!");
      }
    );
  };

  // Gửi mail mời hiến máu
  const handleSendInvite = async (user) => {
    setSending((prev) => ({ ...prev, [user._id]: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/needrequest/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          donorId: user._id,
          needRequestId: needRequestId,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(t("donorInvite.inviteSuccess"));
        setShowInvite((prev) => ({ ...prev, [user._id]: false }));
      } else {
        alert(data.message || t("donorInvite.inviteError"));
      }
    } catch (err) {
      alert(t("donorInvite.inviteError") + ": " + err.message);
    }
    setSending((prev) => ({ ...prev, [user._id]: false }));
  };

  // Invite all compatible donors
  const handleInviteAll = async () => {
    setInvitingAll(true);
    const eligibleDonors = filteredResult.filter(user => {
      // Only invite donors who are eligible (no future nextEligibleDate or past nextEligibleDate)
      if (!user.nextEligibleDate) return true;
      return new Date(user.nextEligibleDate) <= new Date();
    });

    let successCount = 0;
    let errorCount = 0;

    for (const user of eligibleDonors) {
      try {
        const response = await fetch(`${API_BASE_URL}/needrequest/invite`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            donorId: user._id,
            needRequestId: needRequestId,
          }),
        });

        if (response.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (err) {
        errorCount++;
      }
    }

    setInvitingAll(false);

    // Store results and show success modal
    setInviteAllResults({ success: successCount, error: errorCount });
    setShowInviteAllSuccessModal(true);
  };

  // Modal handlers for Invite All
  const openInviteAllModal = () => {
    setShowInviteAllModal(true);
  };

  const closeInviteAllModal = () => {
    setShowInviteAllModal(false);
  };

  const closeInviteAllSuccessModal = () => {
    setShowInviteAllSuccessModal(false);
    setInviteAllResults({ success: 0, error: 0 });
  };

  const confirmInviteAll = () => {
    closeInviteAllModal();
    handleInviteAll();
  };

  //filter
  const filteredResult = excludedUserId
    ? result.filter((user) => user._id !== excludedUserId)
    : result;

  return (
    <div className="find-near-container">
      <button
        className="find-donor-btn"
        onClick={handleFindNearby}
        disabled={loading}
      >
        {loading ? t("donorInvite.searching") : t("donorInvite.nearbyDonors")}
      </button>
      {filteredResult.length > 0 ? (
        <div className="search-results">
          <div className="results-header">
            <h2>{t("donorInvite.compatibleDonors")}:</h2>
            <button
              className="invite-all-btn"
              onClick={openInviteAllModal}
              disabled={invitingAll || filteredResult.length === 0}
            >
              {invitingAll ? t("donorInvite.sending") : t("donorInvite.inviteAll")}
            </button>
          </div>
          <div>
            {filteredResult.map((user) => (
              <div key={user._id} className="donor-result">
                <div className="donor-info">
                  <div className="donor-name">
                    {user.name}{" "}
                    <span className="blood-badge">{user.bloodGroup}</span>
                  </div>
                  {user.nextEligibleDate && (
                    <div className="donor-next-date">
                      {t("donateRequest.nextEligibleDate")}:{" "}
                      {new Date(user.nextEligibleDate).toLocaleDateString()}
                    </div>
                  )}
                  <div className="donor-address">
                    {t("common.address")}: {user.address || t("common.notAvailable")}
                  </div>
                  <div className="donor-phone">
                    {t("common.phone")}: {user.phoneNumber || t("common.hidden")}
                  </div>
                  <div className="donor-distance">
                    {t("common.distance")}: {user.distance && user.distance.toFixed(1)} m
                  </div>
                </div>

                {!showInvite[user._id] ? (
                  <button
                    className="invite-donor-btn"
                    onClick={() =>
                      setShowInvite((prev) => ({
                        ...prev,
                        [user._id]: true,
                      }))
                    }
                  >
                    {t("donorInvite.inviteBloodDonation")}
                  </button>
                ) : (
                  <div className="action-buttons">
                    <button
                      className="message-btn"
                      onClick={() => handleSendInvite(user)}
                      disabled={sending[user._id]}
                    >
                      {sending[user._id] ? t("donorInvite.sending") : t("donorInvite.sendInvite")}
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() =>
                        setShowInvite((prev) => ({
                          ...prev,
                          [user._id]: false,
                        }))
                      }
                      disabled={sending[user._id]}
                    >
                      {t("donorInvite.cancel")}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        !loading && (
          <div className="no-results-message">
            <p>{t("donorInvite.noCompatibleDonors")}</p>
          </div>
        )
      )}

      {/* Invite All Confirmation Modal */}
      {showInviteAllModal && (
        <div className="invite-modal-overlay" onClick={closeInviteAllModal}>
          <div className="invite-modal-content invite-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t("donorInvite.confirmInviteAllTitle")}</h3>
            <div className="invite-modal-body">
              <p className="invite-confirm-message">
                {t("donorInvite.confirmInviteAll")}
              </p>
              <div className="invite-donor-count">
                {t("donorInvite.eligibleDonorsCount", {
                  count: filteredResult.filter(user => {
                    if (!user.nextEligibleDate) return true;
                    return new Date(user.nextEligibleDate) <= new Date();
                  }).length
                })}
              </div>
            </div>
            <div className="invite-modal-actions">
              <button
                type="button"
                onClick={confirmInviteAll}
                className="confirm-invite-all-btn"
                disabled={invitingAll}
              >
                {invitingAll ? t("donorInvite.sending") : t("donorInvite.confirmInviteAllButton")}
              </button>
              <button
                type="button"
                onClick={closeInviteAllModal}
                className="cancel-invite-all-btn"
                disabled={invitingAll}
              >
                {t("donorInvite.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite All Success Modal */}
      {showInviteAllSuccessModal && (
        <div className="invite-modal-overlay" onClick={closeInviteAllSuccessModal}>
          <div className="invite-modal-content invite-success-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t("donorInvite.inviteAllResultsTitle")}</h3>
            <div className="invite-modal-body">
              <div className="invite-success-info">
                <div className="invite-success-icon">
                  {inviteAllResults.error === 0 ? "✅" : "⚠️"}
                </div>
                <div className="invite-results-summary">
                  <div className="invite-success-count">
                    ✓ {t("donorInvite.successfulInvites", { count: inviteAllResults.success })}
                  </div>
                  {inviteAllResults.error > 0 && (
                    <div className="invite-error-count">
                      ✗ {t("donorInvite.failedInvites", { count: inviteAllResults.error })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="invite-modal-actions">
              <button
                type="button"
                onClick={closeInviteAllSuccessModal}
                className="invite-success-btn"
              >
                {t("common.ok")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FindNear;
