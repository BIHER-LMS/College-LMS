import { Router } from 'express';
import { validate } from '../../../middleware/validation.middleware';
import { studentAiController } from './studentAi.controller';
import {
  studentChatRequestBodySchema,
  directToolExecutionBodySchema,
} from './studentAi.validation';

const router = Router();

/**
 * @route   POST /api/student/ai/chat (or /api/student/chat)
 * @desc    Submit a question/message to the Student AI Orchestrator
 * @access  Enrolled and Active Students
 */
router.post(
  '/chat',
  validate(studentChatRequestBodySchema),
  (req, res, next) => studentAiController.chat(req, res, next),
);

/**
 * @route   GET /api/student/ai/tools
 * @desc    List the 14 canonical student tools and parameter schemas
 * @access  Enrolled and Active Students
 */
router.get(
  '/tools',
  (req, res, next) => studentAiController.listTools(req, res, next),
);

/**
 * @route   POST /api/student/ai/tools/execute
 * @desc    Direct controlled execution of a canonical tool
 * @access  Enrolled and Active Students
 */
router.post(
  '/tools/execute',
  validate(directToolExecutionBodySchema),
  (req, res, next) => studentAiController.executeTool(req, res, next),
);

export default router;
