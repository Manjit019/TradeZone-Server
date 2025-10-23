import mongoose from "mongoose";

const HoldingSchema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    stock : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
        required: true,
    },
    quantity : {
        type : Number,
        required : true,
    },
    buyPrice : {
        type : Number,
        required : true,
    },
    timestamp : {
        type : Date,
        default : Date.now,
    }
})

const Holding = mongoose.model('Holding', HoldingSchema)
export default Holding ;
