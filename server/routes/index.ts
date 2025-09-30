import express from "express";
import studentRoutes from "./students";
import teacherRoutes from "./teachers";
import otpRoutes from "./otp";

const router = express.Router();

router.use("/students", studentRoutes);
router.use("/teachers", teacherRoutes);
router.use("/otp", otpRoutes);

export default router;
