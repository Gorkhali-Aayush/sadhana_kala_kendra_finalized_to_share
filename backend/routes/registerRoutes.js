import express from "express";
import RegisterController from "../controllers/registerController.js";
import { adminAuth } from "../middleware/authMiddleware.js";
import { sessionTimeoutMiddleware } from "../middleware/errorCorrelationMiddleware.js";
import { validateStudentRegistration, validatePublicRegistration, handleValidationErrors } from "../utils/validationRules.js";

const router = express.Router();

router.post("/", validatePublicRegistration, handleValidationErrors, RegisterController.handlePublicRegistration);

router.get("/students", adminAuth, sessionTimeoutMiddleware, RegisterController.getAllStudents);
router.get("/students/:id", adminAuth, sessionTimeoutMiddleware, RegisterController.getStudentById);

router.post("/students", adminAuth, sessionTimeoutMiddleware, validateStudentRegistration, handleValidationErrors, RegisterController.createStudent);
router.put("/students/:id", adminAuth, sessionTimeoutMiddleware, validateStudentRegistration, handleValidationErrors, RegisterController.updateStudent);
router.delete("/students/:id", adminAuth, sessionTimeoutMiddleware, RegisterController.deleteStudent);

router.get("/registration", adminAuth, sessionTimeoutMiddleware, RegisterController.getAllRegistrations);
router.get("/registration/:id", adminAuth, sessionTimeoutMiddleware, RegisterController.getRegistrationById);

router.post("/registration", adminAuth, sessionTimeoutMiddleware, validateStudentRegistration, handleValidationErrors, RegisterController.createRegistration);
router.put("/registration/:id", adminAuth, sessionTimeoutMiddleware, validateStudentRegistration, handleValidationErrors, RegisterController.updateRegistration);
router.patch("/registration/:id/status", adminAuth, sessionTimeoutMiddleware, RegisterController.updateRegistrationStatus);
router.delete("/registration/:id", adminAuth, sessionTimeoutMiddleware, RegisterController.deleteRegistration);

export default router;