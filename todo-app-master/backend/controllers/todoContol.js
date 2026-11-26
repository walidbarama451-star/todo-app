import mongoose from "mongoose";
import { Todo, todoValidation, todoUpdateValidation } from "../models/todoModel.js";

const notFound = (res) => res.status(404).json({ message: "todo not found" });

// create todo
export const createTodo = async (req, res) => {
    const { error, value } = todoValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const todo = await Todo.create({
        title: value.title,
        description: value.description,
        userId: req.userId
    });
    return res.status(201).json({ message: "Todo created successfully", todo });
};

// get all my todos
export const getAllTodo = async (req, res) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 200, 1), 500);
    const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);

    const todos = await Todo.find({ userId: req.userId })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    return res.status(200).json(todos);
};

// get a todo
export const getTodo = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);
    const todo = await Todo.findOne({ _id: req.params.id, userId: req.userId });
    if (!todo) return notFound(res);
    return res.status(200).json({ todo });
};

// update todo
export const updateTodo = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);
    const { error, value } = todoUpdateValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const todo = await Todo.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        value,
        { new: true }
    );
    if (!todo) return notFound(res);

    return res.status(200).json({ todo, message: "updated successfully" });
};

// delete todo
export const deleteTodo = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!todo) return notFound(res);
    return res.status(200).json({ message: "todo deleted" });
};
