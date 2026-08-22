import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    itemType: {
      type: String,
      enum: ['TestSeries', 'StudyMaterial', 'SingleModelPaper', 'NonPharmaResource'],
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

purchaseSchema.index({ userId: 1, itemId: 1, expiresAt: -1 });
purchaseSchema.index({ userId: 1, itemType: 1, itemId: 1, isActive: 1 });
purchaseSchema.index({ userId: 1, isActive: 1, expiresAt: 1 });

const Purchase = mongoose.model('Purchase', purchaseSchema);
export default Purchase;
