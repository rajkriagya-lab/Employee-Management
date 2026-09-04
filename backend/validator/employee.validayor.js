import { body } from "express-validator";

export const createEmployeeValidator = [
    body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({min:2, max:100})
    .withMessage("Name must be between 2 and 100 characters"),

    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is requried")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

    body("password")
    .notEmpty()
    .withMessage("Passwaor is required")
    .isLength({min:6})
    .withMessage("Password must be at least 6 characters"),

    body("phone")
    .optional({value: "falsy"})
    .trim()
    .isLength({max:10})
    .withMessage("Phone number should be in 10 digits"),

    body("address")
    .optional()
    .trim()
    .isLength({max:225})
    .withMessage("Address can not exceed 225 characters"),

    body("position")
    .optional()
    .trim()
    .isLength({max:100})
    .withMessage("Position cannot exceed 100 characters"),

    body("departmentId")
    .optional({values: "falsy"})
    .isInt({min: 1})
    .withMessage("Department value must be valid number"),

    body("joiningDate")
    .optional({values: "falsy"})
    .isISO8601()
    .withMessage("Joining date must be valid date"),

    body("salary")
    .optional({values: "falsy"})
    .isFloat({min:0})
    .withMessage("Salary must be a position number"),
];

export const upateEmployeeValidator =[
    
    body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({min:2, max:100})
    .withMessage("Name must be between 2 and 100 characters"),

    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is requried")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

    body("password")
    .notEmpty()
    .withMessage("Passwaor is required")
    .isLength({min:6})
    .withMessage("Password must be at least 6 characters"),

    body("phone")
    .optional({value: "falsy"})
    .trim()
    .isLength({max:10})
    .withMessage("Phone number should be in 10 digits"),

    body("address")
    .optional()
    .trim()
    .isLength({max:225})
    .withMessage("Address can not exceed 225 characters"),

    body("position")
    .optional()
    .trim()
    .isLength({max:100})
    .withMessage("Position cannot exceed 100 characters"),

    body("departmentId")
    .optional({values: "falsy"})
    .isInt({min: 1})
    .withMessage("Department value must be valid number"),

    body("joiningDate")
    .optional({values: "falsy"})
    .isISO8601()
    .withMessage("Joining date must be valid date"),

    body("salary")
    .optional({values: "falsy"})
    .isFloat({min:0})
    .withMessage("Salary must be a position number"),
];