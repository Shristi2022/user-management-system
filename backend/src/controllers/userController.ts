import { Request, Response, NextFunction } from 'express';
import { UserService, AppError } from '../services/userService';

const userService = new UserService();

/**
 * Helper to validate and parse standard integer ID parameters.
 */
const parseUserId = (idStr: string): number => {
  const parsedId = parseInt(idStr, 10);
  if (isNaN(parsedId) || parsedId <= 0) {
    throw new AppError('Invalid User ID format.', 400);
  }
  return parsedId;
};

/**
 * @desc    Create a new user
 * @route   POST /api/users
 * @access  Public
 */
export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newUser = await userService.createUser(req.body);

    res.status(201).json({
      status: 'success',
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Public
 */
export const getAllUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await userService.getAllUsers();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Public
 */
export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate integer user ID format
    let userId: number;
    try {
      userId = parseUserId(id);
    } catch (validationError) {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid User ID format.',
      });
      return;
    }

    const user = await userService.getUserById(userId);

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    // If user is not found, handle cleanly in place or delegate
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        status: 'fail',
        message: error.message,
      });
      return;
    }
    next(error);
  }
};

/**
 * @desc    Update user by ID
 * @route   PUT /api/users/:id
 * @access  Public
 */
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate integer user ID format
    let userId: number;
    try {
      userId = parseUserId(id);
    } catch (validationError) {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid User ID format.',
      });
      return;
    }

    const updatedUser = await userService.updateUser(userId, req.body);

    res.status(200).json({
      status: 'success',
      data: updatedUser,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        status: 'fail',
        message: error.message,
      });
      return;
    }
    next(error);
  }
};

/**
 * @desc    Delete user by ID
 * @route   DELETE /api/users/:id
 * @access  Public
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate integer user ID format
    let userId: number;
    try {
      userId = parseUserId(id);
    } catch (validationError) {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid User ID format.',
      });
      return;
    }

    await userService.deleteUser(userId);

    res.status(200).json({
      status: 'success',
      message: 'User has been successfully deleted.',
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        status: 'fail',
        message: error.message,
      });
      return;
    }
    next(error);
  }
};
