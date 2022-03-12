var mysqlpool = require("../db");
var {subscribeToWebhook} = require('../functions/shopify-functions.js');

/**
 * 
 * Funciones que correran las primera vez que se instala la aplicación 
 * 
 **/
const appInit = async (shop, access_token) => {

	// Nos suscribimos al webhook de desinstalación para eliminar el Auth Token cuando el usuario desinstala la APP (y saber que la ha desintalado)
	subscribeToWebhook("APP_UNINSTALLED", "app/uninstalled", shop, access_token); 

	
	
}



/**
 * 
 * Registrará las peticiones GDPR obligatorias en la base de datos
 *  
 **/
const saveGdprRequest = (shop, topic, data, message = "") => {
	let dataJSON = JSON.stringify(data);
	mysqlpool.query("INSERT INTO gdprRequests SET ? ", {shop: shop, topic: topic, data: dataJSON, message: message}, (err, res) => {
		if (err) {
			console.error(`Error al guardar una petición GDPR para la tienda: ${shop}, topic: ${topic}, con los datos: ${dataJSON}`);
		}
	});
}



module.exports = {saveGdprRequest, appInit}