require("dotenv").config();
const mongoose = require("mongoose");
const BloodUnit = require("./models/BloodUnit");

async function seedBloodUnits() {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/blooddonation");
    console.log("Connected to MongoDB");

    const bloodUnits = [
        // A+ WholeBlood Units
        {
            BloodType: "A+",
            ComponentType: "WholeBlood",
            Quantity: 1,
            Volume: 450,
            DateAdded: new Date(),
            DateExpired: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
            SourceType: "import",
            note: "Test A+ Whole Blood Unit 1",
        },
        {
            BloodType: "A+",
            ComponentType: "WholeBlood",
            Quantity: 1,
            Volume: 450,
            DateAdded: new Date(),
            DateExpired: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
            SourceType: "import",
            note: "Test A+ Whole Blood Unit 2",
        },
        // A- WholeBlood Units
        {
            BloodType: "A-",
            ComponentType: "WholeBlood",
            Quantity: 1,
            Volume: 450,
            DateAdded: new Date(),
            DateExpired: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
            SourceType: "import",
            note: "Test A- Whole Blood Unit",
        },
        // O+ WholeBlood Units
        {
            BloodType: "O+",
            ComponentType: "WholeBlood",
            Quantity: 1,
            Volume: 450,
            DateAdded: new Date(),
            DateExpired: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
            SourceType: "import",
            note: "Test O+ Whole Blood Unit",
        },
        // O- WholeBlood Units
        {
            BloodType: "O-",
            ComponentType: "WholeBlood",
            Quantity: 1,
            Volume: 450,
            DateAdded: new Date(),
            DateExpired: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
            SourceType: "import",
            note: "Test O- Whole Blood Unit",
        },
        // A+ Plasma Units
        {
            BloodType: "A+",
            ComponentType: "Plasma",
            Quantity: 1,
            Volume: 200,
            DateAdded: new Date(),
            DateExpired: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            SourceType: "import",
            note: "Test A+ Plasma Unit",
        },
        // A+ Platelets Units
        {
            BloodType: "A+",
            ComponentType: "Platelets",
            Quantity: 1,
            Volume: 100,
            DateAdded: new Date(),
            DateExpired: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
            SourceType: "import",
            note: "Test A+ Platelets Unit",
        },
        // A+ RedCells Units
        {
            BloodType: "A+",
            ComponentType: "RedCells",
            Quantity: 1,
            Volume: 250,
            DateAdded: new Date(),
            DateExpired: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days from now
            SourceType: "import",
            note: "Test A+ Red Cells Unit",
        },
    ];

    try {
        console.log("Deleting existing blood units...");
        await BloodUnit.deleteMany({});

        console.log("Adding new blood units...");
        for (const unit of bloodUnits) {
            const newUnit = new BloodUnit(unit);
            await newUnit.save();
            console.log(`Created blood unit: ${unit.BloodType} ${unit.ComponentType}`);
        }

        console.log("Blood units seeded successfully!");
    } catch (err) {
        console.error("Error seeding blood units:", err);
    } finally {
        await mongoose.disconnect();
        console.log("MongoDB disconnected");
    }
}

seedBloodUnits().catch(console.error);
