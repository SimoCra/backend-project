import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.cookies?.['__secure'];
  const fingerprint = req.headers['x-client-fingerprint'];

  if (!token || !fingerprint) {
    return res.status(401).json({ message: 'Acceso denegado. Token o fingerprint ausente.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (decoded.fp !== fingerprint) {
      return res.status(401).json({ message: 'Fingerprint no coincide. Posible acceso no autorizado.' });
    }

    req.user = {
      id: decoded.userId,
      role: decoded.role,
      cart_id : decoded.cart_id
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};


export const checkRole = (roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)) {
            return res.status(403).json({ message: ' ❌ No tienes permisos para acceder a este recurso' });
        }
        next();
    }
    
}