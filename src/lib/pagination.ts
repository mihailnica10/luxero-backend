export function parsePagination(c: { req: { query: (k: string) => string | undefined } }) {
  const limit = Math.min(parseInt(c.req.query("limit") || "20", 10), 100);
  const page = Math.max(parseInt(c.req.query("page") || "1", 10), 1);
  return { limit, page, skip: (page - 1) * limit };
}
