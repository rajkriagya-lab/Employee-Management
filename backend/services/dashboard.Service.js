import prisma from "../db.js";

/**
 * GET ADMIN ADHSBOARD
 */

export const getAdminDashboardData = async () => {
    /**
     * counting every one who is running/ working in the company 
     */

    const [
        totalUser,
        totalEmployee,
        totalDepartment,
        totalTask,
        totalLeave,
        pendingLeave,
        totalNotice,
    ] = await Promise.all([
        prisma.user.count(),

        prisma.employee.count(),

        prisma.department.count(),

        prisma.task.count(),

        prisma.leave.count(),

        prisma.leave.count({
            where: {
                status: "PENDING",
            },
        }),

        prisma.notice.count(),
    ]);

    /**
     * STATUS WHERE WE GET THE EMPLOYE IS ACTIVE OR INACTIVE
     */

    const [
        activeEmployees,
        inactiveEmployees,
    ] = await Promise.all([
        prisma.user.count({
            where: {
                role: "EMPLOYEE",
                isActive: true,
            },
        }),

        prisma.user.count({
            where: {
                role: "EMPLOYEE",
                isActive: false,
            },
        }),
    ]);

    /**
     * TASK STATISTICS
     */

    const [
        todoTask,
        inProgressTask,
        completeTask,
        cancelledTask,
    ] = await Promise.all([
        prisma.task.count({
            where: {
                status: "TODO",
            },
        }),

        prisma.task.count({
            where: {
                status: "IN_PROGRESS",
            },
        }),

        prisma.task.count({
            where: {
                status: "COMPLETE",
            },
        }),

        prisma.task.count({
            where: {
                status: "CANCELLED",
            },
        }),
    ]);

    /**
     * TODAY
     */

    const startOfToday = new Date();

    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = newDate();

    endOfToday.setHours(23, 59, 59, 999);

    /**
     * PRESENT
     */

    const [
        presentToday,
        absentToday,
        lateToday,
        halfDayToday,
        leaveToday,
    ] = await Promise.all([
        prisma.attendance.count({
            where: {
                data: {
                    gte: startOfToday,
                    lte: endOfToday,
                },
                status: "PRESENT",
            },
        }),

        prisma.attendance.count({
            where: {
                data: {
                    gte: startOfToday,
                    lte: endOfToday,
                },
                status: "ABESENT",
            },
        }),

        prisma.attendance.count({
            where: {
                data: {
                    gte: startOfToday,
                    lte: endOfToday,
                },
                status: "LATE",
            },
        }),

        prisma.attendance.count({
            where: {
                data: {
                    gte: startOfToday,
                    lte: endOfToday,
                },
                status: "HALF_DAY",
            },
        }),

        prisma.attendance.count({
            where: {
                data: {
                    gte: startOfToday,
                    lte: endOfToday,
                },
                status: "LEAVE"
            },
        }),
    ]);

    /**
     * RECENT DATA
     */

    const [
        recentEmployees,
        recentTasks,
        recentLeaves,
        recentNotices,
        recentPayrolls,
    ] = await Promise.all([

        prisma.employee.findMany({
            take: 5,

            orderBy: {
                id: "desc",
            },

            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        isActive: true,
                    },
                },

                department: true,
            },
        }),


        prisma.task.findMany({
            take: 5,

            orderBy: {
                createdAt: "desc",
            },

            include: {
                employee: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },

                assignedByUser: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        }),


        prisma.leave.findMany({
            take: 5,

            orderBy: {
                createdAt: "desc",
            },

            include: {
                employee: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        }),


        prisma.notice.findMany({
            take: 5,

            orderBy: {
                createdAt: "desc",
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
        }),


        prisma.payroll.findMany({
            take: 5,

            orderBy: {
                createdAt: "desc",
            },

            include: {
                employee: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        }),
    ]);


    return {
        overview: {
            totalUsers,
            totalEmployees,
            activeEmployees,
            inactiveEmployees,
            totalDepartments,
            totalTasks,
            totalLeaves,
            pendingLeaves,
            totalNotices,
        },

        tasks: {
            total: totalTasks,
            todo: todoTasks,
            inProgress: inProgressTasks,
            completed: completedTasks,
            cancelled: cancelledTasks,
        },

        attendance: {
            present: presentToday,
            absent: absentToday,
            late: lateToday,
            halfDay: halfDayToday,
            leave: leaveToday,
        },

        recentEmployees,
        recentTasks,
        recentLeaves,
        recentNotices,
        recentPayrolls,
    };
};

