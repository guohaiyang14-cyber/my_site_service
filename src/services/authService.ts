import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma.js';
import z from 'zod';

// 如果没配置 JWT_SECRET，直接抛错，拒绝启动
if (!process.env.JWT_SECRET) {
  throw new Error('致命错误：未在 .env 中配置 JWT_SECRET');
}
const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (data: any) => {
  // 简单粗暴：如果在生产环境，且没有传正确的邀请码，直接拒绝
  if (process.env.NODE_ENV === 'production' && data.inviteCode !== process.env.ADMIN_INVITE_CODE) {
    return { details: ['注册已关闭或邀请码无效'] };
  }

  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const password = typeof data.password === 'string' ? data.password : '';

  if (!email || !password) {
    return { details: ['邮箱和密码必须输入'] };
  }

  if (!z.string().email().safeParse(email)) {
    return { details: ['请输入正确的邮箱格式'] };
  }

  if (process.env.NODE_ENV === 'production' && email !== process.env.ADMIN_EMAIL) {
    return { details: ['禁止其他用户注册'] };
  }

  if (password.length < 6) {
    return { details: ['密码长度不能少于 6 位'] };
  }

  const existing = await prisma.user.findUnique({ where: { email: email } });
  if (existing) {
    return { details: ['邮箱已注册'] };
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: { name: data.name, email: email, password: hashedPassword },
  });

  return { user: { id: user.id, email: user.email, name: user.name } };
};

export const login = async (data: any) => {
  const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
  const password = typeof data.password === 'string' ? data.password : '';

  if (!email || !password) {
    return { details: ['请输入邮箱和密码'] };
  }

  const user = await prisma.user.findUnique({ where: { email: email } });
  if (!user) {
    return { details: ['邮箱未注册'] };
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return { details: ['密码错误'] };
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

  return { token, user: { id: user.id, name: user.name, email: user.email } };
};
