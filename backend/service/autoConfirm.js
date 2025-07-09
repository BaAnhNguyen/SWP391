const NeedRequest = require("../models/NeedRequest");

const DAYS_TO_AUTOCONFIRM = 3;

async function autoConfirmRequest() {
  const now = Date.now();
  const threshold = new Date(now - DAYS_TO_AUTOCONFIRM * 24 * 60 * 60 * 1000);

  //find
  const toConfirm = await NeedRequest.find({
    status: "Fulfilled",
    fulfilledAt: { $lte: threshold },
  });

  for (const req of toConfirm) {
    req.status = "Completed";
    req.completedAt = new Date();
    await req.save();
  }
}

module.exports = autoConfirmRequest;
