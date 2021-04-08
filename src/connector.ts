import { Key, SCP, Transaction } from '@secretarium/connector';

let currenKey;
const currentConnection = new SCP();
const connector = {
    initialize: async (): Promise<void> => {
        currenKey = await Key.createKey();
        return currentConnection.connect(process.env.SECRETARIUM_GATEWAY_ADDRESS ?? '', currenKey, process.env.SECRETARIUM_GATEWAY_TRUST_KEY ?? '');
    },
    request: async (dcApp: string, command: string, args: Record<string, unknown> | string, id: string): Promise<Transaction> =>
        currentConnection.newTx(dcApp, command, id, args)
};

export default connector;
