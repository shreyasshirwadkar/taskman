const Task = require("../models/Task");

// POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const { title, startTime, endTime, priority } = req.body;

    const task = await Task.create({
      title,
      startTime,
      endTime,
      priority,
      status: "pending",
      user: req.user.id,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = { user: req.user.id };

    if (
      req.query.status &&
      ["pending", "finished"].includes(req.query.status)
    ) {
      filter.status = req.query.status;
    }

    if (
      req.query.priority &&
      parseInt(req.query.priority) >= 1 &&
      parseInt(req.query.priority) <= 5
    ) {
      filter.priority = parseInt(req.query.priority);
    }

    let sort = {};
    if (req.query.sortBy) {
      const allowedSortFields = [
        "startTime",
        "-startTime",
        "endTime",
        "-endTime",
      ];

      if (allowedSortFields.includes(req.query.sortBy)) {
        const sortField = req.query.sortBy.startsWith("-")
          ? req.query.sortBy.substring(1)
          : req.query.sortBy;
        const sortOrder = req.query.sortBy.startsWith("-") ? -1 : 1;

        sort[sortField] = sortOrder;
      }
    } else {
      sort.createdAt = -1;
    }

    const tasks = await Task.find(filter).sort(sort).skip(skip).limit(limit);

    const total = await Task.countDocuments(filter);

    res.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//GET /api/tasks/:id
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this task" });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this task" });
    }

    if (req.body.status === "finished" && task.status === "pending") {
      req.body.endTime = new Date();
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this task" });
    }

    await task.deleteOne();

    res.json({ message: "Task removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/tasks/statistics
exports.getTaskStatistics = async (req, res) => {
  try {
    const now = new Date();

    const totalCount = await Task.countDocuments({ user: req.user.id });

    const completedCount = await Task.countDocuments({
      user: req.user.id,
      status: "finished",
    });

    const pendingCount = totalCount - completedCount;

    const completedPercentage =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const pendingPercentage =
      totalCount > 0 ? Math.round((pendingCount / totalCount) * 100) : 0;

    const pendingTasksByPriority = await Task.aggregate([
      {
        $match: {
          user: req.user._id,
          status: "pending",
        },
      },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
          tasks: {
            $push: {
              _id: "$_id",
              title: "$title",
              startTime: "$startTime",
              endTime: "$endTime",
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const pendingTasksMetrics = pendingTasksByPriority.map((group) => {
      let totalTimeLapsed = 0;
      let totalBalanceTime = 0;

      group.tasks.forEach((task) => {
        // Calculate time lapsed (current time - start time)
        const startTime = new Date(task.startTime);
        let timeLapsed = 0;

        if (now > startTime) {
          timeLapsed = (now - startTime) / (1000 * 60 * 60); // Convert to hours
        }

        // Calculate balance time (end time - current time)
        const endTime = new Date(task.endTime);
        let balanceTime = 0;

        if (endTime > now) {
          balanceTime = (endTime - now) / (1000 * 60 * 60); // Convert to hours
        }

        totalTimeLapsed += timeLapsed;
        totalBalanceTime += balanceTime;
      });

      return {
        priority: group._id,
        count: group.count,
        timeLapsedHours: parseFloat(totalTimeLapsed.toFixed(2)),
        balanceTimeHours: parseFloat(totalBalanceTime.toFixed(2)),
      };
    });

    // Calculate average completion time for finished tasks
    const completedTasksStats = await Task.aggregate([
      {
        $match: {
          user: req.user._id,
          status: "finished",
        },
      },
      {
        $project: {
          completionTime: {
            $divide: [
              { $subtract: ["$endTime", "$startTime"] },
              1000 * 60 * 60, // Convert to hours
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          averageCompletionTime: { $avg: "$completionTime" },
          count: { $sum: 1 },
        },
      },
    ]);

    const averageCompletionTime =
      completedTasksStats.length > 0
        ? parseFloat(completedTasksStats[0].averageCompletionTime.toFixed(2))
        : 0;

    res.json({
      totalTasks: totalCount,
      completedTasks: {
        count: completedCount,
        percentage: completedPercentage,
      },
      pendingTasks: {
        count: pendingCount,
        percentage: pendingPercentage,
        byPriority: pendingTasksMetrics,
      },
      averageCompletionTimeHours: averageCompletionTime,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
