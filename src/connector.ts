import { Key, SCP, Transaction } from '@secretarium/connector';
import fs from 'fs';

let currentKey;
const currentConnection = new SCP();
const connector = {
    initialize: async (): Promise<void> => {
        const keyFile = process.env.SECRETARIUM_GATEWAY_PRIVATE_KEY_FILE;
        if (keyFile && fs.existsSync(keyFile)) {
            const encKey = JSON.parse(fs.readFileSync(keyFile).toString());
            currentKey = await Key.importEncryptedKeyPair(encKey, process.env.SECRETARIUM_GATEWAY_PRIVATE_KEY_SECRET ?? '');
        } else
            currentKey = await Key.createKey();
        return currentConnection.connect(process.env.SECRETARIUM_GATEWAY_ADDRESS ?? '', currentKey, process.env.SECRETARIUM_GATEWAY_TRUST_KEY ?? '');
    },
    request: async (dcApp: string, command: string, args: Record<string, unknown> | string, id: string): Promise<Transaction> =>
        currentConnection.newTx(dcApp, command, id, args)
};

export default connector;
