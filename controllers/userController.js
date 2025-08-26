import { showUsers, deleteUser, editUsers } from '../service/userService.js';
import { getAllUsersWithImages } from '../models/userModel.js';
import logger from '../utils/logger.js';

// GET /admin
export const getAdminUsersController = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 25;
    let offset = (page - 1) * limit;

    const users = await getAllUsersWithImages(limit, offset);

    logger.info(`Usuarios obtenidos - page: ${page}, limit: ${limit}`);

    res.json({ page, limit, users });
  } catch (error) {
    logger.error("Error al obtener usuarios", { error: error.message });
    res.status(500).json({ message: "❌ Error al obtener usuarios" });
  }
};

// GET /user
export const getUserInfoController = (req, res) => {
  logger.debug(`Usuario autenticado: ${req.user?.id}`);
  res.status(200).json({ message: "✅ Bienvenido user", user: req.user });
};

// PUT /:id
export const updateUserController = async (req, res) => {
  const userId = req.params.id;
  const { email, name, phone } = req.body;

  try {
    await editUsers(userId, email, name, phone);
    logger.info(`Usuario actualizado ID: ${userId}`);
    res.status(200).json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    logger.error(`Error al actualizar usuario ID: ${userId}`, { error: error.message });
    res.status(400).json({ message: "Error al actualizar usuario" });
  }
};

// DELETE /admin/users/:id
export const deleteUserController = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await deleteUser(userId);

    if (result.affectedRows === 0) {
      logger.warn(`Intento de eliminar usuario inexistente ID: ${userId}`);
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    logger.info(`Usuario eliminado ID: ${userId}`);
    res.status(200).json({ message: "✅ Usuario eliminado correctamente" });
  } catch (error) {
    logger.error(`Error al eliminar usuario ID: ${req.params.id}`, { error: error.message });
    res.status(500).json({ message: "❌ Error al eliminar usuario" });
  }
};
