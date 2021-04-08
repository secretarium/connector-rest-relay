import express from 'express';
import router from './src/router';
import connector from './src/connector';

const app = express();
const PORT = 8000;

connector.initialize().then(() => {
    app.use(router);
    app.get('*', (req, res) => res.send('Secretarium Connector Relay'));
    app.listen(PORT, () => {
        console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
    });
}).catch(error => {
    console.error(`🔥[server]: An error occured (${error})`);
});