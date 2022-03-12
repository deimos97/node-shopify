var express = require('express');
var router = express.Router();
var {saveGdprRequest} = require('../../functions/app-functions.js');


router.post('/:action', function(req, res, next) {

	// Aquí el webhook ya está verificado

	console.log(`La acción a realizar sobre los datos de la tienda es ${req.params.action}`);

	switch (req.params.action) {
		case "redact":
				// Solicitud de borrado de datos de una tienda
				saveGdprRequest(req.headers["x-shopify-shop-domain"], req.headers["x-shopify-topic"], req.body, "Hay que borrar todos los datos que tengamos de la tienda.");
				// TODO: Como esto se supone que pasa 48 horas después de desinstalar la APP debemos de borrar todos los datos que tengamos de la tienda así nos evitamos ir creciendo exponencialmente por cada nuevo usuario
				res.status(200);
				res.send("");
				return;
			break;
	}
		
	next();
});



module.exports = router;
