
const express = require("express");

const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,removeFromGroup
} = require("../controllers/chatControllers");

//for accessing and creating the chat
router.route("/").post(protect, accessChat).get(protect, fetchChats);

//for creation of group
router.route("/group").post(protect, createGroupChat); 

//for renaming of group
router.route("/rename").put(protect, renameGroup);

//remove someone from the group or leave the group
router.route("/groupremove").put(protect, removeFromGroup); 

//add someone to the group
router.route("/groupadd").put(protect, addToGroup); 

module.exports = router;