/**
 * EMPLOYEE DASHBOARD
 */

export const getEmployeeDashboardData = async (
  userId
) => {

  const employee =
    await prisma.employee.findUnique({
      where: {
        userId: Number(userId),
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },

        department: true,
      },
    });


  if (!employee) {
    throw new Error(
      "Employee profile not found"
    );
  }


  // ---------------------------------------------------
  // TASKS
  // ---------------------------------------------------

  const [
    totalTasks,
    todoTasks,
    inProgressTasks,
    completedTasks,
  ] = await Promise.all([
    prisma.task.count({
      where: {
        employeeId: employee.id,
      },
    }),

    prisma.task.count({
      where: {
        employeeId: employee.id,
        status: "TODO",
      },
    }),

    prisma.task.count({
      where: {
        employeeId: employee.id,
        status: "IN_PROGRESS",
      },
    }),

    prisma.task.count({
      where: {
        employeeId: employee.id,
        status: "COMPLETED",
      },
    }),
  ]);


  // ---------------------------------------------------
  // LEAVES
  // ---------------------------------------------------

  const [
    totalLeaves,
    pendingLeaves,
    approvedLeaves,
    rejectedLeaves,
  ] = await Promise.all([
    prisma.leave.count({
      where: {
        employeeId: employee.id,
      },
    }),

    prisma.leave.count({
      where: {
        employeeId: employee.id,
        status: "PENDING",
      },
    }),

    prisma.leave.count({
      where: {
        employeeId: employee.id,
        status: "APPROVED",
      },
    }),

    prisma.leave.count({
      where: {
        employeeId: employee.id,
        status: "REJECTED",
      },
    }),
  ]);


  // ---------------------------------------------------
  // TODAY ATTENDANCE
  // ---------------------------------------------------

  const startOfToday = new Date();

  startOfToday.setHours(0, 0, 0, 0);


  const endOfToday = new Date();

  endOfToday.setHours(
    23,
    59,
    59,
    999
  );


  const todayAttendance =
    await prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,

        date: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });


  // ---------------------------------------------------
  // RECENT DATA
  // ---------------------------------------------------

  const [
    myTasks,
    myLeaves,
    notifications,
    unreadNotifications,
    notices,
    payrolls,
  ] = await Promise.all([

    prisma.task.findMany({
      where: {
        employeeId: employee.id,
      },

      take: 5,

      orderBy: {
        dueDate: "asc",
      },
    }),


    prisma.leave.findMany({
      where: {
        employeeId: employee.id,
      },

      take: 5,

      orderBy: {
        createdAt: "desc",
      },
    }),


    prisma.notification.findMany({
      where: {
        userId: Number(userId),
      },

      take: 5,

      orderBy: {
        createdAt: "desc",
      },
    }),


    prisma.notification.count({
      where: {
        userId: Number(userId),
        isRead: false,
      },
    }),


    prisma.notice.findMany({
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

      take: 5,

      orderBy: {
        createdAt: "desc",
      },
    }),


    prisma.payroll.findMany({
      where: {
        employeeId: employee.id,
      },

      take: 5,

      orderBy: [
        {
          year: "desc",
        },
        {
          month: "desc",
        },
      ],
    }),
  ]);


  return {
    employee,

    tasks: {
      total: totalTasks,
      todo: todoTasks,
      inProgress: inProgressTasks,
      completed: completedTasks,
    },

    leaves: {
      total: totalLeaves,
      pending: pendingLeaves,
      approved: approvedLeaves,
      rejected: rejectedLeaves,
    },

    attendance: {
      today: todayAttendance,
    },

    myTasks,
    myLeaves,

    notifications: {
      unread: unreadNotifications,
      recent: notifications,
    },

    notices,

    payrolls,
  };
};