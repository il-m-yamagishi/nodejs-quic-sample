'use strict';

// from https://github.com/nodejs/node/blob/7657f62b1810b94acbe7db68089b608213b34749/test/parallel/test-quic-client-server.js

const { createQuicSocket } = require('net');
const { readFileSync } = require('fs');
const { debuglog } = require('util');
const { assert } = require('console');
const log = debuglog('QUIC:COMMON');
const clientLog = debuglog('QUIC:CLIENT');
const serverLog = debuglog('QUIC:SERVER');

const key = readFileSync(__dirname + '/server.key');
const cert = readFileSync(__dirname + '/server.crt');
const ca = readFileSync(__dirname + '/server.csr');
const alpn = 'zzz';
const address = 'localhost';
const port = 12345;
const servername = 'localhost';
const qlog = true;

const ocspHandler = async function (type, options) {
    log(`OCSP Handler ${type}`);
    switch (type) {
        case 'request':
            return Buffer.from('hello');
        case 'response':
            assert(options.data.toString() === 'hello');
            break;
    }
};
const options = {
    key,
    cert,
    ca,
    alpn,
    qlog,
    ocspHandler,
};

const clientHelloHandler = async (alpn, servername, ciphers) => {
    serverLog('clientHelloHandler %s, %s', alpn, servername);
};

async function main() {
    const client = createQuicSocket({
        qlog,
        client: options,
    });
    const server = createQuicSocket({
        qlog,
        validateAddress: true,
        statelessResetSecret: Buffer.from('000102030405060708090A0B0C0D0E0F', 'hex'),
        server: options,
    });
    server.on('listening', () => {
        serverLog('listening on %s:%d', server.endpoints[0].address, server.endpoints[0].port);
    });
    server.on('ready', () => {
        serverLog('server is ready');
    });
    server.on('close', () => {
        serverLog('server is closing...');
    });

    client.on('endpointClose', () => {
        clientLog('endpoint closed');
    });
    client.on('close', () => {
        clientLog('client is closed');
    });

    await server.listen({
        requestCert: false,
        rejectUnauthorized: false,
        clientHelloHandler,
    });

    const req = await client.connect({
        address,
        port: server.endpoints[0].address.port,
        servername,
    });
    req.on('sessionTicket', () => clientLog('received session ticket'));
    req.on('secure', () => clientLog('SECURE!!'));
    req.on('close', () => {
        clientLog('CLOSED: code:%d family:%d', req.closeCode.code, req.closeCode.family);
    });
}

process.on('SIGINT', () => {
    console.log(`Ctrl + C detected. stopping...`);
    process.exit(0);
});

main().catch(console.error);
