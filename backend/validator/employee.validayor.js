import { body } from "express-validator";

export const createEmployeeValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("phone")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 32 })
    .withMessage("Phone number cannot exceed 32 characters"),

  body("address")
    .optional()
    .trim()
    .isLength({ max: 225 })
    .withMessage("Address cannot exceed 225 characters"),

  body("position")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Position cannot exceed 100 characters"),

  body("departmentId")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("Department value must be a valid number"),

  body("joiningDate")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Joining date must be valid"),

  body("salary")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("Salary must be a non-negative number"),
];

export const updateEmployeeValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .optional({ values: "falsy" })
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("phone")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 32 })
    .withMessage("Phone number cannot exceed 32 characters"),

  body("address")
    .optional()
    .trim()
    .isLength({ max: 225 })
    .withMessage("Address cannot exceed 225 characters"),

  body("position")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Position cannot exceed 100 characters"),

  body("departmentId")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("Department value must be a valid number"),

  body("joiningDate")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Joining date must be valid"),

  body("salary")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("Salary must be a non-negative number"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean")
    .toBoolean(),
];

export const upateEmployeeValidator = updateEmployeeValidator;