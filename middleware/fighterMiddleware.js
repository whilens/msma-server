
module.exports = function (req, res, next) {
    const userRole = req.user.role;
    console.log(userRole)
    if (!userRole) {
        return res.status(401).json({ message: 'Не выбрана роль' });
    }
    try {
        if (userRole != 2) {
            return res.status(401).json({ message: 'Нет доступа esgesges' });
        }
        next()
    } catch (e){
        return res.status(401).json({ message: 'Ошибка сервера, пожалуйста подождите' });
    }

}; 