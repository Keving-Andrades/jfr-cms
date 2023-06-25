const router = require('express').Router();
const newsCtrl = require('../controllers/newsCtrl');
const auth = require('../middlewares/auth');
const authAdmin = require('../middlewares/authAdmin');

router.route('/news', )
	.get(auth, newsCtrl.getNews)
	.post(auth, newsCtrl.createNews);

router.route('/news/:id', )
	.delete(auth, newsCtrl.deleteNews)
	.put(auth, newsCtrl.updateNews);

router.get('/news/set_featured/:id', auth, authAdmin, newsCtrl.setFeatured);

module.exports = router;