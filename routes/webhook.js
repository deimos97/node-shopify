var express                = require('express');
var router                 = express.Router();
var customersRouter        = require('./webhooks/customers');
var shopRouter             = require('./webhooks/shop');
var appRouter              = require('./webhooks/app');
var {
	validateDataWithHmac,
	webhookIsValid,
	saveWebhookId
	} = require('../functions/shopify-functions.js');

// Por aquí pasarán todos los webhooks, podemos aprovechar para logearlos, verificarlos o lo que queramos
router.post('*', async function(req, res, next) {

	// Aquí verificaremos la integridad de todos los webhooks que entren
	if (!await webhookIsValid(req)) {
		res.status(500);
		res.send("Invalid WebHook!");
		return;
	}

	// El webhook es válido, lo guardamos para que no se repita
	saveWebhookId(req.headers["x-shopify-webhook-id"]);

	// Dejamos que se encarge del webhook el handler que le corresponda
	next();
		
});


// Webhooks directos (no se controlan con más prámetros). Serán acciones directas no como "/product/creation" o "/product/deletion" sino más bien como "/uninstall"
router.post('/:webhookType', function(req, res, next) {

	switch (req.params.webhookType) {
		case "":
				console.log(`Acción a realizar`);
				res.status(200);
				res.send("");
				return;
			break;
	}

	next();
		
});

router.use('/shop', shopRouter);
router.use('/customers', customersRouter);
router.use('/app', appRouter);

router.post('*', function(req, res, next) {
	console.error(`Un webhook no está siendo controlado`);
	if (true) {
		res.status(404);
		res.send("Unhandled WebHook");
	}
	return;
});


module.exports = router;
