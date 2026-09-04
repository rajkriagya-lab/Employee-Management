import { body } from "express-validator";

export const createTaskValidator = [
     body("title")
    .trim()
    .notEmpty()
    .withMessage("Task title is required")
    .isLength({ min: 2, max: 200 })
    .withMessage(
      "Task title must be between 2 and 200 characters"
    ),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage(
      "Description cannot exceed 2000 characters"
    ),

  body("employeeId")
    .notEmpty()
    .withMessage("Employee ID is required")
    .isInt({ min: 1 })
    .withMessage(
      "Employee ID must be a valid number"
    ),

  body("priority")
    .optional()
    .isIn([
      "LOW",
      "MEDIUM",
      "HIGH",
      "URGENT",
    ])
    .withMessage(
      "Invalid task priority"
    ),

  body("dueDate")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage(
      "Due date must be valid"
    ),
];

export const upatedTaskValidator = [
    body("title")
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage(
      "Task title must be between 2 and 200 characters"
    ),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage(
      "Description cannot exceed 2000 characters"
    ),

  body("employeeId")
    .optional()
    .isInt({ min: 1 })
    .withMessage(
      "Invalid employee ID"
    ),

  body("priority")
    .optional()
    .isIn([
      "LOW",
      "MEDIUM",
      "HIGH",
      "URGENT",
    ])
    .withMessage(
      "Invalid task priority"
    ),

  body("status")
    .optional()
    .isIn([
      "TODO",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ])
    .withMessage(
      "Invalid task status"
    ),

  body("dueDate")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage(
      "Invalid due date"
    ),
];

export const updateTaskStatusValidator = [
    body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn([
      "TODO",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ])
    .withMessage(
      "Invalid task status"
    ),
];