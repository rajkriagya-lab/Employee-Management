import { body } from "express-validator";

export const createNoticeValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Notice title is required")
    .isLength({ min: 2, max: 200 })
    .withMessage("Title must be between 2 and 200 characters"),

  body("message")
    .trim()
    .notEmpty()
    .withMessage("Notice message is required")
    .isLength({ min: 2, max: 5000 })
    .withMessage("Notice message must be between 2 and 5000 characters"),

  body("priority")
    .optional()
    .isIn(["LOW", "NORMAL", "HIGH", "URGENT"])
    .withMessage("Invalid notice priority"),

  body("expiresAt")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Expiration date must be valid"),
];

export const updateNoticeValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Title must be between 2 and 200 characters"),

  body("message")
    .optional()
    .trim()
    .isLength({ min: 2, max: 5000 })
    .withMessage("Notice message must be between 2 and 5000 characters"),

  body("priority")
    .optional()
    .isIn(["LOW", "NORMAL", "HIGH", "URGENT"])
    .withMessage("Invalid notice priority"),

  body("expiresAt")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Expiration date must be valid"),
];

export const createNotificationValidator = createNoticeValidator;
export const updateNotificationValidator = updateNoticeValidator;