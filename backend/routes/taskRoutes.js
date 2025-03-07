const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStatistics,
} = require("../controllers/taskController");
const { protect } = require("../middleware/auth");
const { validateTaskInput } = require("../utils/validation");

router
  .route("/")
  .post(protect, validateTaskInput, createTask)
  .get(protect, getTasks);

router.route("/statistics").get(protect, getTaskStatistics);

router
  .route("/:id")
  .get(protect, getTaskById)
  .put(protect, validateTaskInput, updateTask)
  .delete(protect, deleteTask);

module.exports = router;
