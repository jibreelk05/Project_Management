import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId format',
});

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name cannot exceed 100 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  startDate: z.string().datetime({ offset: true }).optional(),
  endDate: z.string().datetime({ offset: true }).optional(),
  teamMembers: z.array(objectIdSchema).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name cannot exceed 100 characters').optional(),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  startDate: z.string().datetime({ offset: true }).optional(),
  endDate: z.string().datetime({ offset: true }).optional(),
  teamMembers: z.array(objectIdSchema).optional(),
});