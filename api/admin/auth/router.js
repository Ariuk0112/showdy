const router = require('express').Router();
const {
    authAdmin,
    check,
    login,
} = require('./controller')

router.post('/check', authAdmin, check);
router.post('/login', login);

module.exports = router;
