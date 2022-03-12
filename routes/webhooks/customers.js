var express = require('express');
var router = express.Router();
var {saveGdprRequest} = require('../../functions/app-functions.js');


router.post('/:action', function(req, res, next) {

	// Aquí el webhook ya está verificado

	console.log(`La acción a realizar sobre los datos del cliente es ${req.params.action}`);


	switch (req.params.action) {
		case "data_request":
				// Solicitud de entrega de datos para un usuario
				saveGdprRequest(req.headers["x-shopify-shop-domain"], req.headers["x-shopify-topic"], req.body, "Hay que entregarle todos los datos que tengamos del usuario.");
				res.status(200);
				res.send("");
				return;
			break;
		case "redact":
				// Solicitud de borrado de datos de un usuario
				saveGdprRequest(req.headers["x-shopify-shop-domain"], req.headers["x-shopify-topic"], req.body, "Hay que borrar todos los datos que tengamos del usuario.");
				res.status(200);
				res.send("");
				return;
			break;
	}
		
	next();
});



module.exports = router;
