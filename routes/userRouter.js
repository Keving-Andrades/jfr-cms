const router = require("express").Router();
const userCtrl = require('../controllers/userCtrl');
const auth = require('../middlewares/auth');
const authAdmin = require('../middlewares/authAdmin');

router.post('/register', userCtrl.register);

router.post('/login', userCtrl.login);

router.get('/logout', auth, userCtrl.logout);

router.get('/add_collab', auth, authAdmin, userCtrl.addCollab);

router.get('/collabs', auth, authAdmin, userCtrl.getCollabs);

router.delete('/collabs/:id', auth, authAdmin, userCtrl.deleteCollab);

router.post('/confirm_password', auth, userCtrl.confirmPassword);

router.get('/df12_84dawDA155WD78wsda', userCtrl.refreshToken);

router.get('/info', auth, userCtrl.getInfo);

module.exports = router;