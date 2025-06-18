require("dotenv").config();
const mongoose = require("mongoose");
const Question = require("./models/Question");

const questions = [
  {
    content: "Bạn có cảm thấy khỏe mạnh hôm nay?",
    order: 1,
  },
  {
    content: "Bạn có đang dùng thuốc kháng sinh?",
    order: 2,
  },
  {
    content: "Bạn có từng bị gan viêm, vàng da?",
    order: 3,
  },
  {
    content: "Trong 3 ngày qua, bạn có uống rượu bia?",
    order: 4,
  },
  {
    content: "Bạn có tiền sử bệnh tim mạch?",
    order: 5,
  },
  {
    content: "Bạn có bị cao huyết áp?",
    order: 6,
  },
  {
    content: "Bạn có bị tiểu đường?",
    order: 7,
  },
  {
    content: "Bạn có từng bị lao?",
    order: 8,
  },
  {
    content: "Bạn có bị hen suyễn?",
    order: 9,
  },
  {
    content: "Bạn có từng truyền máu?",
    order: 10,
  },
  {
    content: "Phụ nữ: Có đang mang thai/cho con bú không?",
    order: 11,
  },
  {
    content: "Có dùng chất kích thích, ma túy không?",
    order: 12,
  },
];

async function seedQuestions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Xóa tất cả câu hỏi cũ nếu có
    await Question.deleteMany({});
    console.log("Deleted existing questions");

    // Thêm các câu hỏi mới
    const result = await Question.insertMany(questions);
    console.log(`Inserted ${result.length} questions`);

    console.log("Questions seeded successfully!");
  } catch (error) {
    console.error("Error seeding questions:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedQuestions();
