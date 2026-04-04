import mongoose, { type Document, type Model, Schema } from "mongoose";

export type SubscriberSource = "exit_popup" | "spin_wheel" | "back_in_stock" | "other";
export type SubscriberStatus = "active" | "converted" | "notified";

export interface ISubscriber extends Document {
  shopId: string;
  email: string;
  phone?: string;
  source: SubscriberSource;
  discountCode?: string;
  prizeName?: string;
  productId?: string;
  variantId?: string;
  productTitle?: string;
  variantTitle?: string;
  status: SubscriberStatus;
  subscribedAt: Date;
}

const subscriberSchema = new Schema<ISubscriber>(
  {
    shopId: { type: String, required: true, index: true },
    email: { type: String, required: true },
    phone: { type: String },
    source: {
      type: String,
      enum: ["exit_popup", "spin_wheel", "back_in_stock", "other"],
      required: true,
    },
    discountCode: { type: String },
    prizeName: { type: String },
    productId: { type: String },
    variantId: { type: String },
    productTitle: { type: String },
    variantTitle: { type: String },
    status: {
      type: String,
      enum: ["active", "converted", "notified"],
      default: "active",
    },
    subscribedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

subscriberSchema.index({ shopId: 1, email: 1, source: 1 });
subscriberSchema.index({ shopId: 1, productId: 1, status: 1 }); // for back-in-stock lookups

export const Subscriber: Model<ISubscriber> =
  mongoose.models.Subscriber ||
  mongoose.model<ISubscriber>("Subscriber", subscriberSchema);
