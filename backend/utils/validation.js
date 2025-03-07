exports.validateTaskInput = (req, res, next) => {
  const { title, startTime, endTime, priority, status } = req.body;
  const errors = {};

  if (!title) errors.title = "Title is required";

  if (!startTime || isNaN(new Date(startTime).getTime()))
    errors.startTime = "Valid start time is required";

  if (!endTime || isNaN(new Date(endTime).getTime()))
    errors.endTime = "Valid end time is required";

  if (new Date(endTime) < new Date(startTime))
    errors.endTime = "End time must be after start time";

  if (!priority || priority < 1 || priority > 5)
    errors.priority = "Priority must be between 1 and 5";

  if (status && !["pending", "finished"].includes(status))
    errors.status = "Status must be either pending or finished";

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};
