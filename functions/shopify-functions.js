var crypto    = require('crypto');
var fetch     = require('node-fetch');
var mysqlpool = require('../db');


/**
 *
 * Verificará un webhook a partir del parámetro request
 *  
 **/

const webhookIsValid = async (request) => {
	if (!request) {
		console.error("No hay parámetros de petición para verificar el Webhook");
		return false;
	}

	let hmac = request.headers["x-shopify-hmac-sha256"];

	if (!hmac) {
		console.error("No se encuentra el hmac en la petición para verificar el Webhook");
		return false;
	}
	
	// Verificamos que no esté repetido
	if (await isWebhookIdOnDDBB(request.headers["x-shopify-webhook-id"])) {
		console.log("Webhook repetido, no lo volvemos a ejecutar");
		return false;
	}

	// No se puede usar JSON.stringify(request.body);
	// Usamos el módulo "body-parser" que nos dá este parámetro en el req. Es una mierda pero es la única forma de poder verificar peticiones
	let rawBody = request.rawBody.toString();
	return validateDataWithHmac(rawBody, hmac);
}

/**
 * 
 * Función que guardará el ID del Webhook para evitar repeticiones
 * 
 **/

const saveWebhookId = (id) => {
	mysqlpool.query("INSERT INTO webhooks SET ?", {id: id});
	return true;
}

/**
 * 
 * Funcuón que checkeará si el webhook ID existe
 *  
 **/

const isWebhookIdOnDDBB = async (id) => {

	return new Promise((resolve, reject)=>{
		mysqlpool.query("SELECT * FROM webhooks WHERE ? LIMIT 1", {id: id}, (err, res)=>{
			if (err) {
				reject(`Error al seleccionar de la tabla de tiendas instaladas para la tienda ${shop}`);
			}
			resolve(res[0] ? true : false);
		});
	});
}

/**
 * 
 * Subscribe to a webhook
 *  
 **/

const subscribeToWebhook = async (topic, callbackPath, shop, access_token = undefined) => {


	let data = JSON.stringify({
		query: `mutation{
			webhookSubscriptionCreate(
					topic: ${topic}
					webhookSubscription: {
						format: JSON,
						callbackUrl: "${process.env.SHOPIFY_APP_BASE_URL}/webhook/${callbackPath}"
					}
				) {
				userErrors {
					field
					message
				}
				webhookSubscription {
					id
				}
			}
		}`
	})

	if (access_token === undefined) {
		let tokens = await getShopTokens(shop);
		access_token = tokens.access_token;
	}

	let postOptions = {
		method: 'post',
		body: data,
		headers: { 
			'Content-Type': 'application/json', 
			'x-shopify-access-token': access_token
		}
	};
	
	response = await fetch(`https://${shop}/admin/api/2021-04/graphql.json`, postOptions).catch(err=>console.error(`(2) Error al hacer el fetch a Shopify para la creación de un webhook del access_token de la tienda ${shop} | ${access_token}`,err));
	
	if (response.status === 200) {
		response = await response.json();
		if (!response.data.webhookSubscriptionCreate.webhookSubscription) {
			console.log(`La petición es correcta pero hay errores ${ JSON.stringify(response.data.webhookSubscriptionCreate.userErrors)}`);
		}
		return true;
	} else {
		console.error("Error al crear el Webhook");
		return false;
	}
}


/**
 * 
 * Función que verifica un HMAC a partir de los parámetros facilitados por la URL
 * 
 **/
const hasValidHMAC = (queryParams, digest = "base64") => {
	// Comprobamos que los parámetros tenga un HMAC
	if (!queryParams.hmac) {
		console.error("No se ha proporcionado un hmac");
		return false;
	}
	// Lo guardamos por conveniencia en una variable
	let hmac = queryParams.hmac;
	let stringToVerify = ``; // Iremos montando la string sin el HMAC (en el orden de entrega)
	for (let [queryIndex, queryValue] of Object.entries(queryParams)) {
		if (queryIndex === "hmac") continue;
		stringToVerify += `${queryIndex}=${queryValue}&`;
	}
	// Eliminamos la última interrogación
	stringToVerify = stringToVerify.substring(0, stringToVerify.length - 1);
	// Generemos nuestro hash y retornamos la comparación

	return validateDataWithHmac(stringToVerify, hmac, digest);
}


/**
 * 
 * Función que verifica una cadena de datos a partir de un HMAC y los datos
 * 
 **/
const validateDataWithHmac = (data, hmac, digest = "base64") => {
	// Comprobamos que los parámetros tenga un HMAC
	if (!data || !hmac) {
		console.error("No se encuentran valores a comprobar");
		return false;
	}
	
	// Generemos nuestro hash y retornamos la comparación
	const genHash = crypto
	.createHmac('sha256', process.env.SHOPIFY_API_SECRET_KEY)
	.update(data)
	.digest(digest);
	console.log(genHash, hmac);
	return genHash === hmac;
}

/**
 * 
 * Hará un post para obtener el access token de una tienda
 * 
 **/
const getShopifyAccessToken = async (shop, code) => {

	const data = JSON.stringify({
	  client_id: process.env.SHOPIFY_API_KEY,
	  client_secret: process.env.SHOPIFY_API_SECRET_KEY,
	  code: code
	})

	let postOptions = {
		method: 'post',
		port: 443,
		body: data,
		headers: { 
			'Content-Type': 'application/json', 
			'Content-Length': data.length 
		}
	};

	var response;
	try {
		console.log(`https://${shop}/admin/oauth/access_token`);
		response = await fetch(`https://${shop}/admin/oauth/access_token`, postOptions).catch(err=>console.error(`(2) Error al hacer el fetch a Shopify para la obtención del access_token de la tienda ${shop} | ${code}`,err));
		response = await response.json();
	} catch(err) {
		console.log(`(2) Error al hacer el fetch a Shopify para la obtención del access_token de la tienda ${shop} | ${code}`,err);
	}

	return response;
}


/**
 * 
 * Función que devuelve el access token y los scopes de una tienda
 * 
 * @param shop tienda a consultar
 * 
 **/
const getShopTokens = (shop) => {

	return new Promise((resolve, reject)=>{
		mysqlpool.query("SELECT * FROM shops WHERE ? LIMIT 1", {shop: shop}, (err, res)=>{
			if (err) {
				reject(`Error al seleccionar de la tabla de tiendas instaladas para la tienda ${shop}`);
			}
			resolve(res[0] ? res[0] : false);
		});
	});


}


module.exports = {hasValidHMAC, getShopTokens, getShopifyAccessToken, validateDataWithHmac, webhookIsValid, saveWebhookId, subscribeToWebhook}