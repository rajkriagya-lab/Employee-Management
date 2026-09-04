import prisma from "../db.js";

// =====================================================
// CREATE NOTICE
// =====================================================

export const createNotice = async (req, res) => {
  try {
    const {
      title,
      message,
      priority,
      expiresAt,
    } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    // Validate priority
    const allowedPriorities = [
      "LOW",
      "NORMAL",
      "HIGH",
      "URGENT",
    ];

    const noticePriority = priority || "NORMAL";

    if (!allowedPriorities.includes(noticePriority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notice priority",
      });
    }

    // Validate expiry date
    let parsedExpiresAt = null;

    if (expiresAt) {
      parsedExpiresAt = new Date(expiresAt);

      if (Number.isNaN(parsedExpiresAt.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid expiry date",
        });
      }
    }

    // Create notice
    const notice = await prisma.notice.create({
      data: {
        title: title.trim(),
        message: message.trim(),
        priority: noticePriority,
        expiresAt: parsedExpiresAt,
        createdBy: req.user.id,
      },

      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Notice created successfully",
      notice,
    });
  } catch (error) {
    console.error("CREATE NOTICE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create notice",
    });
  }
};


// =====================================================
// GET ALL NOTICES
// =====================================================

export const getAllNotices = async (req, res) => {
  try {
    const { priority, active } = req.query;

    const where = {};

    // Filter priority
    if (priority) {
      const allowedPriorities = [
        "LOW",
        "NORMAL",
        "HIGH",
        "URGENT",
      ];

      if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid notice priority",
        });
      }

      where.priority = priority;
    }

    // Filter active notices
    if (active === "true") {
      where.OR = [
        {
          expiresAt: null,
        },
        {
          expiresAt: {
            gt: new Date(),
          },
        },
      ];
    }

    const notices = await prisma.notice.findMany({
      where,

      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: notices.length,
      notices,
    });
  } catch (error) {
    console.error("GET ALL NOTICES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notices",
    });
  }
};


// =====================================================
// GET ACTIVE NOTICES
// =====================================================

export const getActiveNotices = async (req, res) => {
  try {
    const notices = await prisma.notice.findMany({
      where: {
        OR: [
          {
            expiresAt: null,
          },
          {
            expiresAt: {
              gt: new Date(),
            },
          },
        ],
      },

      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },

      orderBy: [
        {
          priority: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return res.status(200).json({
      success: true,
      count: notices.length,
      notices,
    });
  } catch (error) {
    console.error("GET ACTIVE NOTICES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch active notices",
    });
  }
};


// =====================================================
// GET NOTICE BY ID
// =====================================================

export const getNoticeById = async (req, res) => {
  try {
    const noticeId = Number(req.params.id);

    if (Number.isNaN(noticeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notice ID",
      });
    }

    const notice = await prisma.notice.findUnique({
      where: {
        id: noticeId,
      },

      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    return res.status(200).json({
      success: true,
      notice,
    });
  } catch (error) {
    console.error("GET NOTICE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notice",
    });
  }
};


// =====================================================
// UPDATE NOTICE
// =====================================================

export const updateNotice = async (req, res) => {
  try {
    const noticeId = Number(req.params.id);

    const {
      title,
      message,
      priority,
      expiresAt,
    } = req.body;

    if (Number.isNaN(noticeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notice ID",
      });
    }

    // Check notice
    const existingNotice =
      await prisma.notice.findUnique({
        where: {
          id: noticeId,
        },
      });

    if (!existingNotice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    // Validate priority
    const allowedPriorities = [
      "LOW",
      "NORMAL",
      "HIGH",
      "URGENT",
    ];

    if (
      priority &&
      !allowedPriorities.includes(priority)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid notice priority",
      });
    }

    // Validate expiry date
    let parsedExpiresAt;

    if (expiresAt !== undefined && expiresAt !== null) {
      parsedExpiresAt = new Date(expiresAt);

      if (Number.isNaN(parsedExpiresAt.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid expiry date",
        });
      }
    }

    const updatedNotice =
      await prisma.notice.update({
        where: {
          id: noticeId,
        },

        data: {
          ...(title !== undefined && {
            title: title.trim(),
          }),

          ...(message !== undefined && {
            message: message.trim(),
          }),

          ...(priority !== undefined && {
            priority,
          }),

          ...(expiresAt !== undefined && {
            expiresAt:
              parsedExpiresAt || null,
          }),
        },

        include: {
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

    return res.status(200).json({
      success: true,
      message: "Notice updated successfully",
      notice: updatedNotice,
    });
  } catch (error) {
    console.error("UPDATE NOTICE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notice",
    });
  }
};


// =====================================================
// DELETE NOTICE
// =====================================================

export const deleteNotice = async (req, res) => {
  try {
    const noticeId = Number(req.params.id);

    if (Number.isNaN(noticeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notice ID",
      });
    }

    const notice = await prisma.notice.findUnique({
      where: {
        id: noticeId,
      },
    });

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    await prisma.notice.delete({
      where: {
        id: noticeId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    console.error("DELETE NOTICE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete notice",
    });
  }
};