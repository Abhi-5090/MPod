const mongoose = require("mongoose");

let txnSupported = null;

// Transactions need a replica set (production is one). Detected once after connect.
const detectTransactions = async () => {
  try {
    const hello = await mongoose.connection.db.admin().command({ hello: 1 });
    txnSupported = Boolean(hello.setName || hello.msg === "isdbgrid");
  } catch (_) {
    txnSupported = false;
  }
  if (!txnSupported) {
    console.warn("[db] MongoDB is not a replica set; credit updates run without multi-document transactions.");
  }
  return txnSupported;
};

/**
 * Runs fn(session) inside a transaction when supported, otherwise fn(null).
 * fn must pass the session to every query ({ session }) so both paths work.
 */
const withTransaction = async (fn) => {
  if (txnSupported === null) await detectTransactions();
  if (!txnSupported) return fn(null);
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
};

module.exports = { withTransaction, detectTransactions };
