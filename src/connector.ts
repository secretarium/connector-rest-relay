import { Key, SCP, Transaction, Constants } from '@secretarium/connector';
import fs from 'fs';

let errorCount = 0;
let currentKey: Key;
let TIMEOUT_DELAY = 0;
const MAX_ERROR_COUNT = parseInt(process.env.SECRETARIUM_RELAY_MAX_RETRIES ?? '0');
const { ConnectionState } = Constants;
const nativeDebug = console.debug;
const setDefaults = (): void => {
    errorCount = 0;
    TIMEOUT_DELAY = parseInt(process.env.SECRETARIUM_RELAY_CONNECTION_TIMEOUT ?? '2000');
};
setDefaults();
let currentConnection = new SCP();
const connector = {
    initialize: async (): Promise<void> => {
        console.debug = (...args: string[]) => { nativeDebug(`👻[server]: ${args.map(arg => `${arg.slice(0, 100)}...`).join(' ')}`); };
        const keyFile = process.env.SECRETARIUM_GATEWAY_PRIVATE_KEY_FILE;
        if (keyFile && fs.existsSync(keyFile)) {
            const encKey = JSON.parse(fs.readFileSync(keyFile).toString());
            currentKey = await Key.importEncryptedKeyPair(encKey, process.env.SECRETARIUM_GATEWAY_PRIVATE_KEY_SECRET ?? '');
        } else
            currentKey = await Key.createKey();
        const reconnectionHanlder = (error?: string): void => {
            console.error(`🔥[server]: An error occured${error ? ` (${error})` : ''}`);
            if (errorCount++ < MAX_ERROR_COUNT || MAX_ERROR_COUNT === 0) {
                console.error(`🔥[server]: Reconnecting in ${Math.floor(TIMEOUT_DELAY / 1000)}s ${MAX_ERROR_COUNT ? `(${errorCount}/${MAX_ERROR_COUNT}) ` : ''}...`);
                setTimeout(connectionRoll, TIMEOUT_DELAY);
                TIMEOUT_DELAY *= 1.1;
            } else {
                console.error('🔥[server]: Giving up');
                process.exit(1);
            }
        };
        const connectionRoll = (): Promise<void> => {
            console.log('⚡️[server]: Connecting to Secretarium...');
            currentConnection = new SCP();
            return currentConnection.connect(process.env.SECRETARIUM_GATEWAY_ADDRESS ?? '', currentKey, process.env.SECRETARIUM_GATEWAY_TRUST_KEY ?? '')
                .then(() => connector.request('__local__', '__systemForceDisconnectHook__', {}, 'active-disconnection'))
                .then(request => {
                    console.log('🎉[server]: Connection succeeded!');
                    setDefaults();
                    currentConnection.onStateChange(newState => {
                        if (newState === ConnectionState.closed)
                            reconnectionHanlder();
                    });
                    request.onError(error => {
                        reconnectionHanlder(error);
                    }).send()
                        .then(() => {/* NOOP */ })
                        .catch(error => {
                            reconnectionHanlder(error);
                            return error;
                        });
                    return Promise.resolve();
                }).catch(error => {
                    reconnectionHanlder(error);
                    return error;
                });
        };
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
