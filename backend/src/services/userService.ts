import { User } from '@prisma/client';
import { UserRepository } from '../repositories/userRepository';
import { CreateUserInput, UpdateUserInput } from '../validations/userValidation';

/**
 * Custom Operational Application Error class for clean error handling.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Create a new user. Performs email uniqueness verification.
   */
  async createUser(data: CreateUserInput): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('A user with this email address already exists.', 400);
    }

    // Map fields and write to repository
    return this.userRepository.create({
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      address: data.address,
      occupation: data.occupation,
      skills: data.skills, // Passed directly as JSON
      profileImage: data.profileImage || null,
      notes: data.notes || null,
    });
  }

  /**
   * Retrieve all users, ordered by newest.
   */
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  /**
   * Retrieve a user by ID. Throws 404 if not found.
   */
  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return user;
  }

  /**
   * Update a user's details. Handles partial updates and validates email uniqueness.
   */
  async updateUser(id: number, data: UpdateUserInput): Promise<User> {
    // 1. Verify user exists
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    // 2. Validate email uniqueness if changing email
    if (data.email && data.email !== user.email) {
      const emailOwner = await this.userRepository.findByEmail(data.email);
      if (emailOwner && emailOwner.id !== id) {
        throw new AppError('This email is already in use by another user.', 400);
      }
    }

    // 3. Compile data payload with safe properties
    const updatePayload: any = {};
    if (data.fullName !== undefined) updatePayload.fullName = data.fullName;
    if (data.email !== undefined) updatePayload.email = data.email;
    if (data.phoneNumber !== undefined) updatePayload.phoneNumber = data.phoneNumber;
    if (data.dateOfBirth !== undefined) updatePayload.dateOfBirth = data.dateOfBirth;
    if (data.gender !== undefined) updatePayload.gender = data.gender;
    if (data.address !== undefined) updatePayload.address = data.address;
    if (data.occupation !== undefined) updatePayload.occupation = data.occupation;
    if (data.skills !== undefined) updatePayload.skills = data.skills;
    if (data.profileImage !== undefined) updatePayload.profileImage = data.profileImage;
    if (data.notes !== undefined) updatePayload.notes = data.notes;

    // 4. Run update
    return this.userRepository.update(id, updatePayload);
  }

  /**
   * Delete a user. Throws 404 if not found.
   */
  async deleteUser(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return this.userRepository.delete(id);
  }
}
