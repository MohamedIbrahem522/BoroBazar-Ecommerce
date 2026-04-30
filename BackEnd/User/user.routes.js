import { Router } from 'express';
import UserController from './user.controller.js';
import { protect, admin, user } from '../middleware/authmiddleware.js';

export const userRouter = Router();
const userController = new UserController();

// Get all users
// Permission: Admin only
userRouter.get('/', protect, admin, userController.getAllUsers.bind(userController));

// Get user by ID
// Permission: User and Admin (user can view own profile, admin can view any profile)
userRouter.get('/:id', protect, user, userController.getUserById.bind(userController));

// Create new user
// Permission: Admin only
userRouter.post('/', protect, admin, userController.createUser.bind(userController));

// Update user to myprofile
//Permission:User and Admin (user can update own profile, admin can update any profile)
userRouter.put('/myprofile/:id', protect, user, userController.updateUser.bind(userController));

// Delete user
// Permission: Admin only
userRouter.delete('/:id', protect, admin, userController.deleteUser.bind(userController));

// update user password
// Permission : User
userRouter.put('/password/:id', protect, user, userController.updateUserPassword.bind(userController));

// update user 
// Permission : Admin only
userRouter.put('/update-user/:id', protect, admin, userController.updateUser.bind(userController));