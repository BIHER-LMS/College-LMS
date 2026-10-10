import { Router } from 'express';
import { validate } from '../../../middleware/validation.middleware';
import { facultyAiController } from './facultyAi.controller';
import {
  facultyChatRequestSchema,
  directToolExecutionSchema,
} from './facultyAi.validation';

const router = Router();

/**
 * @route   POST /api/faculty/ai/chat
 * @desc    Submit a message to the Faculty AI Orchestrator
 * @access  FACULTY, HOD, ADMIN
 */
router.post(
  '/chat',
  validate(facultyChatRequestSchema),
  facultyAiController.chat,
);

/**
 * @route   GET /api/faculty/ai/tools
 * @desc    List all 19 canonical faculty tools and their parameter metadata
 * @access  FACULTY, HOD, ADMIN
 */
router.get(
  '/tools',
  facultyAiController.listTools,
);

/**
 * @route   POST /api/faculty/ai/tools/execute
 * @desc    Direct controlled execution of a registered tool
 * @access  FACULTY, HOD, ADMIN
 */
router.post(
  '/tools/execute',
  validate(directToolExecutionSchema),
  facultyAiController.executeTool,
);

export default router;
