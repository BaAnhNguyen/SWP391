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

// All possible variations of blood types
const bloodTypeVariations = {
  "A+": ["A+", "APOS", "APOSITIVE", "A POS", "A POSITIVE", "A +"],
  "A-": ["A-", "ANEG", "ANEGATIVE", "A NEG", "A NEGATIVE", "A -"],
  "B+": ["B+", "BPOS", "BPOSITIVE", "B POS", "B POSITIVE", "B +"],
  "B-": ["B-", "BNEG", "BNEGATIVE", "B NEG", "B NEGATIVE", "B -"],
  "AB+": ["AB+", "ABPOS", "ABPOSITIVE", "AB POS", "AB POSITIVE", "AB +"],
  "AB-": ["AB-", "ABNEG", "ABNEGATIVE", "AB NEG", "AB NEGATIVE", "AB -"],
  "O+": ["O+", "OPOS", "OPOSITIVE", "O POS", "O POSITIVE", "O +"],
  "O-": ["O-", "ONEG", "ONEGATIVE", "O NEG", "O NEGATIVE", "O -"],
};

/**
 * Gets compatible blood types for a given recipient blood type
 * @param {string} recipientType - The blood type of the recipient
 * @returns {string[]} - Array of compatible donor blood types
 */
function getCompatibleBloodTypes(recipientType) {
  if (!recipientType) return [];

  // First try a direct match with standard normalization
  const normalizedType = recipientType.toUpperCase().replace(/\s+/g, "");
  if (compatibility[normalizedType]) {
    return compatibility[normalizedType];
  }

  // If direct match fails, try to find a match in variations
  for (const [standardType, variations] of Object.entries(bloodTypeVariations)) {
    if (variations.includes(normalizedType)) {
      return compatibility[standardType];
    }
  }

  // Advanced normalization for problematic inputs
  // Extract the blood group and sign separately for more flexibility
  const bloodGroup = normalizedType.match(/^(A|B|AB|O)/i)?.[0].toUpperCase();
  if (bloodGroup) {
    const isPositive = /\+|POS|POSITIVE/i.test(normalizedType);
    const isNegative = /\-|NEG|NEGATIVE/i.test(normalizedType);

    if (bloodGroup && isPositive) {
      return compatibility[bloodGroup + "+"] || [];
    }
    if (bloodGroup && isNegative) {
      return compatibility[bloodGroup + "-"] || [];
    }
  }

  // No compatible types found
  return [];
}

// Export both the compatibility map and the function
module.exports = {
  compatibility,
  getCompatibleBloodTypes,
  bloodTypeVariations
};
