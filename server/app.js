const http = require('http');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    fs.readFile('index.html', (err, data => {
        res.writHead(200, { 'Content-Type': 'text/plain' });
        res.write(data);
        res.end();
    }))
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hellow World\n');
});

server.listen(port, hostname, () => {
    console.log(`Server listening at http://${hostname}:${port}/`);
});