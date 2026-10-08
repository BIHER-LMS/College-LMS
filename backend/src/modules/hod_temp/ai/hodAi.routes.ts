import { Router } from 'express';
import { requireHODOrAdmin } from '../middleware/authMiddleware';
import { validate } from '../../../middleware/validation.middleware';
import { hodAiController } from './hodAi.controller';
import {
  hodChatRequestSchema,
  directToolExecutionSchema,
} from './hodAi.validation';

const router = Router();

// All HOD AI routes require valid Firebase auth and HOD/Admin role
router.use(requireHODOrAdmin);

/**
 * @route   POST /api/hod/ai/chat
 * @desc    Submit a message to the HOD AI Orchestrator
 * @access  HOD, College Admin, Super Admin
 */
router.post(
  '/chat',
  validate(hodChatRequestSchema),
  (req, res, next) => hodAiController.chat(req, res, next),
);

/**
 * @route   GET /api/hod/ai/tools
 * @desc    List canonical tools and parameter descriptions
 * @access  HOD, College Admin, Super Admin
 */
router.get(
  '/tools',
  (req, res, next) => hodAiController.listTools(req, res, next),
);

/**
 * @route   POST /api/hod/ai/tools/execute
 * @desc    Direct controlled tool execution
 * @access  HOD, College Admin, Super Admin
 */
router.post(
  '/tools/execute',
  validate(directToolExecutionSchema),
  (req, res, next) => hodAiController.executeTool(req, res, next),
);

export default router;
