/**
 * Run with:
 * $ node server.js
 */

var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    path = require('path'),
    mime = require('mime');

function serveStaticFile(filename, response) {
    if (fs.statSync(filename).isDirectory()) filename += 'index.html';

    fs.readFile(filename, 'binary', function (err, file) {
        if (err) {
            response.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            response.write(err + "\n");
            response.end();
            return;
        }
        response.writeHead(200, {
            'Content-Type': mime.lookup(filename)
        });
        response.write(file, 'binary');
        response.end();
    });
}

http.createServer(function (request, response) {

    var filename = path.join(__dirname, url.parse(request.url).pathname);

    fs.exists(filename, function (exists) {
        if (!exists) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write("404 Not Found\n");
            response.end();
            return;
        }
        serveStaticFile(filename, response);
    });

}).listen(8080);

console.info('------------------------------------------');
console.info('Server listening at http://localhost:8080/');
console.info('------------------------------------------');