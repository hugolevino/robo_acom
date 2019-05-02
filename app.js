const express = require('express');
const rp = require('request-promise');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.raw());
app.use(bodyParser.json());
app.use(bodyParser.text());

app.get('/listening', (req, res) => {
 	
	console.log('oi');
 	var cnpj = '1008302000179';
 	//var cnpj = req.body;

	var options = {
		method: 'GET',
		uri: 'http://www.precisaousinagem.ind.br/principal/empresa',
		resolveWithFullResponse: true,
		headers: {
			"content-type": "application/json",
			"accept": "application/json",
			'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
			'teste': cnpj
		},
		timeout: 30000
	};
	 
	rp(options).then(function (repos) {
  
		//var real_cnpj = repos.request.headers.teste;
		//console.log(real_cnpj);
		//var data = repos.body.split('window.__PRELOADED_STATE__ = "')
		//data = data[1];
		//data = data.split('";</script>');
		//data = data[0]
		//data = data.trim();
		//data = decodeURIComponent(data);
		//var obj = JSON.parse(data);
		console.log('oi2');
		res.status(200);
		//res.send(real_cnpj + ' --> ' + obj.pagination.total);
		res.send(JSON.stringify(repos));
		res.end();

	})
	.catch(function (response) {
		res.status(400);
	    res.send('DEU XABU');
	    res.end();
	});
  
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
