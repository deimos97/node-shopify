var express = require('express');
var router = express.Router();
var mysqlpool = require('../../db');


router.post('/:action', function(req, res, next) {

	// Aquí el webhook ya está verificado

	console.log(`La acción a realizar sobre los datos de la app es ${req.params.action}`);

	switch (req.params.action) {
		case "uninstalled":
				mysqlpool.query("UPDATE shops SET access_token = '', scopes = '' WHERE ?", {shop: req.headers["x-shopify-shop-domain"]}, (err, res)=>{
					if (err) {
						console.error(`La tienda ${req.headers["x-shopify-shop-domain"]} no pudo ser desinstalada correctamente`);
						return;
					}
					console.log(`La tienda ${req.headers["x-shopify-shop-domain"]} ha desinstalado la APP :(`);
				});
				res.status(200);
				res.send("");
				return;
			break;
	}
		
	next();
});



module.exports = router;
