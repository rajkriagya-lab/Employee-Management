import { body } from "express-validator";

export const createLeaveVaildators = [
    body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage(
      "Start date must be valid"
    ),

  body("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage(
      "End date must be valid"
    ),

  body("leaveType")
    .notEmpty()
    .withMessage("Leave type is required")
    .isIn([
      "CASUAL",
      "SICK",
      "ANNUAL",
      "MATERNITY",
      "PATERNITY",
      "UNPAID",
      "OTHER",
    ])
    .withMessage(
      "Invalid leave type"
    ),

  body("reason")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage(
      "Reason cannot exceed 1000 characters"
    ),
];

export const reviewLeaveValidtor = [
     body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn([
      "APPROVED",
      "REJECTED",
    ])
    .withMessage(
      "Status must be APPROVED or REJECTED"
    ),

  body("rejectionReason")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage(
      "Rejection reason cannot exceed 1000 characters"
    ),
];