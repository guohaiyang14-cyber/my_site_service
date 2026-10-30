import { z } from 'zod';

const slugRegex = /^(?=.*[a-z])[a-z0-9]+(?:-[a-z0-9]+)*$/;

// 通用的 URL 校验（允许 null 和空字符串）
const optionalUrl = z
  .string()
  .optional()
  .nullable()
  .refine((val) => !val || /^https?:\/\/[^\s]+$/.test(val), {
    message: '必须是有效的 http(s) URL 地址',
  })
  .transform((val) => val || null); // 空字符串或 undefined 转为 null

// 1. 创建项目的 Schema
export const createProjectSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(slugRegex, 'slug 必须为 kebab-case，且至少包含一个字母（例如 "my-project"）'),
  title: z.string().trim().min(1, '标题为必填项').max(100, '标题长度不能超过 100'),
  summary: z
    .string()
    .trim()
    .max(500, '摘要过长')
    .optional()
    .transform((val) => val || ''),
  techStack: z.array(z.string().trim().min(1)).min(1, 'techStack 必须为非空数组'),
  repoUrl: optionalUrl,
  demoUrl: optionalUrl,
  featured: z.boolean().optional().default(false),
});

// 2. 更新项目的 Schema（大部分字段可选，但一旦提供必须符合规则）
export const updateProjectSchema = createProjectSchema.partial().extend({
  // 如果提供了 slug，依然要校验正则
  slug: z.string().trim().regex(slugRegex, 'slug 必须为 kebab-case，且至少包含一个字母').optional(),
});

// 3. 自动推导 TS 类型（替代你手写的 ProjectInput）
export type ProjectCreateInput = z.infer<typeof createProjectSchema>;
