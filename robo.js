const {BigQuery} = require('@google-cloud/bigquery');
var rp = require('request-promise');
var fs = require('fs');

//const projectId = 'bigdata-bernard';
//const file = 'C:/Users/hugo.levino/Desktop/BigData Bernard-0d44db49e583.json'

//const bigqueryClient = new BigQuery({
//	projectId: projectId,
//	keyFilename: file
//});


var rows = '';
var known_list = new Array();
var final_list = new Array();

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

var sellers = new Array();
var jsons = new Array();
var cats = new Array();
var offset_count = 0;
var count_prod = 0;
var count_cat = 0;
var count_worker = 0;
var count_loja = 0;
var count_pag = 0;
var count_seller = 0;
var cnpj_to_int = 0;

var site_data = ''
var letras = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'x', 'z', 'w', 'y', '0'];
var count_letras = 0;


function get_cats(){
	
	if(count_letras < letras.length){
	
		var options = {
			method: 'GET',
			resolveWithFullResponse: true,
			uri: 'https://www.americanas.com.br/mapa-do-site/lojista/f/letra-' + letras[count_letras]  + '/pagina-' + count_pag,
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
			},
			rejectUnauthorized: false
		};

		console.log(options.uri);
		
		rp(options).then(function (repos) {
			
			site_data = repos.body;

			var real_prod_id = repos.request.headers.teste;

			var data = repos.body.split('window.__PRELOADED_STATE__ = "')
			
			if(data.length > 1){

				data = data[1];
				data = data.split('";</script>');
				data = data[0]
				data = data.trim();
				data = decodeURIComponent(data);
				var obj = JSON.parse(data);

				var letra = letras[count_letras];
				
				if(obj.sitemap.items.seller[letra].length > 0){
					for (i = 0; i < obj.sitemap.items.seller[letra].length; i++) {
						cnpj_to_int = obj.sitemap.items.seller[letra][i].id;
						if (known_list.indexOf(parseInt(cnpj_to_int)) == -1) {
							if (final_list.indexOf(parseInt(cnpj_to_int)) == -1) {
								final_list.push(parseInt(cnpj_to_int));
								count_seller++;
								console.log(count_seller + ' -> ' + cnpj_to_int);
							}
						}
					}

					count_pag++;
					setTimeout(function(){
						get_cats();
					}, 100);
				}else{
					count_pag = 0;
					count_letras++;

					setTimeout(function(){
						get_cats();
					}, 100);
					
				}
			}else{
				setTimeout(function(){
					get_cats();
				}, 100);
			}

		})
		.catch(function (err) {
			
			save_txt2(site_data);
			console.log(err);

		});
	
	}else{
		
		console.log('ACABOU!');
		save_txt(jsons.join('\r\n'));
		
	}

}
