const express = require("express");
const validate = require("../middleware/validate");
const { requireAdmin } = require("../middleware/auth");
const schemas = require("../lib/schemas");
const { getUsers, createUser, updateUser, deleteUser } = require("../controllers/userController");

const router = express.Router();

router.use(requireAdmin);
router.get("/", getUsers);
router.post("/", validate(schemas.createUser), createUser);
router.patch("/:id", validate(schemas.updateUser), updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
