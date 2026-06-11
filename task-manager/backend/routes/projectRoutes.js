import express from "express";
import { 
    createProject, 
    getProjectsByUser, 
    updateProject, // 🌟 Adicionado
    deleteProject, // 🌟 Adicionado
    getSprintsByProject, 
    getTasksByProject,
    createSprint,
    updateSprint, 
    deleteSprint,
    getAllUsers,
    createTask,
    updateTask,
    deleteTask 
} from "../src/controllers/projectController.js";

const router = express.Router();

// ROTA DE USUÁRIOS
router.get("/users", getAllUsers); 

// ROTAS DE PROJETOS
router.post("/projects", createProject);
router.get("/projects", getProjectsByUser);
router.put("/projects/:id", updateProject);    //   rota para editar projeto
router.delete("/projects/:id", deleteProject); //  rota para deletar projeto

// ROTAS DE SPRINTS
router.get("/sprints", getSprintsByProject);
router.post("/sprints", createSprint); 
router.put("/sprints/:id", updateSprint); 
router.delete("/sprints/:id", deleteSprint); 

// ROTAS DE TAREFAS
router.get("/tasks", getTasksByProject);
router.post("/tasks", createTask); 
router.put("/tasks/:id", updateTask); 
router.delete("/tasks/:id", deleteTask); 

export default router;