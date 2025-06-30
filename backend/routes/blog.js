const router = require("express").Router();
const { protect, restrictTo } = require("../middlewares/auth");
const ctrl = require("../controllers/blogController");

router.get("/", ctrl.getBlog);

router.use(protect);

router.use(restrictTo("Admin", "Member"));
//list
router.get("/mine", ctrl.getMine);
//update
router.put("/:id", ctrl.update);
router.put("/:id/approved", restrictTo("Admin"), ctrl.approve);
router.put("/:id/rejected", restrictTo("Admin"), ctrl.reject);
//create
router.post("/", ctrl.create);
//delete
router.delete("/:id", ctrl.delete);

module.exports = router;
