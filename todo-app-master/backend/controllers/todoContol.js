import mongoose from "mongoose";
import { Todo, todoValidation, todoUpdateValidation } from "../models/todoModel.js";

const notFound = (res) => res.status(404).json({ message: "todo not found" });

// create todo
export const createTodo = async (req, res) => {
    const { error } = todoValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    const todo = await Todo.create({
        title: req.body.title,
        description: req.body.description,
        userId: req.userId
    });
    return res.status(201).json({ message: "Todo created successfully", todo });
};

// get all my todos
export const getAllTodo = async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : undefined;

    let query = Todo.find({ userId: req.userId }).sort({ _id: -1 }).lean();
    if (skip !== undefined && !isNaN(skip)) query = query.skip(skip);
    if (limit !== undefined && !isNaN(limit)) query = query.limit(limit);

    const todos = await query;
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
    const { error } = todoUpdateValidation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const todo = await Todo.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        req.body,
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
