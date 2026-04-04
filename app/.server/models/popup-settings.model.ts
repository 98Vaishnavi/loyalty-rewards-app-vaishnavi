import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IPopupSettings extends Document {
  shopId: string;
  enabled: boolean;
  headline: string;
  subtext: string;
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  buttonText: string;
  successMessage: string;
  bgColor: string;
  accentColor: string;
  showOnMobile: boolean;
  delaySeconds: number;
  createdAt: Date;
  updatedAt: Date;
}

const popupSettingsSchema = new Schema<IPopupSettings>(
  {
    shopId: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: false },
    headline: { type: String, default: "Wait! Don't leave empty-handed 🎁" },
    subtext: { type: String, default: "Enter your email and get an exclusive discount!" },
    discountType: { type: String, enum: ["percentage", "fixed_amount"], default: "percentage" },
    discountValue: { type: Number, default: 10 },
    buttonText: { type: String, default: "Get My Discount" },
    successMessage: { type: String, default: "🎉 Your discount code is:" },
    bgColor: { type: String, default: "#ffffff" },
    accentColor: { type: String, default: "#5C6AC4" },
    showOnMobile: { type: Boolean, default: true },
    delaySeconds: { type: Number, default: 5 },
  },
  { timestamps: true },
);

export const PopupSettings: Model<IPopupSettings> =
  mongoose.models.PopupSettings ||
  mongoose.model<IPopupSettings>("PopupSettings", popupSettingsSchema);

export async function getOrCreatePopupSettings(shopId: string): Promise<IPopupSettings> {
  let s = await PopupSettings.findOne({ shopId });
  if (!s) s = await PopupSettings.create({ shopId });
  return s;
}
