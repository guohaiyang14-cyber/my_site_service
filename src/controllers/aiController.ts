// controllers/aiController.ts
import { Request, Response, NextFunction } from 'express';
import * as aiService from '../services/aiService.js';
import { generateInfoSchema } from '../schemas/ai.schema.js';

export const generateInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. 先做 Zod 校验
    const result = generateInfoSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request body',
          details: result.error.issues.map((err) => `${err.path.join('.')}: ${err.message}`),
        },
      });
    }

    const { title, techStack } = result.data;

    // 2. 只有合法输入才去调 Service
    const summary = await aiService.generateProjectInfo(title, techStack);
    res.status(200).json({ data: { summary } });
  } catch (error: any) {
    // 3. 只有真正的 AI 问题才返回 503
    res.status(503).json({
      error: {
        code: error.message === 'AI_TIMEOUT' ? 'AI_TIMEOUT' : 'AI_ERROR',
        message: 'AI 服务暂时不可用，请手动填写',
      },
    });
  }
};
