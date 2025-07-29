/**
 * FindNear Component
 *
 * This component allows staff to find nearby eligible blood donors for a specific blood need request.
 * It provides functionality for:
 * - Finding donors based on geolocation and blood type compatibility
 * - Sending individual email invitations to donors
 * - Sending batch invitations to all eligible donors
 * - Filtering donors based on eligibility status
 * - Displaying donor information including distance and eligibility
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../../config";
import "./FindNear.css";

/**
 * FindNear component for finding nearby eligible blood donors
 *
 * @param {Object} props - Component props
 * @param {string} props.needRequestId - ID of the blood need request
 * @param {string} props.excludedUserId - ID of user to exclude from results (usually request creator)
 * @param {string} props.bloodGroup - Blood type needed (e.g., "A+", "O-", etc.)
 * @returns {JSX.Element} The rendered FindNear component
 */
function FindNear({ needRequestId, excludedUserId, bloodGroup }) {
  // Core hooks and state
  const { t } = useTranslation(); // Translation hook
  const [result, setResult] = useState([]); // Search results of nearby donors
  const [loading, setLoading] = useState(false); // Loading state for search
  const [sending, setSending] = useState({}); // Tracking which invites are being sent
  const [showInvite, setShowInvite] = useState({}); // Controls which invite forms are shown
  const [invitingAll, setInvitingAll] = useState(false); // Loading state for batch invites

  // Modal states for inviting all donors
  const [showInviteAllModal, setShowInviteAllModal] = useState(false); // Confirmation modal visibility
  const [showInviteAllSuccessModal, setShowInviteAllSuccessModal] =
    useState(false); // Success modal visibility
  const [inviteAllResults, setInviteAllResults] = useState({
    success: 0, // Count of successful invites
    error: 0, // Count of failed invites
  });

  // Individual invite success modal state
  const [showInviteSuccessModal, setShowInviteSuccessModal] = useState(false);
  const [invitedUserName, setInvitedUserName] = useState("");

  /**
   * Finds nearby blood donors based on current location and requested blood type
   * Uses browser geolocation API to get current position, then calls backend API
   */
  const handleFindNearby = () => {
    // Check if geolocation is supported by the browser
    if (!navigator.geolocation) {
      alert(
        t(
          "donorInvite.browserLocationNotSupported",
          "Your browser doesn't support geolocation!"
        )
      );
      return;
    }

    // Set loading state
    setLoading(true);

    // Get current position using browser geolocation
    navigator.geolocation.getCurrentPosition(
      // Success callback
      async (position) => {
        // Extract latitude and longitude
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          // Call API to find nearby donors
          const response = await fetch(
            `${API_BASE_URL}/user/nearby?lng=${lng}&lat=${lat}&maxDistance=1000000&bloodRequest=${bloodGroup}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          // Handle unsuccessful response
          if (!response.ok) {
            const errText = await response.text();
            throw new Error(errText || `HTTP ${response.status}`);
          }

          // Set search results with the response data
          const result = await response.json();
          setResult(result);
        } catch (err) {
          // Handle API errors
          alert(
            t("donorInvite.apiError", "API Error") +
              ": " +
              (err.message || t("common.unknownError", "Unknown error"))
          );
          setResult([]);
        } finally {
          // End loading state
          setLoading(false);
        }
      },
      // Error callback for geolocation
      (error) => {
        setLoading(false);
        alert(t("donorInvite.locationError", "Could not get your location!"));
      }
    );
  };

  /**
   * Sends an email invitation to a specific donor to donate blood for this request
   *
   * @param {Object} user - The donor user object to invite
   */
  const handleSendInvite = async (user) => {
    // Set sending state for this specific user
    setSending((prev) => ({ ...prev, [user._id]: true }));

    try {
      // Send invitation request to API
      const response = await fetch(`${API_BASE_URL}/needrequest/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          donorId: user._id, // ID of donor to invite
          needRequestId: needRequestId, // ID of blood need request
        }),
      });

      // Parse response data
      const data = await response.json();

      // Handle successful response
      if (response.ok) {
        // Store the invited user's name for display in success modal
        setInvitedUserName(user.name);
        // Show success modal instead of alert
        setShowInviteSuccessModal(true);
        // Hide the invite form after successful invitation
        setShowInvite((prev) => ({ ...prev, [user._id]: false }));
      } else {
        // Show error message from API or default message
        alert(data.message || t("donorInvite.inviteError"));
      }
    } catch (err) {
      // Handle network or other errors
      alert(t("donorInvite.inviteError") + ": " + err.message);
    } finally {
      // Reset sending state for this specific user
      setSending((prev) => ({ ...prev, [user._id]: false }));
    }
  };

  /**
   * Sends invitation emails to all eligible donors found in the search results
   * Shows confirmation modal before sending and success modal after completion
   */
  const handleInviteAll = async () => {
    // Set loading state for batch invitation
    setInvitingAll(true);

    // Filter for only currently eligible donors
    const eligibleDonors = filteredResult.filter((user) => {
      // Only include donors who are eligible to donate now
      // Either they don't have a next eligible date, or the date is in the past
      if (!user.nextEligibleDate) return true;
      return new Date(user.nextEligibleDate) <= new Date();
    });

    // Counter for successful invitations
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

  /**
   * Modal handlers for Invite All functionality
   */
  // Opens the confirmation modal before sending batch invitations
  const openInviteAllModal = () => {
    setShowInviteAllModal(true);
  };

  // Closes the confirmation modal without sending invitations
  const closeInviteAllModal = () => {
    setShowInviteAllModal(false);
  };

  // Closes the success modal shown after batch invitations are sent
  const closeInviteAllSuccessModal = () => {
    setShowInviteAllSuccessModal(false);
    setInviteAllResults({ success: 0, error: 0 }); // Reset results
<<<<<<< HEAD
  };

  // Closes the individual invite success modal
  const closeInviteSuccessModal = () => {
    setShowInviteSuccessModal(false);
    setInvitedUserName("");  // Reset invited user name
=======
>>>>>>> aa7ca4b3ef0fe7cffa2fe87d6807f35e3bc4eb5a
  };

  /**
   * Confirms the batch invitation process after user approval
   * Closes the confirmation modal and starts sending invitations
   */
  const confirmInviteAll = () => {
    closeInviteAllModal(); // Close confirmation modal
    handleInviteAll(); // Start sending invitations
  };

  /**
   * Filter out the request creator from search results
   * This prevents staff from inviting the person who already needs blood
   */
  const filteredResult = excludedUserId
    ? result.filter((user) => user._id !== excludedUserId) // Remove excluded user (typically request creator)
    : result; // Use all results if no exclusion

  return (
    <div className="find-near-container">
      {/* Search Button - Triggers geolocation and donor search */}
      <button
        className="find-donor-btn"
        onClick={handleFindNearby}
        disabled={loading} // Disable while searching
      >
        {loading ? t("donorInvite.searching") : t("donorInvite.nearbyDonors")}
      </button>
      {/* Display search results if donors are found */}
      {filteredResult.length > 0 ? (
        <div className="search-results">
          {/* Header section with title and Invite All button */}
          <div className="results-header">
            <h2>{t("donorInvite.compatibleDonors")}:</h2>
            {/* Button to trigger batch invitation process */}
            <button
              className="invite-all-btn"
              onClick={openInviteAllModal}
              disabled={invitingAll || filteredResult.length === 0} // Disabled during sending or if no results
            >
              {invitingAll
<<<<<<< HEAD
<<<<<<< HEAD
                ? t("donorInvite.sending")  // Show sending text while in progress
=======
                ? t("donorInvite.sending") // Show sending text while in progress
>>>>>>> aa7ca4b3ef0fe7cffa2fe87d6807f35e3bc4eb5a
=======
                ? t("donorInvite.sending") // Show sending text while in progress
>>>>>>> aa7ca4b3ef0fe7cffa2fe87d6807f35e3bc4eb5a
                : t("donorInvite.inviteAll")}
            </button>
          </div>
          {/* Donor results listing */}
          <div>
            {filteredResult.map((user) => (
              <div key={user._id} className="donor-result">
                {/* Donor information section with personal and blood details */}
                <div className="donor-info">
                  {/* Donor name with blood type badge */}
                  <div className="donor-name">
                    {user.name}{" "}
                    <span className="blood-badge">{user.bloodGroup}</span>
                  </div>
                  {/* Show next eligible date if it exists */}
                  {user.nextEligibleDate && (
                    <div className="donor-next-date">
                      {t("donateRequest.nextEligibleDate")}:{" "}
                      {new Date(user.nextEligibleDate).toLocaleDateString()}
                    </div>
                  )}
                  {/* Donor address information */}
                  <div className="donor-address">
                    {t("common.address")}:{" "}
                    {user.address || t("common.notAvailable")}
                  </div>
                  {/* Donor phone information - shown if available */}
                  <div className="donor-phone">
                    {t("common.phone")}:{" "}
                    {user.phoneNumber || t("common.hidden")}
                  </div>
                  {/* Distance from current location */}
                  <div className="donor-distance">
                    {t("common.distance")}:{" "}
                    {user.distance && user.distance.toFixed(1)} m
                  </div>
                </div>

                {/* Conditional rendering for invite buttons */}
                {!showInvite[user._id] ? (
                  // Initial state: Show the invite button
                  <button
                    className="invite-donor-btn"
                    onClick={() =>
                      setShowInvite((prev) => ({
                        ...prev,
                        [user._id]: true, // Show invite options for this donor
                      }))
                    }
                  >
                    {t("donorInvite.inviteBloodDonation")}
                  </button>
                ) : (
                  // After clicking invite: Show send and cancel buttons
                  <div className="action-buttons">
                    {/* Send invitation button */}
                    <button
                      className="message-btn"
                      onClick={() => handleSendInvite(user)}
                      disabled={sending[user._id]} // Disable during API call
                    >
                      {sending[user._id]
<<<<<<< HEAD
                        ? t("donorInvite.sending")
                        : t("donorInvite.sendInvite")}
=======
                        ? t("donorInvite.sending") // Show loading state
                        : t("donorInvite.sendInvite")}{" "}
                      // Normal state
<<<<<<< HEAD
>>>>>>> aa7ca4b3ef0fe7cffa2fe87d6807f35e3bc4eb5a
=======
>>>>>>> aa7ca4b3ef0fe7cffa2fe87d6807f35e3bc4eb5a
                    </button>
                    {/* Cancel button to hide invite options */}
                    <button
                      className="cancel-btn"
                      onClick={() =>
                        setShowInvite((prev) => ({
                          ...prev,
                          [user._id]: false, // Hide invite options
                        }))
                      }
                      disabled={sending[user._id]} // Disable during API call
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
        // Show "no results" message when search is complete but no donors found
        !loading && (
          <div className="no-results-message">
            <p>{t("donorInvite.noCompatibleDonors")}</p>
          </div>
        )
      )}
      {/* Invite All Confirmation Modal - Asks for confirmation before sending batch invites */}
      {showInviteAllModal && (
        <div className="invite-modal-overlay" onClick={closeInviteAllModal}>
          <div
            className="invite-modal-content invite-confirm-modal"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
          >
            <h3>{t("donorInvite.confirmInviteAllTitle")}</h3>
            <div className="invite-modal-body">
              <p className="invite-confirm-message">
                {t("donorInvite.confirmInviteAll")}
              </p>
              <div className="invite-donor-count">
                {t("donorInvite.eligibleDonorsCount", {
                  count: filteredResult.filter((user) => {
                    if (!user.nextEligibleDate) return true;
                    return new Date(user.nextEligibleDate) <= new Date();
                  }).length,
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
                {invitingAll
                  ? t("donorInvite.sending")
                  : t("donorInvite.confirmInviteAllButton")}
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

      {/* Invite All Success Modal - Shows results after batch invites are sent */}
      {showInviteAllSuccessModal && (
        <div
          className="invite-modal-overlay"
          onClick={closeInviteAllSuccessModal} // Close modal when clicking outside
        >
          <div
            className="invite-modal-content invite-success-modal"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
          >
            {/* Modal title */}
            <h3>{t("donorInvite.inviteAllResultsTitle")}</h3>
            <div className="invite-modal-body">
              <div className="invite-success-info">
                {/* Success or warning icon based on results */}
                <div className="invite-success-icon">
                  {inviteAllResults.error === 0 ? "✅" : "⚠️"}
                </div>
                {/* Summary of invitation results */}
                <div className="invite-results-summary">
                  {/* Count of successful invitations */}
                  <div className="invite-success-count">
                    ✓{" "}
                    {t("donorInvite.successfulInvites", {
                      count: inviteAllResults.success,
                    })}
                  </div>
                  {/* Only show error count if there were errors */}
                  {inviteAllResults.error > 0 && (
                    <div className="invite-error-count">
                      ✗{" "}
                      {t("donorInvite.failedInvites", {
                        count: inviteAllResults.error,
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Action button to close the modal */}
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

      {/* Individual Invite Success Modal - Shows after successfully inviting a single donor */}
      {showInviteSuccessModal && (
        <div
          className="invite-modal-overlay"
          onClick={closeInviteSuccessModal} // Close modal when clicking outside
        >
          <div
            className="invite-modal-content invite-success-modal"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
          >
            {/* Modal title */}
            <h3>{t("donorInvite.inviteSuccessTitle", "Invitation Sent!")}</h3>
            <div className="invite-modal-body">
              <div className="invite-success-info">
                {/* Success icon */}
                <div className="invite-success-icon">✅</div>
                {/* Success message with donor name */}
                <div className="invite-results-summary">
                  <p>
                    {t("donorInvite.inviteSuccessMessage", {
                      name: invitedUserName,
                      defaultValue: `Invitation sent successfully to ${invitedUserName}.`
                    })}
                  </p>
                </div>
              </div>
            </div>
            {/* Action button to close the modal */}
            <div className="invite-modal-actions">
              <button
                type="button"
                onClick={closeInviteSuccessModal}
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
