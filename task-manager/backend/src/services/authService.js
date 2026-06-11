// src/services/authService.js
import prisma from '../config/prisma.js';

/**
 * Cria um novo utilizador no PostgreSQL
 */
export async function registerUser({ username, email, password, role }) {
  const userExists = await prisma.user.findUnique({
    where: { email }
  });

  if (userExists) {
    throw new Error('Este e-mail já está cadastrado!');
  }

  const newUser = await prisma.user.create({
    data: {
      name: username,
      email,
      password,
      role: role || 'membro'
    }
  });

  return newUser;
}

/**
 * Valida o login do utilizador no PostgreSQL
 */
export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user || user.password !== password) {
    throw new Error('E-mail ou senha incorretos!');
  }

  return user;
}