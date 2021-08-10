'use strict';

const { createQuicSocket } = require('net');
const { readFile } = require('fs/promises');

console.log('Hello node ' + process.version);

async function main() {
    const server = await generateServer();
    server.on('ready', () => {
        console.log('server socket is ready');
    });
    server.on('session', handleSession);
    server.on('sessionError', console.error);
    server.on('error', console.error);
    server.on('close', () => {
        console.log('server has closed.');
        process.exit(0);
    });
    server.on('listening', () => {
        for (const endpoint of server.endpoints) {
            console.log(`Server is listening on`, endpoint.address);
        }
    });

    await server.listen({
        rejectUnauthorized: false,
    });
}

async function handleSession(session) {
    console.log(`Session connected`, session.address, session.remoteAddress);
    session.on('stream', getHandleStream(session));
    session.on('secure', getHandleSecure(session));
    session.on('error', console.error);

    const unidirectional = await session.openStream({
        halfOpen: true,
    });
    unidirectional.end('Hello from server!');
}

function getHandleStream(session) {
    return (stream) => {
        console.log(`Incoming stream`);
        stream.on('data', console.log);
        stream.on('end', () => console.log(`Stream ended`));
    };
}

function getHandleSecure(session) {
    return (info) => {
        console.log('secured!', info);
    };
}

async function generateServer() {
    const port = process.env.PORT || 1234;
    const key = await readFile(__dirname + '/server.key');
    const cert = await readFile(__dirname + '/server.crt');
    const ca = await readFile(__dirname + '/server.csr');
    const alpn = 'hello';

    return createQuicSocket({
        endpoint: {
            port,
        },
        server: {
            key,
            cert,
            ca,
            alpn,
        },
    });
}

process.on('SIGINT', () => {
    console.log(`Ctrl+C detected. Stopping server...`);
    process.exit(2);
});

main().catch(console.error);
