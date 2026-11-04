import OpenAI from 'openai';

const aiClient = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL,
});

export const generateProjectInfo = async (title: string, techStack: string[]) => {
  // 如果没配 Key，直接走降级
  if (!process.env.AI_API_KEY) {
    throw new Error('AI_NOT_CONFIGURED');
  }

  // 超时降级控制：设置 8 秒超时
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await aiClient.chat.completions.create(
      {
        model: 'deepseek-chat', // 根据你用的模型修改
        messages: [
          {
            role: 'system',
            content:
              '你是一个资深前端开发工程师。请根据用户提供的项目标题和技术栈，生成一句 50 字以内的项目简介。仅返回简介文本，不要多余废话。',
          },
          {
            role: 'user',
            content: `标题: ${title}, 技术栈: ${techStack.join(', ')}`,
          },
        ],
      },
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);
    return response.choices[0].message.content;
  } catch (error) {
    clearTimeout(timeoutId);
    // 加上这个判断，告诉 TS 这是一个 Error 对象
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('AI_TIMEOUT');
    }
    throw error;
  }
};
