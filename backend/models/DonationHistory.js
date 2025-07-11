const { Schema, model, Types } = require("mongoose");

const donationHistorySchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    donationDate: {
      type: Date,
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      required: true,
    },
    component: {
      type: String,
      enum: ["WholeBlood", "Plasma", "Platelets", "RedCells"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Completed", "Canceled"],
      required: true,
      default: "Completed",
    },
    quantity: {
      type: Number,
      min: 1, // Thay đổi giá trị tối thiểu thành 0 để cho phép bỏ trống trong trường hợp hủy
    },
    volume: { type: Number, min: 1 },

    healthCheck: {
      weight: {
        type: Number,
        min: [45, "Cân nặng phải tối thiểu 45 kg"],
        max: [200, "Cân nặng tối đa 200 kg"],
        required: [true, "Vui lòng nhập cân nặng"],
      },
      height: {
        type: Number,
        min: [145, "Chiều cao tối thiểu 145 cm"],
        max: [220, "Chiều cao tối đa 220 cm"],
        required: [true, "Vui lòng nhập chiều cao"],
      },
      bloodPressure: {
        type: String,
        validate: {
          validator: function (v) {
            // Pattern: số/số, ví dụ 120/80, 110/70
            return /^\d{2,3}\/\d{2,3}$/.test(v);
          },
          message: "Huyết áp phải đúng định dạng, ví dụ: 120/80",
        },
        required: [true, "Vui lòng nhập huyết áp"],
      },
      heartRate: {
        type: Number,
        min: [60, "Mạch đập/phút tối thiểu là 40"],
        max: [100, "Mạch đập/phút tối đa là 180"],
        required: [true, "Vui lòng nhập mạch đập"],
      },
      alcoholLevel: {
        type: Number,
        min: [0, "Nồng độ cồn không thể âm"],
        max: [1, "Nồng độ cồn tối đa là 1.0"],
        required: [true, "Vui lòng nhập mạch đập"],
      },
      temperature: {
        type: Number,
        min: [36, "Nhiệt độ tối thiểu là 36°C"],
        max: [38, "Nhiệt độ tối đa là 38°C"],
        required: [true, "Vui lòng nhập nhiệt độ cơ thể"],
      },
      hemoglobin: {
        type: Number,
        min: [120, "Chỉ số Hemoglobin tối thiểu là 90 g/L"],
        max: [180, "Chỉ số Hemoglobin tối đa là 180 g/L"],
        required: [true, "Vui lòng nhập chỉ số Hemoglobin"],
      },
    },
    cancellation: {
      reason: String,
      followUpDate: Date,
    },
    nextEligibleDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("DonationHistory", donationHistorySchema);
