const { User } = require('../models');
const Cryptr = require('cryptr');
const jwt = require('jsonwebtoken');

const cryptr = new Cryptr('iwanttokillyou');
const secretKey = 'nomercy';

module.exports = {
    register: async (req, res) => {
        const { username, email, password } = req.body;
        try {
            const existingUser = await User.findOne({ where: { email } });
            console.log("registered user = ", existingUser)
            if (existingUser) {
                return res.status(400).json({ error: 'User is already registered' });
            }
            const encryptedPassword = cryptr.encrypt(password);
            const user = await User.create({ username, email, password: encryptedPassword });
            const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });
            res.json({ user, token });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    login: async (req, res) => {
        const { email, password } = req.body;
        try {
            const user = await User.findOne({ where: { email } });
            if (user) {
                const decryptedPassword = cryptr.decrypt(user.password);
                if (decryptedPassword === password) {
                    const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });
                    res.json({ user, token });
                } else {
                    res.status(401).json({ error: 'Invalid credentials' });
                }
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
};
