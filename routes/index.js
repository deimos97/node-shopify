var express      = require('express');
var router       = express.Router();
var mysqlpool    = require('../db');
var {hasValidHMAC, getShopTokens} = require('../functions/shopify-functions.js');

var fetch     = require('node-fetch');

/* Pedimos el Index */
router.get('/', async function(req, res, next) {

	// Si no tenemos alguno de los parámetros necesarios para la instalación le tiramos al index normal (Página de la APP más adelante?)
	if (!req.query.shop || !req.query.hmac || !req.query.timestamp) {
		res.redirect(process.env.SHOPIFY_APP_PAGE ? process.env.SHOPIFY_APP_PAGE : "https://app.shopify.com");
		return
	}
	
	// APP INSTALATION!
	
	// Si tenemos los parámetros necesarios para el Shopify OAuth:
	// Verificamos que el HMAC de la petición sea válido
	if (!hasValidHMAC(req.query, "hex")) {
		res.status(500);
		res.render('app-error-page', { errorName: 'Invalid HMAC!', errorContent: "The propided URL does not have a valid HMAC"});
	}
	
	// Comprobamos si la tienda ya estuviese instalada
	let shopInstalled = await getShopTokens(req.query.shop).catch(error => console.error(error));

	// Si está instalada la mandamos a la página principal de la APP
	if (shopInstalled && shopInstalled.access_token) {
		res.status(200);
		//res.render('app-install-page', { title: 'Instalado correctamente', shopifyParams: {code: req.query.code,  shop: req.query.shop, state: req.query.state,  timestamp: req.query.timestamp }});
		res.render('react');
		return;
	}


	// A partir de este momento sabemos que la tienda no está instalada
	// Rescatamos las propiedades de la APP que nos interesan
	const scopes      = process.env.SHOPIFY_APP_SCOPES;
	const redirectUri = process.env.SHOPIFY_APP_BASE_URL+'/auth';
	const state       = new Date().getTime(); // Nonce, unique on each request!

	// Guardamos en Sessión los datos del Nonce y tienda para hacer verificaciones más adelante
	req.session.state = state;
	req.session.shop  = req.query.shop;

	let url = `https://${req.query.shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`;
	
	// Reenviamos a la pantalla de permisos
	res.redirect(302, url);
	return

	

});

module.exports = router;
