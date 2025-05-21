require("dotenv").config();
const mongoose = require("mongoose");
const Vocabulary = require("../models/vocabulary");
const User = require("../models/user"); // Assuming you have a User model to associate words with

async function seedVocabulary() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find a user to associate these words with.
    // You might want to create a specific "seed user" or use an existing one.
    const sampleUser = await User.findOne({});
    if (!sampleUser) {
      console.error(
        "No user found to associate vocabulary with. Please seed a user first."
      );
      await mongoose.disconnect();
      return;
    }

    const initialVocabulary = [
      {
        word: "Ephemeral",
        definition: "Lasting for a very short time.",
        userId: sampleUser._id,
      },
      {
        word: "Ubiquitous",
        definition: "Present, appearing, or found everywhere.",
        userId: sampleUser._id,
      },
      {
        word: "Serendipity",
        definition: "The occurrence of happy accidents or agreeable surprises.",
        userId: sampleUser._id,
      },
      {
        word: "Mellifluous",
        definition: "(of a voice or words) sweet or musical; pleasant to hear.",
        userId: sampleUser._id,
      },
      {
        word: "Lackadaisical",
        definition: "Lacking enthusiasm and determination; carelessly lazy.",
        userId: sampleUser._id,
      },
      {
        word: "Pernicious",
        definition:
          "Having a harmful effect, especially in a gradual or subtle way.",
        userId: sampleUser._id,
      },
      {
        word: "Gregarious",
        definition: "(of a person) fond of company; sociable.",
        userId: sampleUser._id,
      },
      {
        word: "Taciturn",
        definition:
          "(of a person) reserved or uncommunicative in speech; saying little.",
        userId: sampleUser._id,
      },
      {
        word: "Eloquent",
        definition: "Fluent or persuasive in speaking or writing.",
        userId: sampleUser._id,
      },
      {
        word: "Incipient",
        definition: "Beginning to happen or develop.",
        userId: sampleUser._id,
      },
      {
        word: "Juxtaposition",
        definition:
          "The fact of two things being seen or placed close together with contrasting effect.",
        userId: sampleUser._id,
      },
      {
        word: "Conundrum",
        definition: "A confusing and difficult problem or question.",
        userId: sampleUser._id,
      },
      {
        word: "Esoteric",
        definition:
          "Understood by or meant for only the select few who have special knowledge or interest.",
        userId: sampleUser._id,
      },
      {
        word: "Lugubrious",
        definition: "Looking or sounding sad and dismal.",
        userId: sampleUser._id,
      },
      {
        word: "Obfuscate",
        definition: "Render obscure, unclear, or unintelligible.",
        userId: sampleUser._id,
      },
      {
        word: "Pugnacious",
        definition: "Eager or quick to argue, quarrel, or fight.",
        userId: sampleUser._id,
      },
      {
        word: "Quixotic",
        definition: "Exceedingly idealistic; unrealistic and impractical.",
        userId: sampleUser._id,
      },
      {
        word: "Sagacious",
        definition:
          "Having or showing keen mental discernment and good judgment; shrewd.",
        userId: sampleUser._id,
      },
      {
        word: "Superfluous",
        definition: "Unnecessary, especially through being more than enough.",
        userId: sampleUser._id,
      },
      {
        word: "Vicissitude",
        definition:
          "A change of circumstances or fortune, typically one that is unwelcome or unpleasant.",
        userId: sampleUser._id,
      },
    ];

    // Insert the vocabulary words, but only if they don't already exist for the user
    for (const vocabData of initialVocabulary) {
      const existingWord = await Vocabulary.findOne({
        userId: vocabData.userId,
        word: vocabData.word,
      });
      if (!existingWord) {
        const newWord = new Vocabulary(vocabData);
        await newWord.save();
        console.log(
          `Seeded word: ${newWord.word} for user ${sampleUser.username}`
        );
      } else {
        console.log(
          `Word already exists for user ${sampleUser.username}: ${vocabData.word}`
        );
      }
    }

    console.log("Vocabulary seeding completed.");
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding vocabulary:", error);
    process.exit(1);
  }
}

seedVocabulary();
