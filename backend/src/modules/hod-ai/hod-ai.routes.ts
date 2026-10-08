<<<<<<< Updated upstream
/**
 * HOD AI Orchestrator — Routes
 *
 * Mounts the HOD AI chatbot endpoints under /api/hod/ai/*.
 *
 * Middleware stack (applied in order):
 *   1. requireAuth (Firebase token verification + authed_users lookup)
 *   2. requireHOD  (HOD role enforcement + department resolution)
 *   3. Route handler
 *
 * These middleware are the EXISTING hod_temp auth middleware.
 * We do NOT create a second authentication framework.
 *
 * @module hod-ai/routes
 * @owner Abhinav
 */

import { Router } from 'express';
import { requireHODOrAdmin } from '../hod_temp/middleware/authMiddleware';
import { hodAIController } from './hod-ai.controller';

const router = Router();

// All HOD AI routes require authentication + HOD role
router.use(requireHODOrAdmin);

/**
 * POST /api/hod/ai/chat
 *
 * Main chat endpoint for the HOD AI assistant.
 *
 * Headers:
 *   Authorization: Bearer <firebase-id-token>
 *
 * Request body:
 *   {
 *     "message": "What is the attendance summary for my department?",
 *     "conversationHistory": [
 *       { "role": "user", "content": "..." },
 *       { "role": "assistant", "content": "..." }
 *     ],
 *     "conversationId": "optional-uuid"
 *   }
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "data": {
 *       "message": "...",
 *       "conversationId": "...",
 *       "toolsInvoked": [...],
 *       "timestamp": "..."
 *     }
 *   }
 */
router.post('/chat', (req, res, next) => hodAIController.chat(req, res, next));

/**
 * GET /api/hod/ai/tools
 *
 * Returns the list of available AI tools for introspection.
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "data": {
 *       "tools": [
 *         { "name": "hod.getAttendanceSummary", "purpose": "...", ... },
 *         ...
 *       ]
 *     }
 *   }
 */
router.get('/tools', (req, res, next) => hodAIController.getTools(req, res, next));

/**
 * GET /api/hod/ai/health
 *
 * Health check for the AI orchestrator subsystem.
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "data": { "status": "healthy", "toolCount": 7, "timestamp": "..." }
 *   }
 */
router.get('/health', (req, res, next) => hodAIController.health(req, res, next));
=======
import { Router } from 'express';
import { hodAiController } from './hod-ai.controller';
import { requireHODOrAdmin } from '../hod_temp/middleware/authMiddleware';

const router = Router();

// Secure all AI routes using the exact existing HOD context builder
router.use(requireHODOrAdmin);

router.post('/chat', (req, res, next) => hodAiController.handleQuery(req, res, next));
>>>>>>> Stashed changes

export default router;
