require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user");

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const initialUsers = [
      {
        username: "user1",
        email: "user1@example.com",
        password: "password123", // Will be hashed by the model's pre('save') hook
        firstName: "John", // New field
        lastName: "Doe", // New field
      },
      {
        username: "user2",
        email: "user2@example.com",
        password: "anotherpassword",
        firstName: "Jane", // New field
        lastName: "Smith", // New field
      },
    ];

    // Insert the users, but only if they don't already exist
    for (const userData of initialUsers) {
      const existingUser = await User.findOne({
        $or: [{ username: userData.username }, { email: userData.email }],
      });
      if (!existingUser) {
        const newUser = new User(userData);
        await newUser.save();
        console.log(`Seeded user: ${newUser.username}`);
      } else {
        console.log(`User already exists: ${userData.username}`);
      }
    }

    console.log("User seeding completed.");
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
}

seedUsers();
