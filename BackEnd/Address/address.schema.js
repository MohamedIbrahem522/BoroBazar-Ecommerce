import mongoose from 'mongoose';
const { Schema } = mongoose;

const addressSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },

}, { timestamps: true });

export default mongoose.model('Address', addressSchema);
