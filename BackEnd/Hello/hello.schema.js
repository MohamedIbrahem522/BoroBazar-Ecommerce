import mongoose from 'mongoose';
const { Schema } = mongoose;
const helloSchema = new Schema({
    name: {
        type: String,

    }
});

export default mongoose.model("Hello", helloSchema);