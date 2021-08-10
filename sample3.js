const { createQuicSocket } = require('net');
const { readFileSync } = require('fs');

const key = readFileSync(__dirname + '/server.key');
const cert = readFileSync(__dirname + '/server.crt');
const ca = readFileSync(__dirname + '/server.csr');
const alpn = 'hello';
const address = 'localhost';
const port = 12345;
const servername = 'localhost';

async function listenServer() {
    const serverSocket = createQuicSocket({
        endpoint: {
            address,
            port,
        },
        server: {
            key,
            cert,
            ca,
            alpn,
            servername,
        },
        validateAddress: true,
    });
    serverSocket.on('error', console.error);
    serverSocket.on('endpointClose', (endpoint, err) => console.log(`SERVER: endpoint closed`, endpoint, err));
    serverSocket.on('session', session => {
        console.log(`SERVER: Session connected!`, session);
        session.on('secure', () => {
            console.log(`SERVER: secured`);
            session.on('stream', stream => {
                stream.pipe(stream);
            });
        });
    });
    serverSocket.on('ready', () => console.log(`SERVER: is ready`));
    serverSocket.on('listening', () => {
        for (const endpoint of serverSocket.endpoints) {
            console.log(`SERVER: Server is listening on `, endpoint.address);
        }
    });
    const clientHelloHandler = async function (...args) {
        console.log('SERVER: client hello handler', args);
    };
    return serverSocket.listen({
        clientHelloHandler,
        rejectUnauthorized: false,
        requestCert: true,
    });
}

async function connectClient() {
    const clientSocket = createQuicSocket({
        qlog: true,
        client: {
            qlog: true,
            key,
            cert,
            ca,
            // requestCert: true,
            alpn,
            servername,
        },
        // validateAddress: true,
    });
    clientSocket.on('error', (err) => console.error(`CLIENT: socket error`, err));
    clientSocket.on('sessionError', (err, session) => console.error(`CLIENT: session error`, err, session));
    clientSocket.on('close', () => console.log('CLIENT: clientSocket closed'));
    clientSocket.on('endpointClose', () => console.log(`CLIENT: endpoint closed`));

    const session = await clientSocket.connect({
        address,
        port,
        servername,
        rejectUnauthorized: false,
        requestCert: true,
    });
    console.log(`CLIENT: session created`, session);
    session.on('qlog', (line) => console.log(`CLIENT: qlog`, line));
    session.on('ready', () => console.log(`CLIENT: ready`));
    session.on('error', (err) => console.error(`CLIENT: session error`, err));
    session.on('stream', (stream) => console.log(`CLIENT: stream received`));
    session.on('secure', () => {
        console.log('CLIENT: secure connected');
    });
    session.on('sessionTicket', (sessionTicket, remoteTransportParams) => console.log(`CLIENT:`, sessionTicket, remoteTransportParams));
    session.on('close', () => {
        console.log(`CLIENT: === session closed ===`);
        console.log(session);
        console.log(`CLIENT: closeCode            :`, session.closeCode);
        console.log(`CLIENT: ackDelayRetransmitCnt: ${session.ackDelayRetransmitCount}`);
        console.log(`CLIENT: lossRetransmitCount  : ${session.lossRetransmitCount}`);
        console.log(`CLIENT: duration             : ${session.duration / 1000 / 1000}ms`);
        console.log(`CLIENT: Bytes Sent/Received  : ${session.bytesSent}/${session.bytesReceived}`);
        console.log(`CLIENT: bytesInFlight        : ${session.bytesInFlight}`);
        console.log(`CLIENT: keyUpdateCount       : ${session.keyUpdateCount}`);
        console.log(`CLIENT: handshakeComplete    : ${session.handshakeComplete}`);
        console.log(`CLIENT: handshakeConfirmed   : ${session.handshakeConfirmed}`);
        console.log(`CLIENT: authenticated        : ${session.authenticated}`);
        console.log(`CLIENT: authError            :`, session.authenticationError);
        console.log(`CLIENT: statelessReset       : ${session.statelessReset}`);
    });

    for (const endpoint of clientSocket.endpoints) {
        console.log(`CLIENT: endpoints`, endpoint.address);
    }

    return Promise.resolve();
}

process.on('SIGINT', () => {
    console.log(`Ctrl + C detected. stopping...`);
    process.exit(0);
});

listenServer()
    .then(() => connectClient())
    .catch((err) => console.error(`Uncaught error: `, err));
