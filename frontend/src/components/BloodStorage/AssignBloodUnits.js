import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import "./AssignBloodUnits.css";
import "../../styles/colors.css";
import "../../styles/tables.css";
import "../../styles/blood-badges.css";
import FindNear from "../Search/FindNear";

const AssignBloodUnits = () => {
  const { t } = useTranslation();
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [requestDetails, setRequestDetails] = useState(null);
  const [availableBloodUnits, setAvailableBloodUnits] = useState([]);
  const [selectedBloodUnits, setSelectedBloodUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");

  // Filter states
  const [filterBloodType, setFilterBloodType] = useState("all");
  const [filterComponent, setFilterComponent] = useState("all");
  const [sortBy, setSortBy] = useState("DateExpired");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    fetchRequestDetails();
  }, [requestId]);

  // Fetch blood units only after request details are loaded
  useEffect(() => {
    if (requestDetails) {
      fetchAvailableBloodUnits();
    }
  }, [requestDetails]);

  const fetchRequestDetails = async () => {
    try {
      const token = localStorage.getItem("token");

      // First try to get the specific request directly
      try {
        const singleResponse = await fetch(
          `${API_BASE_URL}/needrequest/${requestId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (singleResponse.ok) {
          const request = await singleResponse.json();
          console.log("Fetched single request details:", request);
          setRequestDetails(request);
          return;
        }
      } catch (singleErr) {
        console.log(
          "Single request fetch failed, trying all requests:",
          singleErr
        );
      }

      // Fallback to getting all requests and finding the one we need
      const response = await fetch(`${API_BASE_URL}/needrequest/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(t("needRequest.fetchError"));

      const requests = await response.json();
      console.log("Fetched all requests, count:", requests.length);

      const request = requests.find((req) => req._id === requestId);
      if (!request) throw new Error(t("needRequest.requestNotFound"));

      console.log("Found request details:", request);
      setRequestDetails(request);
    } catch (err) {
      console.error("Error fetching request details:", err);
      setError(err.message);
    }
  };

  const fetchAvailableBloodUnits = async () => {
    if (!requestDetails) return;

    try {
      const token = localStorage.getItem("token");
      const componentType = requestDetails.component;
      const bloodType = requestDetails.bloodGroup;

      console.log("Request details:", requestDetails);
      console.log("Component Type:", componentType);
      console.log("Blood Type:", bloodType);

      if (!componentType || !bloodType) {
        throw new Error("Request details missing component type or blood type");
      }

      // Normalize blood type to match backend expectations (A+ format)
      // Additional debugging for bloodType format
      console.log("Original blood type from request:", bloodType);
      console.log("Blood type type:", typeof bloodType);
      console.log("Blood type length:", bloodType ? bloodType.length : 0);
      console.log(
        "Blood type charcode analysis:",
        bloodType
          ? Array.from(bloodType)
              .map((c) => `${c}:${c.charCodeAt(0)}`)
              .join(", ")
          : "none"
      );

      // Function to properly format blood type
      const normalizeBloodType = (type) => {
        // Handle null or undefined
        if (!type) return "";

        console.log("Before trim:", type);
        // Strip any whitespace
        type = type.trim().toUpperCase();
        console.log("After trim:", type);

        // Replace common variations
        if (type.includes("POS")) return type.replace("POS", "+");
        if (type.includes("NEG")) return type.replace("NEG", "-");
        if (type.includes("POSITIVE")) return type.replace("POSITIVE", "+");
        if (type.includes("NEGATIVE")) return type.replace("NEGATIVE", "-");

        // Handle specific patterns like Apos or Aneg
        if (type.match(/^(A|B|AB|O)POS$/i))
          return type.substring(0, type.length - 3) + "+";
        if (type.match(/^(A|B|AB|O)NEG$/i))
          return type.substring(0, type.length - 3) + "-";

        // Handle type with a space like "A +"
        if (type.match(/^(A|B|AB|O)\s+(\+|\-)$/i))
          return type.replace(/\s+/, "");

        // Handle any non-standard characters (e.g., invisible characters, special +/- variants)
        // Convert to standard format using the characters we know work
        if (type.match(/^(A|B|AB|O)/i)) {
          const bloodGroup = type.match(/^(A|B|AB|O)/i)[0].toUpperCase();
          const isPositive = /\+|POS|POSITIVE/i.test(type);
          const isNegative = /\-|NEG|NEGATIVE/i.test(type);

          if (isPositive) return bloodGroup + "+";
          if (isNegative) return bloodGroup + "-";
        }

        // Return as is if it's already in the right format or we can't determine
        return type;
      };

      let normalizedBloodType = normalizeBloodType(bloodType);

      console.log("Normalized Blood Type:", normalizedBloodType);

      // Use the backend endpoint to get only compatible blood units
      console.log(
        `Making request to: ${API_BASE_URL}/bloodunit/filter/for-request?componentType=${componentType}&bloodType=${encodeURIComponent(
          normalizedBloodType
        )}`
      );

      // Try with the standard blood types directly if normalization might be failing
      const standardBloodTypes = [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-",
      ];
      let matchFound = false;
      let response;
      let exactMatch;

      // First try with our normalized version
      try {
        response = await fetch(
          `${API_BASE_URL}/bloodunit/filter/for-request?componentType=${componentType}&bloodType=${encodeURIComponent(
            normalizedBloodType
          )}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          console.log("Request succeeded with normalized blood type");
          matchFound = true;
          exactMatch = normalizedBloodType;
        } else {
          console.log(
            "Request failed with normalized blood type, status:",
            response.status
          );
          console.log("Response:", await response.clone().text());
        }
      } catch (err) {
        console.error("Error with normalized blood type:", err);
      }

      // If that failed, try with exact standard blood types
      if (!matchFound) {
        // Try to find an exact match in our standard blood types
        exactMatch = standardBloodTypes.find(
          (type) =>
            type.toLowerCase() === bloodType.trim().toLowerCase() ||
            type.toLowerCase().replace(/[+-]/, "") ===
              bloodType.trim().toLowerCase()
        );

        if (exactMatch) {
          try {
            console.log("Trying with exact match:", exactMatch);
            response = await fetch(
              `${API_BASE_URL}/bloodunit/filter/for-request?componentType=${componentType}&bloodType=${exactMatch}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (response.ok) {
              console.log("Request succeeded with exact match");
              matchFound = true;
            }
          } catch (err) {
            console.error("Error with exact match:", err);
          }
        }
      }

      // If both failed, try all standard blood types until one works
      if (!matchFound) {
        for (const stdType of standardBloodTypes) {
          try {
            console.log("Trying standard blood type:", stdType);
            response = await fetch(
              `${API_BASE_URL}/bloodunit/filter/for-request?componentType=${componentType}&bloodType=${stdType}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (response.ok) {
              console.log("Request succeeded with standard type:", stdType);
              matchFound = true;
              exactMatch = stdType;

              // Update our display to show what we're using
              setRequestDetails({
                ...requestDetails,
                bloodGroup: stdType,
                originalBloodGroup: bloodType,
              });

              break;
            }
          } catch (err) {
            console.error(`Error with standard type ${stdType}:`, err);
          }
        }
      }

      if (!matchFound || !response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          console.error("Blood unit fetch error:", errorData);

          if (errorData.message === "Invalid or unsupported blood type.") {
            errorMessage = `${t(
              "needRequest.invalidBloodType"
            )}: ${normalizedBloodType}. ${t(
              "needRequest.supportedTypes"
            )}: ${errorData.supportedTypes?.join(", ")}`;
          } else {
            errorMessage =
              errorData.message || t("needRequest.fetchBloodUnitsError");
          }
        } catch (err) {
          errorMessage = `${t("needRequest.fetchBloodUnitsError")}: ${
            err.message
          }`;
        }

        // FALLBACK: If API call fails, try to manually get all blood units and filter locally
        console.log(
          "Attempting fallback: Getting all blood units and filtering locally"
        );
        try {
          const allUnitsResponse = await fetch(`${API_BASE_URL}/bloodunit`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (allUnitsResponse.ok) {
            const allUnits = await allUnitsResponse.json();
            console.log(
              `Got ${allUnits.length} total blood units for manual filtering`
            );

            // Simple mapping from recipient to compatible donor types
            const manualCompatibility = {
              "A+": ["A+", "A-", "O+", "O-"],
              "A-": ["A-", "O-"],
              "B+": ["B+", "B-", "O+", "O-"],
              "B-": ["B-", "O-"],
              "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
              "AB-": ["A-", "B-", "AB-", "O-"],
              "O+": ["O+", "O-"],
              "O-": ["O-"],
            };

            // Use the first blood type that seems to match
            let recipientType = null;
            const upperBloodType = bloodType.trim().toUpperCase();

            for (const [stdType, _] of Object.entries(manualCompatibility)) {
              if (
                upperBloodType.includes(stdType) ||
                stdType.replace("+", "POS").includes(upperBloodType) ||
                stdType.replace("-", "NEG").includes(upperBloodType)
              ) {
                recipientType = stdType;
                break;
              }
            }

            // If no match, default to exact blood type
            if (!recipientType) {
              for (const stdType of Object.keys(manualCompatibility)) {
                if (upperBloodType.startsWith(stdType[0])) {
                  // Match blood group (A, B, AB, O)
                  const isPositive =
                    upperBloodType.includes("+") ||
                    upperBloodType.includes("POS") ||
                    upperBloodType.includes("POSITIVE");
                  const isNegative =
                    upperBloodType.includes("-") ||
                    upperBloodType.includes("NEG") ||
                    upperBloodType.includes("NEGATIVE");

                  if (isPositive && stdType.includes("+")) {
                    recipientType = stdType;
                    break;
                  } else if (isNegative && stdType.includes("-")) {
                    recipientType = stdType;
                    break;
                  }
                }
              }
            }

            // If we still can't determine, use an exact match from the keys
            if (!recipientType) {
              recipientType =
                Object.keys(manualCompatibility).find(
                  (t) => t === upperBloodType
                ) || "A+";
              console.log("Defaulting to blood type:", recipientType);
            }

            const compatibleTypes = manualCompatibility[recipientType] || [];
            console.log(
              "Using manual compatibility for",
              recipientType,
              ":",
              compatibleTypes
            );

            const filteredUnits = allUnits.filter(
              (unit) =>
                unit.ComponentType === componentType &&
                compatibleTypes.includes(unit.BloodType) &&
                !unit.assignedToRequestId &&
                new Date(unit.DateExpired) > new Date()
            );

            console.log(
              `Manually filtered: ${filteredUnits.length} compatible units found`
            );

            if (filteredUnits.length > 0) {
              setAvailableBloodUnits(filteredUnits);

              // Update request details with the blood type we determined
              setRequestDetails({
                ...requestDetails,
                bloodGroup: recipientType,
                originalBloodGroup: bloodType,
              });

              // Clear loading and skip error handling
              setLoading(false);
              return;
            }
          }
        } catch (fallbackErr) {
          console.error("Fallback filtering failed:", fallbackErr);
        }

        // If fallback also failed, show error
        throw new Error(errorMessage);
      }

      console.log(
        "Successfully made API request with blood type:",
        exactMatch || normalizedBloodType
      );

      const compatibleUnits = await response.json();
      console.log("Compatible units received:", compatibleUnits.length);

      // Additional filtering for non-expired units
      const availableUnits = compatibleUnits.filter(
        (unit) => new Date(unit.DateExpired) > new Date()
      );
      console.log("Raw compatible units:", compatibleUnits);
      console.log("Current time:", new Date());

      console.log("Non-expired units:", availableUnits.length);
      setAvailableBloodUnits(availableUnits);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleBloodUnitSelection = (unitId) => {
    setSelectedBloodUnits((prev) => {
      const isSelected = prev.includes(unitId);
      const maxUnits = requestDetails?.units || 0;

      if (isSelected) {
        return prev.filter((id) => id !== unitId);
      } else if (prev.length < maxUnits) {
        return [...prev, unitId];
      }
      return prev;
    });
  };

  const handleAssignBloodUnits = async () => {
    if (!appointmentDate) {
      alert("Please select an appointment date");
      return;
    }

    setAssigning(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/needrequest/assign-blood-units`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            requestId,
            bloodUnitIds: selectedBloodUnits,
            appointmentDate,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to assign blood units");
      }

      alert("Blood units assigned successfully!");
      // Add a timestamp as a query parameter to force the page to refresh
      navigate(`/staff/need-requests?refresh=${Date.now()}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setAssigning(false);
    }
  };

  const getComponentTranslation = (component) => {
    const componentMap = {
      WholeBlood: t("bloodStorage.wholeBlood"),
      Plasma: t("bloodStorage.plasma"),
      Platelets: t("bloodStorage.platelets"),
      RedCells: t("bloodStorage.redCells"),
    };
    return componentMap[component] || component;
  };

  const getDaysUntilExpiry = (expirationDate) => {
    const days = Math.ceil(
      (new Date(expirationDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const getExpiryClass = (days) => {
    if (days <= 7) return "expiry-critical";
    if (days <= 14) return "expiry-warning";
    return "expiry-safe";
  };

  const getFilteredAndSortedUnits = () => {
    let filtered = availableBloodUnits;

    // Apply filters
    if (filterBloodType !== "all") {
      filtered = filtered.filter((unit) => unit.BloodType === filterBloodType);
    }
    if (filterComponent !== "all") {
      filtered = filtered.filter(
        (unit) => unit.ComponentType === filterComponent
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "DateExpired" || sortBy === "DateAdded") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  if (loading) {
    return (
      <div className="assign-blood-units-container">
        <div className="loading">{t("common.loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assign-blood-units-container">
        <div className="page-header">
          <div className="header-content">
            <button onClick={() => navigate(-1)} className="back-button">
              ← {t("common.back")}
            </button>
            <h1>{t("needRequest.assignBloodUnits")}</h1>
          </div>
        </div>

        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-message">
            <h3>{t("common.error")}</h3>
            <p>{error}</p>
          </div>
          <div className="error-actions">
            <button
              onClick={() => {
                setError(null);
                fetchRequestDetails();
              }}
              className="retry-button"
            >
              {t("common.retry")}
            </button>
            <button onClick={() => navigate(-1)} className="cancel-button">
              {t("common.cancel")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredUnits = getFilteredAndSortedUnits();

  return (
    <div className="assign-blood-units-container">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-content">
          <button onClick={() => navigate(-1)} className="back-button">
            ← {t("common.back")}
          </button>
          <h1>{t("needRequest.assignBloodUnits")}</h1>
        </div>
      </div>

      {/* Request Details Section */}
      {requestDetails && (
        <div className="request-details-card">
          <h2>{t("needRequest.requestDetails")}</h2>

          {requestDetails.originalBloodGroup &&
            requestDetails.originalBloodGroup !== requestDetails.bloodGroup && (
              <div className="blood-type-notice">
                <div className="notice-icon">ℹ️</div>
                <div className="notice-text">
                  {t("needRequest.bloodTypeNormalized", {
                    original: requestDetails.originalBloodGroup,
                    normalized: requestDetails.bloodGroup,
                  })}
                </div>
              </div>
            )}

          <div className="request-info-grid">
            <div className="info-item">
              <label>{t("common.bloodType")}:</label>
              <span>{requestDetails.bloodGroup}</span>
            </div>
            <div className="info-item">
              <label>{t("bloodStorage.component")}:</label>
              <span>{getComponentTranslation(requestDetails.component)}</span>
            </div>
            <div className="info-item">
              <label>{t("needRequest.unitsRequired")}:</label>
              <span>{requestDetails.units}</span>
            </div>
            <div className="info-item">
              <label>{t("needRequest.requestedBy")}:</label>
              <span>{requestDetails.createdBy.name || "N/A"}</span>
            </div>
            <div className="info-item">
              <label>{t("needRequest.reason")}:</label>
              <span>{requestDetails.reason}</span>
            </div>
          </div>
        </div>
      )}

      {/* Selection Summary
      <div className="selection-summary">
        <div className="summary-item">
          <span className="summary-label">
            {t("needRequest.selectedUnits")}:
          </span>
          <span className="summary-value">{selectedBloodUnits.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">
            {t("needRequest.requiredUnits")}:
          </span>
          <span className="summary-value">{requestDetails?.units || 0}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">
            {t("needRequest.remainingUnits")}:
          </span>
          <span className="summary-value">
            {Math.max(
              0,
              (requestDetails?.units || 0) - selectedBloodUnits.length
            )}
          </span>
        </div>
      </div> */}

      {/* Filters and Controls */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-group">
            <label>{t("common.bloodType")}:</label>
            <select
              value={filterBloodType}
              onChange={(e) => setFilterBloodType(e.target.value)}
            >
              <option value="all">{t("common.all")}</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div className="filter-group">
            <label>{t("bloodStorage.component")}:</label>
            <select
              value={filterComponent}
              onChange={(e) => setFilterComponent(e.target.value)}
            >
              <option value="all">{t("common.all")}</option>
              <option value="WholeBlood">{t("bloodStorage.wholeBlood")}</option>
              <option value="Plasma">{t("bloodStorage.plasma")}</option>
              <option value="Platelets">{t("bloodStorage.platelets")}</option>
              <option value="RedCells">{t("bloodStorage.redCells")}</option>
            </select>
          </div>
          <div className="filter-group">
            <label>{t("common.sortBy")}:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="DateExpired">{t("common.dateExpired")}</option>
              <option value="DateAdded">{t("common.dateAdded")}</option>
              <option value="BloodType">{t("common.bloodType")}</option>
              <option value="Volume">{t("common.volume")}</option>
            </select>
          </div>
          <div className="filter-group">
            <label>{t("common.order")}:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">{t("common.ascending")}</option>
              <option value="desc">{t("common.descending")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blood Units Table */}
      <div className="blood-units-section">
        <h3>
          {t("needRequest.compatibleBloodUnits")} ({filteredUnits.length})
        </h3>

        {filteredUnits.length === 0 ? (
          <>
            <div className="no-units-message">
              {t("needRequest.noCompatibleBloodUnits")}
            </div>
            <div className="find-near-wrapper">
              <FindNear
                needRequestId={requestId}
                excludedUserId={requestDetails?.createdBy?._id}
              />
            </div>
          </>
        ) : (
          <div className="table-container scrollable-table">
            <table className="blood-units-table">
              <thead>
                <tr>
                  <th className="select-column">{t("common.select")}</th>
                  <th>{t("common.bloodType")}</th>
                  <th>{t("bloodStorage.component")}</th>
                  <th>{t("common.volume")} (mL)</th>
                  <th>{t("common.quantity")}</th>
                  <th>{t("common.dateAdded")}</th>
                  <th>{t("common.dateExpired")}</th>
                  <th>{t("bloodStorage.daysUntilExpiry")}</th>
                  <th>{t("bloodStorage.sourceType")}</th>
                  <th>{t("bloodStorage.donorName")}</th>
                  <th>{t("common.note")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUnits.map((unit) => {
                  const isSelected = selectedBloodUnits.includes(unit._id);
                  const maxUnitsReached =
                    selectedBloodUnits.length >= (requestDetails?.units || 0);
                  const isDisabled = !isSelected && maxUnitsReached;
                  const daysUntilExpiry = getDaysUntilExpiry(unit.DateExpired);
                  const expiryClass = getExpiryClass(daysUntilExpiry);

                  return (
                    <tr
                      key={unit._id}
                      className={`
                        ${isSelected ? "selected-unit" : ""} 
                        ${isDisabled ? "disabled-unit" : ""} 
                        ${expiryClass}
                      `.trim()}
                      onClick={() =>
                        !isDisabled && toggleBloodUnitSelection(unit._id)
                      }
                      title={`Unit ID: ${unit._id}`}
                    >
                      <td className="select-column">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={() => {}}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td>
                        <span
                          className={`blood-badge blood-${unit.BloodType.replace(
                            "+",
                            "pos"
                          ).replace("-", "neg")}`}
                        >
                          {unit.BloodType}
                        </span>
                      </td>
                      <td>{getComponentTranslation(unit.ComponentType)}</td>
                      <td>{unit.Volume}</td>
                      <td>{unit.Quantity || 1}</td>
                      <td>{new Date(unit.DateAdded).toLocaleDateString()}</td>
                      <td>{new Date(unit.DateExpired).toLocaleDateString()}</td>
                      <td className={expiryClass}>
                        {daysUntilExpiry > 0
                          ? `${daysUntilExpiry} days`
                          : "EXPIRED"}
                      </td>
                      <td>
                        <span
                          className={`source-badge source-${
                            unit.SourceType || "unknown"
                          }`}
                        >
                          {unit.SourceType || "Unknown"}
                        </span>
                      </td>
                      <td>{unit.donorName || "-"}</td>
                      <td className="note-cell" title={unit.note || ""}>
                        {unit.note
                          ? unit.note.length > 30
                            ? `${unit.note.substring(0, 30)}...`
                            : unit.note
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assignment Form */}
      <div className="assignment-form">
        <div className="form-group">
          <label htmlFor="appointmentDate">
            {t("needRequest.appointmentDate")}:
          </label>
          <input
            type="datetime-local"
            id="appointmentDate"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            required
          />
        </div>

        <div className="form-actions">
          <button
            onClick={handleAssignBloodUnits}
            className="assign-button"
            disabled={
              assigning ||
              selectedBloodUnits.length === 0 ||
              selectedBloodUnits.length < (requestDetails?.units || 0) ||
              !appointmentDate
            }
          >
            {assigning
              ? t("common.processing")
              : t("needRequest.confirmAssignment")}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="cancel-button-nr"
            disabled={assigning}
          >
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignBloodUnits;
