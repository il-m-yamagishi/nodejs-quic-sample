// from https://scrapbox.io/nwtgck/Node.js%E3%81%AEQUIC%E3%82%92%E5%85%88%E5%8F%96%E3%82%8A%E3%81%97%E3%81%A6%E4%BD%BF%E3%81%A3%E3%81%A6%E3%81%BF%E3%82%88%E3%81%86

const { createQuicSocket } = require('net');
 const fs = require('fs');

 const key  = fs.readFileSync('./server.key');
 const cert = fs.readFileSync('./server.crt');
 const ca   = fs.readFileSync('./server.csr');
 const port = 1234;

 // Create the QUIC UDP IPv4 socket bound to local IP port 1234
 const server = createQuicSocket({ endpoint: { port } });

 // Tell the socket to operate as a server using the given
 // key and certificate to secure new connections, using
 // the fictional 'hello' application protocol.
 server.listen({ key, cert, alpn: 'hello' });

 server.on('session', (session) => {
   // The peer opened a new stream!
   session.on('stream', (stream) => {
     // Echo server
     stream.pipe(stream);
   });
 });

 server.on('listening', () => {
   // The socket is listening for sessions!
   console.log(`listening on ${port}...`);
   console.log('input something!');
 });

async function connectClient() {
    const socket = createQuicSocket({
    client: {
        key,
        cert,
        ca,
        requestCert: true,
        alpn: 'hello',
        servername: 'localhost'
    }
    });
    const req = await socket.connect({
    address: 'localhost',
    port,
    });

    req.on('secure', () => {
    const stream = req.openStream();
    // stdin -> stream
    process.stdin.pipe(stream);
    stream.on('data', (chunk) => console.log('client(on-secure): ', chunk.toString()));
    stream.on('end', () => console.log('client(on-secure): end'));
    stream.on('close', () => {
        // Graceful shutdown
        socket.close();
    });
    stream.on('error', (err) => console.error(err));
    });
}

connectClient().catch(console.error);
