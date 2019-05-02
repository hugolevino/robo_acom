const {BigQuery} = require('@google-cloud/bigquery');
const cloudTasks = require('@google-cloud/tasks');
const client = new cloudTasks.CloudTasksClient();
const parent = client.queuePath('bigdata-bernard', 'us-central1', 'first-queue');

const task = {
	appEngineHttpRequest: {
    	httpMethod: 'POST',
    	relativeUri: '/listening',
	},
};

var rp = require('request-promise');
var fs = require('fs');

var rows = '';
var known_list = new Array();
var final_list = new Array();
var count_seller = 0;
var count_row = 0;

query();

async function query() {

	const bigqueryClient = new BigQuery();

	const query = `SELECT cnpj FROM \`bigdata-bernard.my_new_dataset.data_ativacao\``;
	const options = {
		query: query,
		location: 'US',
	};

	const [job] = await bigqueryClient.createQueryJob(options);
	console.log(`Job ${job.id} started.`);

	rows = await job.getQueryResults();

	for (i = 0; i < rows[0].length; i++) {
		known_list.push(rows[0][i].cnpj);
	}

	get_cats();
  
}


function get_cats(){
	
	var options = {
		method: 'GET',
		resolveWithFullResponse: true,
		uri: 'https://turbo-v1-americanas.b2w.io/slug/sitemap/seller?limit=100000',
		headers: {
			"content-type": "application/json",
			"accept": "application/json",
		},
		json: true
	};

	rp(options).then(function (repos) {
		

		for (i = 0; i < repos.body.itens.length; i++) {
			cnpj_to_int = repos.body.itens[i].id;
			if (known_list.indexOf(parseInt(cnpj_to_int)) == -1) {
				if (final_list.indexOf(parseInt(cnpj_to_int)) == -1) {
					final_list.push(parseInt(cnpj_to_int));
					count_seller++;
					console.log(count_seller + ' -> ' + cnpj_to_int);
				}
			}
		}

		queueing();

	})
	.catch(function (err) {
		
		console.log(err);

	});
	
}

async function queueing(){
	if(count_row < final_list.length){
		for (i = 0; i < 10; i++) {
			if(count_row < final_list.length){
				
				var payload = final_list[count_row];
				task.appEngineHttpRequest.body = Buffer.from(payload).toString('base64');
				const request = {
				    parent: parent,
				    task: task,
				 };

				 //console.log('Sending task:');
				 //console.log(task);

				 const [response] = await client.createTask(request);
				 const name = response.name;
				 console.log(`Created task ${name}`);

				count_row++;
			}
		}
		setTimeout(function(){
			 testing();
		}, 5000);
	}
}
