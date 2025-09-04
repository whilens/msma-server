
module.exports = function (req, res, next) {
    const userRole = req.user.role;
    if (!userRole) {
        return res.status(401).json({ message: 'Не выбрана роль' });
    }
    try {
        if (userRole !== 1) {
            return res.status(401).json({ message: 'Нет доступа' });
        }
        next()
    } catch (e){
        return res.status(401).json({ message: 'Ошибка сервера, пожалуйста подождите' });
    }

}; 