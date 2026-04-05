import mongoose from "mongoose";

const paymentSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "default"
    },
    depositQrImageUrl: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const PaymentSetting = mongoose.model("PaymentSetting", paymentSettingSchema);

export default PaymentSetting;
