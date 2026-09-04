import { body } from "express-validator";

export const registerValidator = [
    body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is requried")
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
    .withMessage("Password is requried")
    .isLength({min:6})
    .withMessage("Password must be at least 6 characters"),
];

export const loginValidator = [
    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is requried")
    .isEmail
    .withMessage(("Please provide a valid email"))
    .normalizeEmail(),

    body("password")
    .notEmpty()
    .withMessage("Password is requried"),
];

export const changePasswordValidation = [
    body("currentPassword")
    .notEmpty()
    .withMessage("Current password is requried"),

    body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({min:6})
    .withMessage("New password must be least 6 characters"),
];