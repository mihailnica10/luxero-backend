export function success(c, data, meta) {
    return c.json({ data, meta });
}
export function created(c, data) {
    return c.json({ data }, 201);
}
export function error(c, code, message, status = 400, details) {
    return c.json({ error: { code, message, details } }, status);
}
export function paginated(c, items, total, page, limit) {
    return c.json({
        data: items,
        meta: { page, limit, total, pages: Math.ceil(total / limit) },
    });
}
