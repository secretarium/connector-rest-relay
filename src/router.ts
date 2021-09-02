import express, { Request, Response } from 'express';
import { microFactory } from './connector';

const router = express.Router();

const proxy = async (req: Request, res: Response): Promise<void> => {
    try {
        (await microFactory(req.params.dcapp, req.params.command, req.body)({
            onResult: (result: any) => {
                const shouldBail = result && typeof result !== 'string' && result.email !== undefined;
                if (!shouldBail)
                    res.json(result);
            },
            onExecuted: () => {
                res.json({ success: true });
            },
            onError: (result: any) => {
                res.status(400);
                res.json({ error: result });
            }
        })).send().catch(() => {
            // Handle dangling errors
        });
    } catch (e) {
        res.status(400);
        res.json(e);
    }
};

router.get('/:dcapp/:command', proxy);
router.post('/:dcapp/:command', proxy);

export default router;