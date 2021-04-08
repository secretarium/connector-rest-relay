import express, { Request, Response } from 'express';
import connector from './connector';
const router = express.Router();

const proxy = async (req: Request, res: Response): Promise<void> => {
    try {
        const request = await connector.request(req.params.dcapp, req.params.command, {}, (new Date().getTime() * Math.random()).toString(16).slice(0, 8));
        request.onResult(result => {
            const shouldBail = result && typeof result !== 'string' && result.email !== undefined;
            if (!shouldBail)
                res.json(result);
        });
        request.onError(result => {
            res.status(400);
            res.json(result);
        });
        request.send();
    } catch (e) {
        res.status(400);
        res.json(e);
    }
    return;
};

router.get('/:dcapp/:command', proxy);
router.post('/:dcapp/:command', proxy);

export default router;