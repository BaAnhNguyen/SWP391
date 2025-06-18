const router = require("express").Router();
const ctrl = require("../controllers/QuestionController");
const { protect, restrictTo } = require("../middlewares/auth");

router.use(protect);

//list
router.get("/", ctrl.list);

//Staff CRUD
router.post("/", restrictTo("Staff"), ctrl.create);
router.put("/:id", restrictTo("Staff"), ctrl.update);
router.delete("/:id", restrictTo("Staff"), ctrl.delete);

module.exports = router;
