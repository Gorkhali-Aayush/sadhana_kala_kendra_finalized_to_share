    import express from "express";
    import RegisterController from "../controllers/registerController.js";
    import { adminAuth } from "../middleware/authMiddleware.js";

    const router = express.Router();

    router.post("/", RegisterController.handlePublicRegistration);

    router.get("/students", adminAuth, RegisterController.getAllStudents);
    router.get("/students/:id", adminAuth, RegisterController.getStudentById);

    router.post("/students", adminAuth, RegisterController.createStudent);
    router.put("/students/:id", adminAuth, RegisterController.updateStudent);
    router.delete("/students/:id", adminAuth, RegisterController.deleteStudent);

    router.get("/registration", adminAuth, RegisterController.getAllRegistrations);
    router.get("/registration/:id", adminAuth, RegisterController.getRegistrationById);

    router.post("/registration", adminAuth, RegisterController.createRegistration);
    router.put("/registration/:id", adminAuth, RegisterController.updateRegistration);
    router.patch("/registration/:id/status", adminAuth, RegisterController.updateRegistrationStatus);
    router.delete("/registration/:id", adminAuth, RegisterController.deleteRegistration);

    export default router;