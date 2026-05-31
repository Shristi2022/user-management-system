import { Router } from 'express';
import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/userController';
import { validate } from '../middlewares/validationMiddleware';
import { createUserSchema, updateUserSchema } from '../validations/userValidation';

const router = Router();

// /api/users routes
router.route('/')
  .post(validate(createUserSchema), createUser)
  .get(getAllUsers);

// /api/users/:id routes
router.route('/:id')
  .get(getUserById)
  .put(validate(updateUserSchema), updateUser)
  .delete(deleteUser);

export default router;
