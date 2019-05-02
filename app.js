const {BigQuery} = require('@google-cloud/bigquery');
const express = require('express');
const rp = require('request-promise');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.raw());
app.use(bodyParser.json());
app.use(bodyParser.text());

app.get('/listening', (req, res) => {
 	
 	var cnpj = '23450889000104';
 	//var cnpj = req.body;

	var options = {
		method: 'GET',
		uri: 'https://mystique-v2-americanas.b2w.io/search?sortBy=lowerPrice&source=omega&filter={"id":"variation.sellerID","value":"23450889000104","fixed":true}&limit=1',
		resolveWithFullResponse: true,
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
			'teste': cnpj
		},
		json: true,
		timeout: 30000
	};
	 
	rp(options).then(function (repos) {
  
		var real_cnpj = repos.request.headers.teste;
		var obj = JSON.parse(repos.body);

		query(real_cnpj);

		res.status(200);
		res.end();

	})
	.catch(function (response) {
		res.status(400);
	    res.send('DEU XABU');
	    res.end();
	});
  
});


async function query(real_cnpj) {

	var cnpj_to_insert = parseInt(real_cnpj);
	const bigqueryClient = new BigQuery();

	var today = new Date();
	var month = dateObj.getUTCMonth() + 1;
	var day = dateObj.getUTCDate();
	var year = dateObj.getUTCFullYear();
	var h = today.getHours();
	var m = today.getMinutes();
	var s = today.getSeconds();

	var date_to_insert = day + '/' + month + '/' + year;

	const query = 'INSERT INTO `bigdata-bernard.my_new_dataset.data_ativacao` (cnpj, dt_ativacao) VALUES (' + cnpj_to_insert + ', "' + date_to_insert + '")';
	const options = {
		query: query,
		location: 'US',
	};

	const [job] = await bigqueryClient.createQueryJob(options);
	//console.log(`Job ${job.id} started.`);

	rows = await job.getQueryResults();
  
}



const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
