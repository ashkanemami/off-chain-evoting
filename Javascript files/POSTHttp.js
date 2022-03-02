const fetch = require("node-fetch");

class POSTHttp {

// Make an HTTP POST Request
async post(url, data) {

// Awaiting fetch which contains method,
// headers and content-type and body
const response = await fetch(url, {
	method: 'POST',
	headers: {
		'Content-type': 'application/json'
	},
	body: JSON.stringify(data)
});

// Awaiting response.json()
const resData = await response.json();

// Return response data
return resData;
}
}

exports.POSTHttp = POSTHttp;
