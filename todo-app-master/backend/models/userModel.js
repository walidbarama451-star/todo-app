import mongoose from "mongoose";
import joi from "joi";

const schema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    resetTokenHash: {
        type: String,
        select: false
    },
    resetTokenExpires: {
        type: Date,
        select: false
    }
});

const registerValidation = (obj) => {
    const schema = joi.object({
        username: joi.string().trim().required(),
        email: joi.string().email().trim().lowercase().required(),
        password: joi.string().min(8).required()
    });
    return schema.validate(obj);
};

const loginValidation = (obj) => {
    const schema = joi.object({
        email: joi.string().email().trim().lowercase().required(),
        password: joi.string().required()
    });
    return schema.validate(obj);
};

const emailValidation = (obj) => {
    const schema = joi.object({
        email: joi.string().email().trim().lowercase().required()
    });
    return schema.validate(obj);
};

const User = mongoose.model("User", schema);

export { User, registerValidation, loginValidation, emailValidation };
