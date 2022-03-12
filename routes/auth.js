var express   = require('express');
var router    = express.Router();
var mysqlpool = require('../db');
var {hasValidHMAC, getShopifyAccessToken} = require('../functions/shopify-functions.js');
var {appInit}  = require('../functions/app-functions');

router.get('/', async function(req, res, next) {
	
	// Verificamos que el HMAC de la petición sea válido
	if (!hasValidHMAC(req.query, "hex")) {
		res.status(500);
		res.render('app-error-page', { errorName: 'Invalid HMAC!', errorContent: "The propided URL does not have a valid HMAC"});
		return
	}

	// Verificamos que el Nonce sea válido (el mismo que en la primera petición)
	if (!req.session.state || !req.query.state || req.query.state != req.session.state) {
		console.error("Invalid Nonce!", req.query.state, req.session.state);
		res.status(500);
		res.render('app-error-page', { errorName: 'Invalid Nonce!', errorContent: "The request nonce has been changed!"});
		return
	}

	// Aunque no es necesario, comrpobamos que la tienda no haya cambiado. Aprovechamos para comprobar que sea un dominio shopify válido
	// To verify the hostname we use Shopify's Regex: /[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com/
	if (!req.query.shop || !req.session.shop || req.query.shop != req.session.shop || !/[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com/.test(req.query.shop)) {
		console.error("Invalid Shop!", req.query.shop, req.session.shop);
		res.status(500);
		res.render('app-error-page', { errorName: 'Invalid Store!', errorContent: "The store is invalid and/or has been changed!"});
		return
	}

	// Llegados a este punto la APP está instalada correctamente y solo nos faltaría obtener el Auth Key para poder hacer consultas a la APP con normalidad y registrarla en nuestras apps instaladas
	let response = await getShopifyAccessToken(req.query.shop, req.query.code);

	// Una vez tenemos el Auth Token lo insertamos en la base de datos
	let insertValues = {
		shop: req.query.shop,
		access_token: response.access_token,
		scopes: response.scope
	}

	// Esperamos el resultado de la insertación en la base de datos
	let result = await new Promise((resolve, reject)=>{
		mysqlpool.query('INSERT INTO shops SET ? ON DUPLICATE KEY UPDATE ?', [insertValues, insertValues], (err, res) => {
			if (err) {
				reject(err);
			}
			resolve(res);
		});
	}).catch(err=>console.log(`Error insertando en la base de datos ${err}`));;


	// Si por cualquier cosa la tienda no se hubiese podido instalar acabaríamos aquí (fallo de inserción en la base de datos debería ser nuestra únuca/principal causa)
	if (!result) {
		console.error(`No se ha podido instalar la tienda de ${req.query.shop}! Fallo al insertar en la base de datos!`);
		res.status(500);
		res.render('app-error-page', { errorName: 'Not able to install!', errorContent: "We were unable to install the app. Please unistall the app from the Shopify page and try again"});
		return;
	}
	
	// Con el Auth Token en la base de datos la tienda están 100% instalada sin problemas
	// La tienda se ha instalado correctamente
	console.log("Tienda instalada correctamente");

	// Corremos las funciones de SetUp de la APP
	appInit(req.query.shop, response.access_token);

	// Enviamos al usuario a la pantalla de la APP dentro de su admin de Shopify
	let url = `https://${req.query.shop}/admin/apps/${process.env.SHOPIFY_API_KEY}`;
	res.redirect(302, url);
	

});


module.exports = router;
