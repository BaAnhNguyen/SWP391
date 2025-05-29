require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const accounts = [
    {
      username: "admin",
      name: "Admin",
      email: "admin@team.com",
      password: "Admin@123",
      role: "Admin",
    },
    {
      username: "staff",
      name: "Staff",
      email: "staff@team.com",
      password: "Staff@123",
      role: "Staff",
    },
  ];

  for (let acc of accounts) {
    const exists = await User.findOne({ username: acc.username });
    if (exists) continue;
    acc.password = await bcrypt.hash(acc.password, 12);
    await User.create(acc);
    console.log(`Created ${acc.role}: ${acc.username}`);
  }

  mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  mongoose.disconnect();
});
