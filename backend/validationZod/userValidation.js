const { z } = require("zod");

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password should be at least 6 characters"),
});

module.exports = { registerSchema };
