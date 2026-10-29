import { z } from 'zod';

// 通用的 URL 校验（允许 null 和空字符串）
const optionalUrl = z
  .string()
  .optional()
  .nullable()
  .refine((val) => !val || /^https?:\/\/[^\s]+$/.test(val), {
    message: 'must be a valid http(s) URL',
  })
  .transform((val) => val || null); // 空字符串或 undefined 转为 null

// 1. 创建项目的 Schema
export const createProjectSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be kebab-case (e.g. "my-project")'),
  title: z.string().trim().min(1, 'title is required'),
  summary: z
    .string()
    .trim()
    .optional()
    .transform((val) => val || ''),
  techStack: z.array(z.string().trim().min(1)).min(1, 'techStack must be a non-empty array'),
  repoUrl: optionalUrl,
  demoUrl: optionalUrl,
  featured: z.boolean().optional().default(false),
});

// 2. 更新项目的 Schema（大部分字段可选，但一旦提供必须符合规则）
export const updateProjectSchema = createProjectSchema.partial().extend({
  // 如果提供了 slug，依然要校验正则
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be kebab-case')
    .optional(),
});

// 3. 自动推导 TS 类型（替代你手写的 ProjectInput）
export type ProjectCreateInput = z.infer<typeof createProjectSchema>;
