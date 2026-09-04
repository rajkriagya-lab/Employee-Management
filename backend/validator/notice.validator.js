import { body } from "express-validator";

export const createNotificationValidator = [
    body("title")
    .trim()
    .notEmpty()
    .withMessage("Notice title is required")
    .isLength({ min: 2, max: 200 })
    .withMessage(
      "Title must be between 2 and 200 characters"
    ),

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Notice content is required")
    .isLength({ min: 2, max: 5000 })
    .withMessage(
      "Notice content must be between 2 and 5000 characters"
    ),

  body("expiresAt")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage(
      "Expiration date must be valid"
    ),
];

export const updateNotificationValidator = [
      body("title")
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage(
      "Title must be between 2 and 200 characters"
    ),

  body("content")
    .optional()
    .trim()
    .isLength({ min: 2, max: 5000 })
    .withMessage(
      "Notice content must be between 2 and 5000 characters"
    ),

  body("expiresAt")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage(
      "Expiration date must be valid"
    ),
];