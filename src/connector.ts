import { Key, SCP, Transaction } from '@secretarium/connector';
import fs from 'fs';

let currentKey: Key;
const nativeDebug = console.debug;
const currentConnection = new SCP();
const connector = {
    initialize: async (): Promise<void> => {
        console.debug = (...args: string[]) => { nativeDebug(`👻[server]: ${args.map(arg => `${arg.slice(0, 100)}...`).join(' ')}`); };
        const keyFile = process.env.SECRETARIUM_GATEWAY_PRIVATE_KEY_FILE;
        if (keyFile && fs.existsSync(keyFile)) {
            const encKey = JSON.parse(fs.readFileSync(keyFile).toString());
            currentKey = await Key.importEncryptedKeyPair(encKey, process.env.SECRETARIUM_GATEWAY_PRIVATE_KEY_SECRET ?? '');
        } else
            currentKey = await Key.createKey();
        const connectionRoll = () => currentConnection.connect(process.env.SECRETARIUM_GATEWAY_ADDRESS ?? '', currentKey, process.env.SECRETARIUM_GATEWAY_TRUST_KEY ?? '')
            .then(() => connector.request('__local__', '__systemForceDisconnectHook__', {}, 'active-disconnection'))
            .then(request => {
                console.log('🎉[server]: Connection succeeded!');
                request.onError(() => {
                    setTimeout(connectionRoll, parseInt(process.env.SFX_RELAY_CONNECTION_TIMEOUT ?? '2000'));
                }).send().catch(error => {
                    console.error(`🔥[server]: An error occured (${error})`);
                    console.error('🔥[server]: Reconnecting in short while...');
                });
            });
        return connectionRoll();
    },
    request: async (dcApp: string, command: string, args: Record<string, unknown> | string, id: string): Promise<Transaction> =>
        currentConnection.newTx(dcApp, command, id, args)
};

export const microFactory = (dcapp: string, command: string, arg?: any) => async (handlers: any) => {
    const requestId = (new Date().getTime() * Math.random()).toString(16).slice(0, 8);
    const request = await connector.request(dcapp, command, arg ?? {}, requestId);
    if (handlers.onResult)
        request.onResult(handlers.onResult);
    if (handlers.onExecuted)
        request.onExecuted(handlers.onExecuted);
    if (handlers.onError)
        request.onError(handlers.onError);
    return request;
};

export default connector;
