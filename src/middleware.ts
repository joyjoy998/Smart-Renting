import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [], // 表示不拦截任何请求,之后重铸架构后再做修改
};
