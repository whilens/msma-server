class SignCallback {
    async signCallback(req, res) {
        console.log('signCallback', req.body)
        res.json({message: 'signCallback'})
    }
}

module.exports = new SignCallback();