import bcrypt from 'bcryptjs';
import {
  insertUser,checkEmailExists,checkPhoneExists,
  insertImage,createCartForUser,findUserByEmailOrPhone,
  findCartByUserId,getUserDetailsById,getAllUsersWithImages,
  deleteUserCarts,deleteUserById,updateUserBasicInfo,getDashboardStatsRaw,
  getUserEmailByIdentifier, updatePasswordByUserId, getUserDetailsByEmail
} from '../models/userModel.js';

export const createUser = async (name, email, phone, password, role, file) => {
  const emailExists = await checkEmailExists(email);
  if (emailExists.length > 0) throw 'El email ya está registrado';

  const phoneExists = await checkPhoneExists(phone);
  if (phoneExists.length > 0) throw 'El número de teléfono ya está registrado';

  const hashedPassword = await bcrypt.hash(password, 10);
  const filePath = file ? `uploads/${file.filename}` : null;

  const insertResult = await insertUser(name, email, phone, hashedPassword, role);
  const userId = insertResult.insertId;

  if (filePath) {
    await insertImage(userId, filePath);
  }

  const cartResult = await createCartForUser(userId);

  return {
    id: userId,
    name,
    email,
    phone,
    role,
    cartId: cartResult.insertId,
    filePath,
  };
};

export const loginUser = async (emailOrPhone) => {
  const user = await findUserByEmailOrPhone(emailOrPhone);
  if (!user) throw 'Usuario no encontrado';

  let cart = await findCartByUserId(user.id);
  if (!cart) {
    const newCart = await createCartForUser(user.id);
    cart = { id: newCart.insertId };
  }

  return {
    ...user,
    cartId: cart.id,
  };
};

export const findUserById = async (id) => {
  return await getUserDetailsById(id);
};

export const showUsers = async (page = 1, limit = 25) => {
  const offset = (page - 1) * limit;
  return await getAllUsersWithImages(limit, offset);
};


export const deleteUser = async (userId) => {
  await deleteUserCarts(userId);
  return await deleteUserById(userId);
};

export const editUsers = async (id, email, name, phone) => {
  return await updateUserBasicInfo(id, email, name, phone);
};



export const getDashboardStatsService = async () => {
  const results = await getDashboardStatsRaw();
  const [counts, usersPerDay, topProducts] = results;

  return {
    total_users: counts[0].total_users,
    new_users_today: counts[0].new_users_today,
    total_cart_items: counts[0].total_cart_items || 0,
    total_products: counts[0].total_products,
    users_per_day: usersPerDay.map(row => ({ day: row.day, count: row.count })),
    top_cart_products: topProducts.map(row => ({ name: row.name, count: row.count })),
  };
};
;

export const findUserEmail = async (identifier) => {
  if (!identifier) return null; // no envió email o celular
  try {
    const email = await getUserEmailByIdentifier(identifier);
    return email; // null si no existe
  } catch (error) {
    console.error('Error buscando usuario:', error);
    return null;
  }
};


export const getUserById = async (userId) => {
  if (!userId) {
    throw new Error('El ID de usuario es requerido');
  }

  const user = await getUserDetailsById(userId);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  return user;
};


// Cambiar Contraseña

export const updateUserPasswordService = async (userId, newPassword) => {
  if (!userId || !newPassword) {
    throw new Error('El ID de usuario y la nueva contraseña son obligatorios');
  }

  // Verificar que el usuario exista
  const user = await getUserDetailsById(userId);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Hashear la nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Actualizar en la base de datos
  await updatePasswordByUserId(userId, hashedPassword);

  return { message: 'Contraseña actualizada correctamente' };
};


export const findUserByEmailService = async (email) => {
  if (!email) return null;
  try {
    const user = await getUserDetailsByEmail(email); // Esta función la debes crear en tu modelo
    return user || null;
  } catch (error) {
    console.error('Error buscando usuario por email:', error);
    return null;
  }
};
