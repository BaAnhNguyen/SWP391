const compatibility = {
  "A+": ["A+", "A-", "O+", "O-"],
  "A-": ["A-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  "AB-": ["A-", "B-", "AB-", "O-"],
  "O+": ["O+", "O-"],
  "O-": ["O-"],
};

function getCompatibleBloodTypes(recipientType) {
  if (!recipientType) return [];
  const normalizedType = recipientType.toUpperCase().replace(/\s+/g, "");
  return compatibility[normalizedType] || [];
}

module.exports = { getCompatibleBloodTypes };
