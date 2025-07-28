require("dotenv").config();
const mongoose = require("mongoose");
const BloodUnit = require("./models/BloodUnit");

const hospitals = [
  "Bệnh viện Chợ Rẫy",
  "Bệnh viện Bạch Mai",
  "Bệnh viện 108",
  "Bệnh viện Nhi Trung Ương",
];

const bloodTypes = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
const componentTypes = [
  { type: "WholeBlood", volume: 450, expire: 60 },
  { type: "Plasma", volume: 300, expire: 60 },
  { type: "Platelets", volume: 250, expire: 7 },
  { type: "RedCells", volume: 350, expire: 60 },
];

function randomDateInJune25() {
  const day = Math.floor(Math.random() * 25) + 1; // 1-25/6/2025
  return new Date(`2025-06-${day.toString().padStart(2, "0")}`);
}

function getExpire(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

let bloodUnits = [];
for (let i = 0; i < 50; i++) {
  // Random nhóm máu và thành phần
  const blood = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
  const comp =
    componentTypes[Math.floor(Math.random() * componentTypes.length)];
  const hospital = hospitals[i % hospitals.length];
  const dateAdded = randomDateInJune25();
  const dateExpired = getExpire(dateAdded, comp.expire);

  bloodUnits.push({
    BloodType: blood,
    ComponentType: comp.type,
    Quantity: 1, // mỗi túi 1 đơn vị
    Volume: comp.volume,
    DateAdded: dateAdded,
    DateExpired: dateExpired,
    SourceType: "import",
    note: hospital,
  });
}

async function seedBloodUnits() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await BloodUnit.deleteMany({});
    console.log("Deleted existing blood units");

    const result = await BloodUnit.insertMany(bloodUnits);
    console.log(`Inserted ${result.length} blood units`);
    console.log("Blood units seeded successfully!");
  } catch (error) {
    console.error("Error seeding blood units:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedBloodUnits();
