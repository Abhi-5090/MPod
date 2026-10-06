process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-that-is-long-enough-for-hs256-signing";
process.env.OPENAI_API_KEY = "test";
process.env.EMAIL_USER = "noreply@example.com";
process.env.EMAIL_PASS = "x";
if (!process.env.MONGOMS_SYSTEM_BINARY) {
  const fs = require("fs");
  for (const p of ["/opt/homebrew/bin/mongod", "/usr/local/bin/mongod", "/usr/bin/mongod"]) {
    if (fs.existsSync(p)) {
      process.env.MONGOMS_SYSTEM_BINARY = p;
      break;
    }
  }
}
