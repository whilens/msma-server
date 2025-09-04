const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Нет access токена' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Нет access токена' });
    }
    try {
        const payload = jwt.verify(token, process.env.ACCESS_SECRET || 'access_secret');
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Невалидный access токен' });
    }
}; 