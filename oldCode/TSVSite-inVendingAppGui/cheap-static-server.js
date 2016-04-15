var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs")
    port = process.argv[2] || 8085;

http.createServer(function(request, response) {

  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri)
    , RQ = require('request')
    ;
  
  switch (request.url) {
  	
  	/*
  	
  	this is the placeholder that will catch the inbound requests to the non-existent
  	/tsv/flashapi
  	
  	not much we can do at the moment I guess :(
  	
  	*/
  	case '/tsv/flashapi/multievent':
  	case '/tsv/flashapi':
  		var data = { msg: 'not a real response', from: request.url };
		  response.writeHead(200);
		  response.write(JSON.stringify(data), "binary");
		  response.end();
  		break;
  
  	case '/test-api':
  		// HINT: use request library to ping out to local-socket-server using regular http at this point
  		
  		var queryData = '';

		if (request.method == 'POST') {
			request.on('data', function(data) {
				queryData += data;
				// simply protects against a data bomb that can bring down a server,
				// essentially says "if bigger than 1MB, kill it"
				if(queryData.length > 1e6) {
					queryData = "";
					response.writeHead(413, {'Content-Type': 'text/plain'}).end();
					request.connection.destroy();
				}
			});

			request.on('end', function() {

				RQ.post({
					url: 'http://localhost:20160/sdk-api',
					method: 'post',
					json: true,
					body: {
						postedFromAngular: querystring.parse(queryData)
					}

				}, function(err, response, body) {
					response.writeHead(200);
					response.write(JSON.stringify(body), "binary");
					response.end();
				});

			});

		} else {

			response.writeHead(500, {'Content-Type': 'text/plain'});
			response.end('method=post only!');
		}
  		break;

  	default:
  
	  //path.exists(filename, function(exists) {
	  fs.exists(filename, function(exists) {
		if(!exists) {
		  response.writeHead(404, {"Content-Type": "text/plain"});
		  response.write("404 Not Found\n");
		  response.end();
		  return;
		}

		if (fs.statSync(filename).isDirectory()) filename += '/index.html';

		fs.readFile(filename, "binary", function(err, file) {
		  if(err) {        
			response.writeHead(500, {"Content-Type": "text/plain"});
			response.write(err + "\n");
			response.end();
			return;
		  }

		  response.writeHead(200);
		  response.write(file, "binary");
		  response.end();
		});
	  });
	  break;
	}
  
}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");