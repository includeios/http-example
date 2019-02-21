const http2 = require('http2');
const http = require('http')
const fs = require('fs')
const path = require('path')
const mime = require('mime')
const url = require('url')

const readFile = (filepath) => {
  const filePath = path.join(__dirname, '../static'+filepath)
  const fileDescriptor = fs.openSync(filePath, 'r')
  const stat = fs.fstatSync(fileDescriptor)
  const contentType = mime.lookup(filePath)
  
  return {
    fileDescriptor: fileDescriptor,
    headers: {
      'content-length': stat.size,
      'last-modified': stat.mtime.toUTCString(),
      'content-type': contentType
    }
  }
}

//起http2的服务
const options = {
  key: fs.readFileSync(path.join(__dirname, '../ssl/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../ssl/cert.pem')),
}

const server = http2.createSecureServer(options)

server.on('stream', (stream, headers) => {
  const filePath = []
  const reqPath = headers[':path'] === '/' ? '/index.html' : headers[':path']
  const file = readFile(reqPath)

  if (reqPath === '/index.html') {
    filePath.push('/bundle1.js')
    filePath.push('/bundle2.js')
  }

  for (const asset of filePath) {

    stream.pushStream({ ':path': asset }, (err, pushStream) => {
      if (err) throw err
      const file = readFile(asset)
      pushStream.respondWithFD(file.fileDescriptor, file.headers)
    });
  }

  stream.respondWithFD(file.fileDescriptor, file.headers)
});

//起http的服务
// const listener = (req, res) => {
//   const { query, pathname } = url.parse(req.url, true);

//   if (pathname === "/") {
//     res.setHeader('Content-Type', 'text/html;charset=utf-8');
//     fs.createReadStream(path.join(__dirname,'../static/index.html')).pipe(res);
//   } 
//   else {
//     const filePath = path.join(__dirname, `../static/${pathname}`)
//     if (fs.existsSync(filePath)) {   
//       res.setHeader('Content-Type', mime.lookup(pathname) + ';charset=utf-8');
//       fs.createReadStream(filePath).pipe(res);
//     } 
//     else {
//       res.statusCode = 404;
//       res.end();
//     }
//   }
// }

// const server = http.createServer(listener);

server.listen(3000);