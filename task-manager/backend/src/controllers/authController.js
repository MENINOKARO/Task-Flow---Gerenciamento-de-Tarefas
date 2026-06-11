// src/controllers/authController.js
import { registerUser, loginUser } from '../services/authService.js';

/**
 * Manipulador para o registo de contas
 */
export async function handleRegister(req, res) {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios!' });
    }

    const user = await registerUser({ username, email, password, role });

    return res.status(201).json({
      message: 'Usuário criado com sucesso!',
      user: {
        id: user.id,
        username: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

/**
 * Manipulador para o login do utilizador
 */
export async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos!' });
    }

    const user = await loginUser({ email, password });

    return res.json({
      message: 'Login realizado com sucesso!',
      isLogged: true,
      usuarioLogado: {
        id: user.id,
        username: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
}