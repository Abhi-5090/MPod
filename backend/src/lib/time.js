const { badRequest } = require("./http");

const IST_OFFSET_MS = 330 * 60000; // Asia/Kolkata is UTC+05:30, no DST

/**
 * [start, end] instants of one calendar day in India.
 *  dateStr: "YYYY-MM-DD" (validated) or empty for today + offsetDays.
 */
function istDayRange(dateStr, offsetDays = 0) {
  let y;
  let m;
  let d;
  if (dateStr) {
    const mt = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateStr));
    if (!mt) throw badRequest("date must be in YYYY-MM-DD format.");
    [y, m, d] = [Number(mt[1]), Number(mt[2]), Number(mt[3])];
  } else {
    const nowIst = new Date(Date.now() + IST_OFFSET_MS);
    nowIst.setUTCDate(nowIst.getUTCDate() + offsetDays);
    [y, m, d] = [nowIst.getUTCFullYear(), nowIst.getUTCMonth() + 1, nowIst.getUTCDate()];
  }
  const start = new Date(Date.UTC(y, m - 1, d) - IST_OFFSET_MS);
  if (Number.isNaN(start.getTime())) throw badRequest("Invalid date.");
  const end = new Date(start.getTime() + 24 * 3600 * 1000 - 1);
  return { start, end };
}

module.exports = { istDayRange, IST_OFFSET_MS };
