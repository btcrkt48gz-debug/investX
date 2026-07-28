import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import authRouter from "./auth";
import usersRouter from "./users";
import giftCardsRouter from "./giftCards";
import pricesRouter from "./prices";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(giftCardsRouter);
router.use(pricesRouter);

export default router;
