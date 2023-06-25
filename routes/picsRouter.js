const router = require('express').Router();
const picsCtrl = require('../controllers/picsCtrl');
const auth = require('../middlewares/auth');

router.route('/pics', )
	.get(auth, picsCtrl.getPics)
	.post(auth, picsCtrl.uploadPic);

router.route('/pics/:id', )
	.delete(auth, picsCtrl.deletePic);

module.exports = router;