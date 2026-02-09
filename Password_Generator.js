const bcrypt = require("bcryptjs");

const password = "Admin@123"; // your initial admin password

bcrypt.hash(password, 10).then(hash => {
  console.log("Hashed Password:\n", hash);
});