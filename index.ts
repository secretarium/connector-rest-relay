import express from 'express';
import bodyParser from 'body-parser';
import router from './src/router';
import connector from './src/connector';

const app = express();
const PORT = 8000;

connector.initialize().then(() => {
    app.use(bodyParser.json());
    app.use(router);
    app.get('*', (req, res) => {
        res.status(400);
        res.json({ error: 'Invalid request' });
    });
    app.listen(PORT, () => {
        console.log(`⚡️[server]: Proxy is running at http://localhost:${PORT}`);
    });
}).catch(error => {
    console.error(`🔥[server]: An error occurred (${error})`);
});