import { Router } from 'express';
import { authRouter } from './auth/auth.routes';
import { adminRouter } from './admin/admin.routes';
import { dietHydrationRouter } from './diet-hydration/diet-hydration.routes';
import { plannerRouter } from './planner/planner.routes';
import { chatRouter } from './chat/chat.routes';
import { gameRouter } from './game/game.routes';
import { movieRouter } from './movie/movie.routes';
import { filesRouter } from './files/files.routes';
import { kycRouter } from './kyc/kyc.routes';

export const userRouter = Router();

// Mount user feature modules
userRouter.use('/auth', authRouter);
userRouter.use('/admin', adminRouter);
userRouter.use('/user/diet-hydration', dietHydrationRouter);
userRouter.use('/diet-hydration', dietHydrationRouter);
userRouter.use('/user/planner', plannerRouter);
userRouter.use('/planner', plannerRouter);
userRouter.use('/chat', chatRouter);
userRouter.use('/user/game', gameRouter);
userRouter.use('/game', gameRouter);
userRouter.use('/movies', movieRouter);
userRouter.use('/files', filesRouter);
userRouter.use('/kyc', kycRouter);

export {
  authRouter,
  adminRouter,
  dietHydrationRouter,
  plannerRouter,
  chatRouter,
  gameRouter,
  movieRouter,
  filesRouter,
  kycRouter,
};
