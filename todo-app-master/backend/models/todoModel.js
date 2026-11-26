import mongoose from "mongoose";
import joi from "joi";

const schema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: false,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
});

schema.index({ userId: 1, _id: -1 });

const todoValidation = (obj) => {
    const schema = joi.object({
        title: joi.string().trim().max(120).required(),
        description: joi.string().trim().max(1000).required(),
        status: joi.boolean().default(false)
    });
    return schema.validate(obj);
};

const todoUpdateValidation = (obj) => {
    const schema = joi.object({
        title: joi.string().trim().max(120),
        description: joi.string().trim().max(1000),
        status: joi.boolean()
    });
    return schema.validate(obj);
};

const Todo = mongoose.model("Todo", schema);

export { Todo, todoValidation, todoUpdateValidation };
