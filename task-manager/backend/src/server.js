import express from 'express';
import cors from 'cors'; 
import { handleRegister, handleLogin } from './controllers/authController.js'; 
import projectRoutes from '../routes/projectRoutes.js'; // Sobe um nível para achar a pasta routes

const app = express();

app.use(cors()); 
app.use(express.json()); 

app.get('/api/status', (req, res) => {
  res.json({ status: "online", message: "Servidor voando com CORS liberado!" });
});

app.post('/api/auth/register', handleRegister);
app.post('/api/auth/login', handleLogin);

// Vincula todas as rotas ao prefixo /api
app.use("/api", projectRoutes); 

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor voando em: http://localhost:${PORT}`);
});