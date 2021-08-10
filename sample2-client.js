'use strict';

const { createQuicSocket } = require('net');
const { readFile } = require('fs/promises');

async function main() {
    const socket = await generateClient();
    console.log(`socket has created`);
    socket.on('error', console.error.bind(console));
    socket.on('sessionError', console.error.bind(console));
    socket.on('endpointClose', () => {
        console.log('client endpoint closed', arguments);
    });
    socket.on('close', (...args) => {
        console.log('connection closed', args);
    });
    socket.on('ready', async () => {
        console.log(`ready`);
    });

    const client = await socket.connect({
        address: 'localhost',
        port: 1234,
    });

    client.on('error', console.error);
    client.on('close', () => {
        console.log('client socket has closed.');
        process.exit(0);
    });
    client.on('secure', () => {
        console.log(`connection secured!`);
        const stream = client.openStream({ halfOpen: true });
        stream.on('data', chunk => console.log(chunk.toString()));
        stream.on('end', () => console.log(`secure stream finished`));
        stream.on('close', () => {
            socket.close();
        });
        stream.on('error', console.error);
    });
    client.on('stream', stream => {
        console.log(stream);
    });
}

async function generateClient() {
    const key = await readFile(__dirname + '/server.key');
    const cert = await readFile(__dirname + '/server.crt');
    const ca = await readFile(__dirname + '/server.csr');
    const alpn = 'hello';

    return createQuicSocket({
        client: {
            key,
            cert,
            ca,
            alpn,
        },
    });
}

process.on('SIGINT', () => {
    console.log(`Ctrl+C detected. Stopping client...`);
    process.exit(2);
});

main().catch(console.error);
