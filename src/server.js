require("dotenv").config();     // ✅ MUST BE FIRST

const app = require("./app");

// DB connection loads automatically
require("./config/db");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
