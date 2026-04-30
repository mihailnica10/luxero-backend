var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// node_modules/hono/dist/compose.js
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
  };
};

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// node_modules/hono/dist/utils/body.js
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
};
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form2 = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form2[key] = value;
    } else {
      handleParsingAllValues(form2, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form2).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form2, key, value);
        delete form2[key];
      }
    });
  }
  return form2;
}
var handleParsingAllValues = (form2, key, value) => {
  if (form2[key] !== void 0) {
    if (Array.isArray(form2[key])) {
      ;
      form2[key].push(value);
    } else {
      form2[key] = [form2[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form2[key] = value;
    } else {
      form2[key] = [value];
    }
  }
};
var handleParsingNestedValues = (form2, key, value) => {
  if (/(?:^|\.)__proto__\./.test(key)) {
    return;
  }
  let nestedForm = form2;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
};

// node_modules/hono/dist/utils/url.js
var splitPath = (path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
};
var tryDecode = (str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
};
var tryDecodeURI = (str) => tryDecode(str, decodeURI);
var getPath = (request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35) {
      break;
    }
  }
  return url.slice(start, i);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
};
var mergePath = (base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
};
var checkOptionalParameter = (path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
};
var _decodeURI = (value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
};
var _getQueryParam = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = (str) => tryDecode(str, decodeURIComponent_);
var HonoRequest = class {
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = (value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
};
var escapeRe = /[&<>'"]/;
var stringBufferToString = async (buffer, callbacks) => {
  let str = "";
  callbacks ||= [];
  const resolvedBuffer = await Promise.all(buffer);
  for (let i = resolvedBuffer.length - 1; ; i--) {
    str += resolvedBuffer[i];
    i--;
    if (i < 0) {
      break;
    }
    let r = resolvedBuffer[i];
    if (typeof r === "object") {
      callbacks.push(...r.callbacks || []);
    }
    const isEscaped = r.isEscaped;
    r = await (typeof r === "object" ? r.toString() : r);
    if (typeof r === "object") {
      callbacks.push(...r.callbacks || []);
    }
    if (r.isEscaped ?? isEscaped) {
      str += r;
    } else {
      const buf = [str];
      escapeToBuffer(r, buf);
      str = buf[0];
    }
  }
  return raw(str, callbacks);
};
var escapeToBuffer = (str, buffer) => {
  const match2 = str.search(escapeRe);
  if (match2 === -1) {
    buffer[0] += str;
    return;
  }
  let escape;
  let index;
  let lastIndex = 0;
  for (index = match2; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34:
        escape = "&quot;";
        break;
      case 39:
        escape = "&#39;";
        break;
      case 38:
        escape = "&amp;";
        break;
      case 60:
        escape = "&lt;";
        break;
      case 62:
        escape = "&gt;";
        break;
      default:
        continue;
    }
    buffer[0] += str.substring(lastIndex, index) + escape;
    lastIndex = index + 1;
  }
  buffer[0] += str.substring(lastIndex, index);
};
var resolveCallbackSync = (str) => {
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return str;
  }
  const buffer = [str];
  const context = {};
  callbacks.forEach((c) => c({ phase: HtmlEscapedCallbackPhase.Stringify, buffer, context }));
  return buffer[0];
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
};

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = (contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
};
var createResponseInstance = (body, init) => new Response(body, init);
var Context = class {
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= createResponseInstance(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = (layout) => this.#layout = layout;
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = () => this.#layout;
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = createResponseInstance(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, { status, headers: responseHeaders });
  }
  newResponse = (...args) => this.#newResponse(...args);
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html2, arg, headers) => {
    const res = (html22) => this.#newResponse(html22, arg, setDefaultContentType("text/html; charset=UTF-8", headers));
    return typeof html2 === "object" ? resolveCallback(html2, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html2);
  };
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = () => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  };
};

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = (c) => {
  return c.text("404 Not Found", 404);
};
var errorHandler = (err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
};
var Hono = class _Hono {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app24) {
    const subApp = this.basePath(path);
    app24.routes.map((r) => {
      let handler;
      if (app24.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = async (c, next) => (await compose([], app24.errorHandler)(c, () => r.handler(c, next))).res;
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = (request) => request;
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    };
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} Env - env Object
   * @param {ExecutionContext} - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = (input2, requestInit, Env, executionCtx) => {
    if (input2 instanceof Request) {
      return this.fetch(requestInit ? new Request(input2, requestInit) : input2, Env, executionCtx);
    }
    input2 = input2.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input2) ? input2 : `http://localhost${mergePath("/", input2)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
};

// node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = ((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  });
  this.match = match2;
  return match2(method, path);
}

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var Node = class _Node {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new _Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new _Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
var RegExpRouter = class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var hasChildren = (children) => {
  for (const _ in children) {
    return true;
  }
  return false;
};
var Node2 = class _Node2 {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            }
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              this.#pushHandlerSets(handlerSets, astNode, method, node.#params);
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          if (matcher instanceof RegExp) {
            if (partOffsets === null) {
              partOffsets = new Array(len);
              let offset = path[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path.substring(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (hasChildren(child.#children)) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  params,
                  node.#params
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// node_modules/hono/dist/middleware/cors/index.js
var cors = (options) => {
  const defaults = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: []
  };
  const opts = {
    ...defaults,
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        if (opts.credentials) {
          return (origin) => origin || null;
        }
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return optsAllowMethods;
    } else if (Array.isArray(optsAllowMethods)) {
      return () => optsAllowMethods;
    } else {
      return () => [];
    }
  })(opts.allowMethods);
  return async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c.req.method === "OPTIONS") {
      if (opts.origin !== "*" || opts.credentials) {
        set("Vary", "Origin");
      }
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods.length) {
        set("Access-Control-Allow-Methods", allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*" || opts.credentials) {
      c.header("Vary", "Origin", { append: true });
    }
  };
};

// src/db.ts
import mongoose from "mongoose";
var cached = global.mongoose ?? {
  conn: null,
  promise: null
};
async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
  }
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose19) => {
      return mongoose19;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}
var db_default = dbConnect;

// src/lib/error-codes.ts
var ErrorCodes = {
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT"
};

// src/lib/pagination.ts
function parsePagination(c) {
  const limit = Math.min(parseInt(c.req.query("limit") || "20", 10), 100);
  const page = Math.max(parseInt(c.req.query("page") || "1", 10), 1);
  return { limit, page, skip: (page - 1) * limit };
}

// src/lib/response.ts
function success(c, data, meta2) {
  return c.json({ data, meta: meta2 });
}
function error(c, code, message, status = 400, details) {
  return c.json({ error: { code, message, details } }, status);
}
function paginated(c, items, total, page, limit) {
  return c.json({
    data: items,
    meta: { page, limit, total, pages: Math.ceil(total / limit) }
  });
}

// src/lib/jwt.ts
import jwt from "jsonwebtoken";
var JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  return secret || "dev-secret-do-not-use-in-production";
})();
var JWT_EXPIRY = "7d";
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// src/middleware/auth.ts
async function auth(c, next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, 401);
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    return c.json({ error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } }, 401);
  }
  c.set("userId", payload.userId);
  c.set("isAdmin", payload.isAdmin);
  await next();
}
async function requireAdmin(c, next) {
  const isAdmin = c.get("isAdmin");
  if (!isAdmin) {
    return c.json({ error: { code: "FORBIDDEN", message: "Admin access required" } }, 403);
  }
  await next();
}

// src/models/Category.ts
import mongoose2, { Schema } from "mongoose";
var CategorySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    label: { type: String, required: true },
    iconName: { type: String, required: true, default: "Trophy" },
    description: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);
CategorySchema.index({ slug: 1 }, { unique: true });
var Category = mongoose2.model("Category", CategorySchema);

// src/models/Competition.ts
import mongoose3, { Schema as Schema2 } from "mongoose";
var CompetitionSchema = new Schema2(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    shortDescription: { type: String },
    description: { type: String },
    category: { type: String, index: true },
    status: { type: String, default: "draft", index: true },
    prizeTitle: { type: String },
    prizeValue: { type: Number, required: true },
    prizeImageUrl: { type: String },
    prizeImages: [{ type: String }],
    prizeSpecifications: { type: Schema2.Types.Mixed },
    ticketPrice: { type: Number, required: true },
    maxTickets: { type: Number, required: true },
    ticketsSold: { type: Number, default: 0 },
    maxTicketsPerUser: { type: Number, default: 100 },
    question: { type: String },
    questionOptions: [{ type: String }],
    correctAnswer: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    drawDate: { type: Date, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    displayOrder: { type: Number, default: 0 },
    isHeroFeatured: { type: Boolean, default: false },
    heroDisplayOrder: { type: Number },
    heroImageUrl: { type: String },
    originalPrice: { type: Number },
    imageUrl: { type: String },
    currency: { type: String, default: "GBP" },
    winnerId: { type: Schema2.Types.ObjectId, ref: "Profile" },
    winnerTicketNumber: { type: Number },
    winnerAnnouncedAt: { type: Date },
    isReferralReward: { type: Boolean, default: false },
    createdBy: { type: Schema2.Types.ObjectId, ref: "Profile" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);
CompetitionSchema.index({ status: 1, category: 1 });
CompetitionSchema.index({ drawDate: 1 });
CompetitionSchema.index({ isFeatured: 1 });
var Competition = mongoose3.model("Competition", CompetitionSchema);

// src/models/Entry.ts
import mongoose4, { Schema as Schema3 } from "mongoose";
var EntrySchema = new Schema3(
  {
    userId: { type: Schema3.Types.ObjectId, ref: "Profile", required: true, index: true },
    competitionId: { type: Schema3.Types.ObjectId, ref: "Competition", required: true, index: true },
    orderId: { type: Schema3.Types.ObjectId, ref: "Order", index: true },
    ticketNumbers: [{ type: Number }],
    quantity: { type: Number, required: true },
    answerIndex: { type: Number },
    answerCorrect: { type: Boolean },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);
EntrySchema.index({ userId: 1, competitionId: 1 });
EntrySchema.index({ orderId: 1 });
var Entry = mongoose4.model("Entry", EntrySchema);

// src/models/InstantPrize.ts
import mongoose5, { Schema as Schema4 } from "mongoose";
var InstantPrizeSchema = new Schema4(
  {
    competitionId: { type: Schema4.Types.ObjectId, ref: "Competition", required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    value: { type: Number },
    totalQuantity: { type: Number, required: true, default: 1 },
    remainingQuantity: { type: Number, required: true, default: 1 },
    winningTicketNumbers: [{ type: Number }],
    prizeType: { type: String, required: true, default: "direct" },
    prizeCompetitionId: { type: Schema4.Types.ObjectId, ref: "Competition" },
    isActive: { type: Boolean, default: true, index: true },
    startsAt: { type: Date },
    endsAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);
InstantPrizeSchema.index({ competitionId: 1 });
InstantPrizeSchema.index({ isActive: 1 });
var InstantPrize = mongoose5.model("InstantPrize", InstantPrizeSchema);

// src/models/InstantPrizeWin.ts
import mongoose6, { Schema as Schema5 } from "mongoose";
var InstantPrizeWinSchema = new Schema5(
  {
    instantPrizeId: {
      type: Schema5.Types.ObjectId,
      ref: "InstantPrize",
      required: true,
      index: true
    },
    userId: { type: Schema5.Types.ObjectId, ref: "Profile", required: true, index: true },
    entryId: { type: Schema5.Types.ObjectId, ref: "Entry" },
    ticketNumber: { type: Number },
    claimed: { type: Boolean, default: false },
    claimedAt: { type: Date },
    shippingAddress: {
      addressLine1: String,
      addressLine2: String,
      city: String,
      postcode: String,
      country: String
    },
    wonAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);
InstantPrizeWinSchema.index({ userId: 1 });
InstantPrizeWinSchema.index({ instantPrizeId: 1 });
var InstantPrizeWin = mongoose6.model(
  "InstantPrizeWin",
  InstantPrizeWinSchema
);

// src/models/Language.ts
import mongoose7, { Schema as Schema6 } from "mongoose";
var LanguageSchema = new Schema6(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    nativeName: { type: String, required: true },
    isActive: { type: Boolean, default: true, index: true },
    isDefault: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);
LanguageSchema.index({ code: 1 }, { unique: true });
var Language = mongoose7.model("Language", LanguageSchema);

// src/models/Order.ts
import mongoose8, { Schema as Schema7 } from "mongoose";
var OrderSchema = new Schema7(
  {
    orderNumber: { type: Number, required: true, unique: true },
    userId: { type: Schema7.Types.ObjectId, ref: "Profile", required: true, index: true },
    status: { type: String, default: "pending", index: true },
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    promoCodeId: { type: Schema7.Types.ObjectId, ref: "PromoCode" },
    referralBonusTickets: { type: Number, default: 0 },
    referralBalanceUsed: { type: Number, default: 0 },
    stripeSessionId: { type: String, index: true },
    stripePaymentIntentId: { type: String },
    paidAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);
OrderSchema.index({ userId: 1, status: 1 });
OrderSchema.index({ stripeSessionId: 1 });
var Order = mongoose8.model("Order", OrderSchema);

// src/models/OrderItem.ts
import mongoose9, { Schema as Schema8 } from "mongoose";
var OrderItemSchema = new Schema8(
  {
    orderId: { type: Schema8.Types.ObjectId, ref: "Order", required: true, index: true },
    competitionId: { type: Schema8.Types.ObjectId, ref: "Competition", required: true, index: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    ticketNumbers: [{ type: Number }],
    answerIndex: { type: Number },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);
OrderItemSchema.index({ orderId: 1 });
OrderItemSchema.index({ competitionId: 1 });
var OrderItem = mongoose9.model("OrderItem", OrderItemSchema);

// src/models/Profile.ts
import mongoose10, { Schema as Schema9 } from "mongoose";
var ProfileSchema = new Schema9(
  {
    email: { type: String, required: true, index: true },
    fullName: { type: String },
    avatarUrl: { type: String },
    phone: { type: String },
    dateOfBirth: { type: Date },
    addressLine1: { type: String },
    addressLine2: { type: String },
    city: { type: String },
    postcode: { type: String },
    country: { type: String, default: "GB" },
    isAdmin: { type: Boolean, default: false, index: true },
    isVerified: { type: Boolean, default: false },
    marketingConsent: { type: Boolean, default: false },
    instagram: { type: String },
    facebook: { type: String },
    twitter: { type: String },
    tiktok: { type: String },
    youtube: { type: String },
    websiteUrl: { type: String },
    showLastName: { type: Boolean, default: false },
    showLocation: { type: Boolean, default: false },
    showSocials: { type: Boolean, default: false },
    totalEntries: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    winsCount: { type: Number, default: 0 },
    referralCode: { type: String, unique: true, sparse: true, index: true },
    referredBy: { type: Schema9.Types.ObjectId, ref: "Profile", index: true },
    referralCount: { type: Number, default: 0 },
    referralBalance: { type: Number, default: 0 },
    referralPayout: { type: Number, default: 0 },
    referralTierPendingTickets: { type: Number, default: 0 },
    referralTierAwardedTickets: { type: Number, default: 0 },
    referralTierLastUpdated: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);
ProfileSchema.index({ email: 1 });
ProfileSchema.index({ referralCode: 1 }, { unique: true, sparse: true });
var Profile = mongoose10.model("Profile", ProfileSchema);

// src/models/PromoCode.ts
import mongoose11, { Schema as Schema10 } from "mongoose";
var PromoCodeSchema = new Schema10(
  {
    code: { type: String, required: true, unique: true, index: true },
    discountType: { type: String, required: true },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number },
    maxUses: { type: Number },
    currentUses: { type: Number, default: 0 },
    maxUsesPerUser: { type: Number, default: 1 },
    validFrom: { type: Date },
    validUntil: { type: Date },
    isActive: { type: Boolean, default: true, index: true },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);
PromoCodeSchema.index({ code: 1 }, { unique: true });
PromoCodeSchema.index({ isActive: 1 });
var PromoCode = mongoose11.model("PromoCode", PromoCodeSchema);

// src/models/ReferralPurchase.ts
import mongoose12, { Schema as Schema11 } from "mongoose";
var ReferralPurchaseSchema = new Schema11(
  {
    referrerId: { type: Schema11.Types.ObjectId, ref: "Profile", required: true, index: true },
    referredUserId: { type: Schema11.Types.ObjectId, ref: "Profile", required: true, index: true },
    orderId: { type: Schema11.Types.ObjectId, ref: "Order", required: true },
    purchasedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);
ReferralPurchaseSchema.index({ referrerId: 1, purchasedAt: 1 });
var ReferralPurchase = mongoose12.model(
  "ReferralPurchase",
  ReferralPurchaseSchema
);

// src/models/User.ts
import bcrypt from "bcryptjs";
import mongoose13, { Schema as Schema12 } from "mongoose";
var UserSchema = new Schema12(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationExpiry: { type: Date },
    resetCode: { type: String },
    resetExpiry: { type: Date }
  },
  { timestamps: true }
);
UserSchema.pre("save", async function() {
  if (this.isModified("passwordHash") && !this.passwordHash.startsWith("$2")) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
});
UserSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};
UserSchema.methods.setVerificationCode = async function(code) {
  const hash = await bcrypt.hash(code, 10);
  this.verificationCode = hash;
  this.verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1e3);
};
UserSchema.methods.clearVerificationCode = function() {
  this.verificationCode = void 0;
  this.verificationExpiry = void 0;
};
UserSchema.methods.setResetCode = async function(code) {
  const hash = await bcrypt.hash(code, 10);
  this.resetCode = hash;
  this.resetExpiry = new Date(Date.now() + 60 * 60 * 1e3);
};
UserSchema.methods.clearResetCode = function() {
  this.resetCode = void 0;
  this.resetExpiry = void 0;
};
var User = mongoose13.model("User", UserSchema);

// src/models/Winner.ts
import mongoose14, { Schema as Schema13 } from "mongoose";
var WinnerSchema = new Schema13(
  {
    competitionId: { type: Schema13.Types.ObjectId, ref: "Competition", required: true, index: true },
    userId: { type: Schema13.Types.ObjectId, ref: "Profile", required: true, index: true },
    entryId: { type: Schema13.Types.ObjectId, ref: "Entry" },
    ticketNumber: { type: Number, required: true },
    prizeTitle: { type: String },
    prizeValue: { type: Number },
    prizeImageUrl: { type: String },
    displayName: { type: String },
    location: { type: String },
    testimonial: { type: String },
    winnerPhotoUrl: { type: String },
    showFullName: { type: Boolean, default: false },
    claimed: { type: Boolean, default: false },
    claimedAt: { type: Date },
    drawnAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);
WinnerSchema.index({ competitionId: 1 });
WinnerSchema.index({ userId: 1 });
var Winner = mongoose14.model("Winner", WinnerSchema);

// src/routes/admin/categories.ts
var app = new Hono2();
app.use("*", requireAdmin);
app.get("/", async (c) => {
  try {
    const { limit, page, skip } = parsePagination(c);
    await db_default();
    const query = {};
    const isActive = c.req.query("isActive");
    if (isActive !== void 0) query.isActive = isActive === "true";
    const [categories, total] = await Promise.all([
      Category.find(query).sort({ displayOrder: 1 }).skip(skip).limit(limit).lean(),
      Category.countDocuments(query)
    ]);
    return paginated(c, categories, total, page, limit);
  } catch (err) {
    console.error("Error listing categories:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await db_default();
    const category = await Category.findById(id).lean();
    if (!category) {
      return error(c, ErrorCodes.NOT_FOUND, "Category not found", 404);
    }
    return success(c, category);
  } catch (err) {
    console.error("Error fetching category:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app.post("/", async (c) => {
  try {
    const body = await c.req.json();
    await db_default();
    const category = await Category.create(body);
    return success(c, category);
  } catch (err) {
    console.error("Error creating category:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    await db_default();
    const category = await Category.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!category) {
      return error(c, ErrorCodes.NOT_FOUND, "Category not found", 404);
    }
    return success(c, category);
  } catch (err) {
    console.error("Error updating category:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await db_default();
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return error(c, ErrorCodes.NOT_FOUND, "Category not found", 404);
    }
    return success(c, { success: true });
  } catch (err) {
    console.error("Error deleting category:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
var categories_default = app;

// src/routes/admin/competitions.ts
var app2 = new Hono2();
app2.use("*", requireAdmin);
app2.get("/", async (c) => {
  try {
    const { limit, page, skip } = parsePagination(c);
    await db_default();
    const query = {};
    const status = c.req.query("status");
    if (status) query.status = status;
    const [competitions, total] = await Promise.all([
      Competition.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Competition.countDocuments(query)
    ]);
    return paginated(c, competitions, total, page, limit);
  } catch (err) {
    console.error("Error listing competitions:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app2.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await db_default();
    const competition = await Competition.findById(id).lean();
    if (!competition) {
      return error(c, ErrorCodes.NOT_FOUND, "Competition not found", 404);
    }
    return success(c, competition);
  } catch (err) {
    console.error("Error fetching competition:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app2.post("/", async (c) => {
  try {
    const body = await c.req.json();
    await db_default();
    const competition = await Competition.create(body);
    return success(c, competition);
  } catch (err) {
    console.error("Error creating competition:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app2.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    await db_default();
    const competition = await Competition.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!competition) {
      return error(c, ErrorCodes.NOT_FOUND, "Competition not found", 404);
    }
    return success(c, competition);
  } catch (err) {
    console.error("Error updating competition:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app2.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await db_default();
    const competition = await Competition.findByIdAndDelete(id);
    if (!competition) {
      return error(c, ErrorCodes.NOT_FOUND, "Competition not found", 404);
    }
    return success(c, { success: true });
  } catch (err) {
    console.error("Error deleting competition:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app2.post("/:id/draw", async (c) => {
  try {
    const id = c.req.param("id");
    await db_default();
    const competition = await Competition.findById(id).lean();
    if (!competition) {
      return error(c, ErrorCodes.NOT_FOUND, "Competition not found", 404);
    }
    if (competition.status !== "ended") {
      return error(
        c,
        ErrorCodes.VALIDATION_ERROR,
        "Competition must be ended to draw a winner",
        400
      );
    }
    const entries = await Entry.find({ competitionId: id }).lean();
    if (entries.length === 0) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "No entries found for this competition", 400);
    }
    const randomIndex = Math.floor(Math.random() * entries.length);
    const winningEntry = entries[randomIndex];
    const winner = await Winner.create({
      competitionId: competition._id,
      userId: winningEntry.userId,
      entryId: winningEntry._id,
      drawnAt: /* @__PURE__ */ new Date()
    });
    await Competition.findByIdAndUpdate(id, { status: "drawn" });
    return success(c, { winner, competition, winningEntry });
  } catch (err) {
    console.error("Error drawing winner:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
var competitions_default = app2;

// src/routes/admin/instant-prizes.ts
var app3 = new Hono2();
app3.use("*", requireAdmin);
app3.get("/", async (c) => {
  try {
    const { limit, page, skip } = parsePagination(c);
    await db_default();
    const query = {};
    const isActive = c.req.query("isActive");
    if (isActive !== void 0) query.isActive = isActive === "true";
    const [instantPrizes, total] = await Promise.all([
      InstantPrize.find(query).sort({ displayOrder: 1 }).skip(skip).limit(limit).lean(),
      InstantPrize.countDocuments(query)
    ]);
    return paginated(c, instantPrizes, total, page, limit);
  } catch (err) {
    console.error("Error listing instant prizes:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app3.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await db_default();
    const instantPrize = await InstantPrize.findById(id).lean();
    if (!instantPrize) {
      return error(c, ErrorCodes.NOT_FOUND, "Instant prize not found", 404);
    }
    return success(c, instantPrize);
  } catch (err) {
    console.error("Error fetching instant prize:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app3.post("/", async (c) => {
  try {
    const body = await c.req.json();
    await db_default();
    const instantPrize = await InstantPrize.create(body);
    return success(c, instantPrize);
  } catch (err) {
    console.error("Error creating instant prize:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app3.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    await db_default();
    const instantPrize = await InstantPrize.findByIdAndUpdate(id, body, {
      new: true
    }).lean();
    if (!instantPrize) {
      return error(c, ErrorCodes.NOT_FOUND, "Instant prize not found", 404);
    }
    return success(c, instantPrize);
  } catch (err) {
    console.error("Error updating instant prize:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app3.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await db_default();
    const instantPrize = await InstantPrize.findByIdAndDelete(id);
    if (!instantPrize) {
      return error(c, ErrorCodes.NOT_FOUND, "Instant prize not found", 404);
    }
    return success(c, { success: true });
  } catch (err) {
    console.error("Error deleting instant prize:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
var instant_prizes_default = app3;

// src/routes/admin/languages.ts
var app4 = new Hono2();
app4.use("*", requireAdmin);
app4.get("/", async (c) => {
  try {
    const { limit, page, skip } = parsePagination(c);
    await db_default();
    const query = {};
    const isActive = c.req.query("isActive");
    if (isActive !== void 0) query.isActive = isActive === "true";
    const [languages, total] = await Promise.all([
      Language.find(query).sort({ displayOrder: 1 }).skip(skip).limit(limit).lean(),
      Language.countDocuments(query)
    ]);
    return paginated(c, languages, total, page, limit);
  } catch (err) {
    console.error("Error listing languages:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app4.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await db_default();
    const language = await Language.findById(id).lean();
    if (!language) {
      return error(c, ErrorCodes.NOT_FOUND, "Language not found", 404);
    }
    return success(c, language);
  } catch (err) {
    console.error("Error fetching language:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app4.post("/", async (c) => {
  try {
    const body = await c.req.json();
    await db_default();
    const language = await Language.create(body);
    return success(c, language);
  } catch (err) {
    console.error("Error creating language:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app4.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    await db_default();
    const language = await Language.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!language) {
      return error(c, ErrorCodes.NOT_FOUND, "Language not found", 404);
    }
    return success(c, language);
  } catch (err) {
    console.error("Error updating language:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app4.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await db_default();
    const language = await Language.findByIdAndDelete(id);
    if (!language) {
      return error(c, ErrorCodes.NOT_FOUND, "Language not found", 404);
    }
    return success(c, { success: true });
  } catch (err) {
    console.error("Error deleting language:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
var languages_default = app4;

// src/routes/admin/orders.ts
var app5 = new Hono2();
app5.use("*", requireAdmin);
app5.get("/", async (c) => {
  try {
    const { limit, page, skip } = parsePagination(c);
    await db_default();
    const query = {};
    const status = c.req.query("status");
    const userId = c.req.query("userId");
    if (status) query.status = status;
    if (userId) query.userId = userId;
    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(query)
    ]);
    return paginated(c, orders, total, page, limit);
  } catch (err) {
    console.error("Error listing orders:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app5.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await db_default();
    const order = await Order.findById(id).lean();
    if (!order) {
      return error(c, ErrorCodes.NOT_FOUND, "Order not found", 404);
    }
    return success(c, order);
  } catch (err) {
    console.error("Error fetching order:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app5.patch("/:id/status", async (c) => {
  try {
    const id = c.req.param("id");
    const { status } = await c.req.json();
    await db_default();
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!order) {
      return error(c, ErrorCodes.NOT_FOUND, "Order not found", 404);
    }
    return success(c, order);
  } catch (err) {
    console.error("Error updating order status:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app5.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await db_default();
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return error(c, ErrorCodes.NOT_FOUND, "Order not found", 404);
    }
    return success(c, { success: true });
  } catch (err) {
    console.error("Error deleting order:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
var orders_default = app5;

// src/routes/admin/promo-codes.ts
var app6 = new Hono2();
app6.use("*", requireAdmin);
app6.get("/", async (c) => {
  try {
    const { limit, page, skip } = parsePagination(c);
    await db_default();
    const query = {};
    const isActive = c.req.query("isActive");
    if (isActive !== void 0) query.isActive = isActive === "true";
    const [promoCodes, total] = await Promise.all([
      PromoCode.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      PromoCode.countDocuments(query)
    ]);
    return paginated(c, promoCodes, total, page, limit);
  } catch (err) {
    console.error("Error listing promo codes:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app6.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await db_default();
    const promoCode = await PromoCode.findById(id).lean();
    if (!promoCode) {
      return error(c, ErrorCodes.NOT_FOUND, "Promo code not found", 404);
    }
    return success(c, promoCode);
  } catch (err) {
    console.error("Error fetching promo code:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app6.post("/", async (c) => {
  try {
    const body = await c.req.json();
    await db_default();
    const promoCode = await PromoCode.create(body);
    return success(c, promoCode);
  } catch (err) {
    console.error("Error creating promo code:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app6.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    await db_default();
    const promoCode = await PromoCode.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!promoCode) {
      return error(c, ErrorCodes.NOT_FOUND, "Promo code not found", 404);
    }
    return success(c, promoCode);
  } catch (err) {
    console.error("Error updating promo code:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app6.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await db_default();
    const promoCode = await PromoCode.findByIdAndDelete(id);
    if (!promoCode) {
      return error(c, ErrorCodes.NOT_FOUND, "Promo code not found", 404);
    }
    return success(c, { success: true });
  } catch (err) {
    console.error("Error deleting promo code:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
var promo_codes_default = app6;

// src/routes/admin/referral-purchases.ts
var app7 = new Hono2();
app7.get("/", async (c) => {
  try {
    const referredBy = c.req.query("referredBy");
    const limit = parseInt(c.req.query("limit") || "50", 10);
    const page = parseInt(c.req.query("page") || "1", 10);
    const skip = (page - 1) * limit;
    await db_default();
    const query = {};
    if (referredBy) query.referredBy = referredBy;
    const [referralPurchases, total] = await Promise.all([
      ReferralPurchase.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ReferralPurchase.countDocuments(query)
    ]);
    return c.json({
      referralPurchases,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error2) {
    console.error("Error listing referral purchases:", error2);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app7.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await db_default();
    const referralPurchase = await ReferralPurchase.findById(id).lean();
    if (!referralPurchase) {
      return c.json({ error: "ReferralPurchase not found" }, 404);
    }
    return c.json(referralPurchase);
  } catch (error2) {
    console.error("Error fetching referral purchase:", error2);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app7.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await db_default();
    const referralPurchase = await ReferralPurchase.findByIdAndDelete(id);
    if (!referralPurchase) {
      return c.json({ error: "ReferralPurchase not found" }, 404);
    }
    return c.json({ success: true });
  } catch (error2) {
    console.error("Error deleting referral purchase:", error2);
    return c.json({ error: "Internal server error" }, 500);
  }
});
var referral_purchases_default = app7;

// src/routes/admin/users.ts
var app8 = new Hono2();
app8.get("/", async (c) => {
  try {
    const limit = parseInt(c.req.query("limit") || "50", 10);
    const page = parseInt(c.req.query("page") || "1", 10);
    const skip = (page - 1) * limit;
    await db_default();
    const [profiles, total] = await Promise.all([
      Profile.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Profile.countDocuments()
    ]);
    return c.json({
      profiles,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error2) {
    console.error("Error listing profiles:", error2);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app8.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await db_default();
    const profile = await Profile.findById(id).lean();
    if (!profile) {
      return c.json({ error: "Profile not found" }, 404);
    }
    return c.json(profile);
  } catch (error2) {
    console.error("Error fetching profile:", error2);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app8.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    await db_default();
    const profile = await Profile.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!profile) {
      return c.json({ error: "Profile not found" }, 404);
    }
    return c.json(profile);
  } catch (error2) {
    console.error("Error updating profile:", error2);
    return c.json({ error: "Internal server error" }, 500);
  }
});
app8.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await db_default();
    const profile = await Profile.findByIdAndDelete(id);
    if (!profile) {
      return c.json({ error: "Profile not found" }, 404);
    }
    return c.json({ success: true });
  } catch (error2) {
    console.error("Error deleting profile:", error2);
    return c.json({ error: "Internal server error" }, 500);
  }
});
var users_default = app8;

// src/routes/auth.ts
import { render } from "@react-email/render";
import bcrypt2 from "bcryptjs";

// src/email/client.ts
import nodemailer from "nodemailer";
import { Resend } from "resend";

// src/email/config.ts
var emailConfig = {
  // Resend API Configuration
  resend: {
    apiKey: process.env.RESEND_API_KEY
  },
  // Default sender
  from: {
    name: "Luxero",
    email: "noreply@luxero.win"
  },
  // Reply-to address
  replyTo: "support@luxero.win",
  // Email addresses for different purposes
  addresses: {
    support: "support@luxero.win",
    noreply: "noreply@luxero.win",
    legal: "legal@luxero.win",
    privacy: "privacy@luxero.win"
  },
  // Site information for emails
  site: {
    name: "Luxero",
    url: process.env.FRONTEND_URL || "http://localhost:5173",
    logo: "https://luxero.win/logo.png"
  },
  // Social links for email footers
  social: {
    twitter: "https://twitter.com/luxerowin",
    instagram: "https://instagram.com/luxerowin",
    facebook: "https://facebook.com/luxerowin"
  }
};

// src/email/client.ts
var resendClient = null;
var smtpTransporter = null;
function getResendClient() {
  if (!resendClient) {
    if (!emailConfig.resend.apiKey) throw new Error("RESEND_API_KEY is not configured");
    resendClient = new Resend(emailConfig.resend.apiKey);
  }
  return resendClient;
}
function getSmtpTransporter() {
  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "localhost",
      port: parseInt(process.env.SMTP_PORT || "1025", 10),
      secure: false,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : void 0,
      ignoreTLS: true
    });
  }
  return smtpTransporter;
}
function isSmtpEnabled() {
  return process.env.SMTP_ENABLED === "true" || !emailConfig.resend.apiKey;
}
var MAX_RETRIES = 3;
var RETRY_DELAY_BASE = 1e3;
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function sendEmail(options) {
  console.log(`[EMAIL] sendEmail called: to=${String(options.to)}, subject=${options.subject}`);
  const { to, subject, html: html2, text, replyTo, from } = options;
  const fromAddress = from ? `${from.name} <${from.email}>` : `${emailConfig.from.name} <${emailConfig.from.email}>`;
  if (isSmtpEnabled()) {
    try {
      const transporter = getSmtpTransporter();
      const info = await transporter.sendMail({
        from: fromAddress,
        to: Array.isArray(to) ? to.join(", ") : to,
        subject,
        html: html2,
        text: text || html2.replace(/<[^>]*>/g, ""),
        replyTo: replyTo || emailConfig.replyTo
      });
      return { success: true, messageId: info.messageId };
    } catch (error2) {
      const err = error2 instanceof Error ? error2 : new Error(String(error2));
      return { success: false, error: err.message };
    }
  }
  let lastError = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const resend = getResendClient();
      const data = await resend.emails.send({
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: html2,
        text: text || html2.replace(/<[^>]*>/g, ""),
        replyTo: replyTo || emailConfig.replyTo
      });
      if (data?.data?.id) return { success: true, messageId: data.data.id };
      if (data?.error) {
        const errMsg = data.error.message || "Resend API error";
        const errCode = data.error.statusCode || 0;
        if (errCode >= 400 && errCode < 500 && errCode !== 429)
          return { success: false, error: errMsg };
        lastError = new Error(errMsg);
      } else {
        lastError = new Error("Unexpected Resend response");
      }
    } catch (error2) {
      const err = error2 instanceof Error ? error2 : new Error(String(error2));
      if (err.message.includes("RESEND_API_KEY") || err.message.includes("not configured")) {
        return { success: false, error: err.message };
      }
      lastError = err;
    }
    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_DELAY_BASE * 2 ** (attempt - 1));
    }
  }
  return { success: false, error: lastError?.message || "Failed to send email after retries" };
}

// src/email/templates/email-verification.tsx
import { Button, Hr, Link as Link2, Section as Section2, Text as Text2 } from "@react-email/components";

// src/email/templates/base.tsx
import {
  Body,
  Container,
  Font,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text
} from "@react-email/components";

// node_modules/hono/dist/jsx/constants.js
var DOM_RENDERER = /* @__PURE__ */ Symbol("RENDERER");
var DOM_ERROR_HANDLER = /* @__PURE__ */ Symbol("ERROR_HANDLER");
var DOM_INTERNAL_TAG = /* @__PURE__ */ Symbol("INTERNAL");
var PERMALINK = /* @__PURE__ */ Symbol("PERMALINK");

// node_modules/hono/dist/jsx/dom/utils.js
var setInternalTagFlag = (fn) => {
  ;
  fn[DOM_INTERNAL_TAG] = true;
  return fn;
};

// node_modules/hono/dist/jsx/dom/context.js
var createContextProviderFunction = (values) => ({ value, children }) => {
  if (!children) {
    return void 0;
  }
  const props = {
    children: [
      {
        tag: setInternalTagFlag(() => {
          values.push(value);
        }),
        props: {}
      }
    ]
  };
  if (Array.isArray(children)) {
    props.children.push(...children.flat());
  } else {
    props.children.push(children);
  }
  props.children.push({
    tag: setInternalTagFlag(() => {
      values.pop();
    }),
    props: {}
  });
  const res = { tag: "", props, type: "" };
  res[DOM_ERROR_HANDLER] = (err) => {
    values.pop();
    throw err;
  };
  return res;
};

// node_modules/hono/dist/jsx/context.js
var globalContexts = [];
var createContext = (defaultValue) => {
  const values = [defaultValue];
  const context = ((props) => {
    values.push(props.value);
    let string;
    try {
      string = props.children ? (Array.isArray(props.children) ? new JSXFragmentNode("", {}, props.children) : props.children).toString() : "";
    } catch (e) {
      values.pop();
      throw e;
    }
    if (string instanceof Promise) {
      return string.finally(() => values.pop()).then((resString) => raw(resString, resString.callbacks));
    } else {
      values.pop();
      return raw(string);
    }
  });
  context.values = values;
  context.Provider = context;
  context[DOM_RENDERER] = createContextProviderFunction(values);
  globalContexts.push(context);
  return context;
};
var useContext = (context) => {
  return context.values.at(-1);
};

// node_modules/hono/dist/jsx/intrinsic-element/common.js
var deDupeKeyMap = {
  title: [],
  script: ["src"],
  style: ["data-href"],
  link: ["href"],
  meta: ["name", "httpEquiv", "charset", "itemProp"]
};
var domRenderers = {};
var dataPrecedenceAttr = "data-precedence";
var isStylesheetLinkWithPrecedence = (props) => props.rel === "stylesheet" && "precedence" in props;
var shouldDeDupeByKey = (tagName, supportSort) => {
  if (tagName === "link") {
    return supportSort;
  }
  return deDupeKeyMap[tagName].length > 0;
};

// node_modules/hono/dist/jsx/intrinsic-element/components.js
var components_exports = {};
__export(components_exports, {
  button: () => button,
  form: () => form,
  input: () => input,
  link: () => link,
  meta: () => meta,
  script: () => script,
  style: () => style,
  title: () => title
});

// node_modules/hono/dist/jsx/children.js
var toArray = (children) => Array.isArray(children) ? children : [children];

// node_modules/hono/dist/jsx/intrinsic-element/components.js
var metaTagMap = /* @__PURE__ */ new WeakMap();
var insertIntoHead = (tagName, tag, props, precedence) => ({ buffer, context }) => {
  if (!buffer) {
    return;
  }
  const map = metaTagMap.get(context) || {};
  metaTagMap.set(context, map);
  const tags = map[tagName] ||= [];
  let duped = false;
  const deDupeKeys = deDupeKeyMap[tagName];
  const deDupeByKey = shouldDeDupeByKey(tagName, precedence !== void 0);
  if (deDupeByKey) {
    LOOP: for (const [, tagProps] of tags) {
      if (tagName === "link" && !(tagProps.rel === "stylesheet" && tagProps[dataPrecedenceAttr] !== void 0)) {
        continue;
      }
      for (const key of deDupeKeys) {
        if ((tagProps?.[key] ?? null) === props?.[key]) {
          duped = true;
          break LOOP;
        }
      }
    }
  }
  if (duped) {
    buffer[0] = buffer[0].replaceAll(tag, "");
  } else if (deDupeByKey || tagName === "link") {
    tags.push([tag, props, precedence]);
  } else {
    tags.unshift([tag, props, precedence]);
  }
  if (buffer[0].indexOf("</head>") !== -1) {
    let insertTags;
    if (tagName === "link" || precedence !== void 0) {
      const precedences = [];
      insertTags = tags.map(([tag2, , tagPrecedence], index) => {
        if (tagPrecedence === void 0) {
          return [tag2, Number.MAX_SAFE_INTEGER, index];
        }
        let order = precedences.indexOf(tagPrecedence);
        if (order === -1) {
          precedences.push(tagPrecedence);
          order = precedences.length - 1;
        }
        return [tag2, order, index];
      }).sort((a, b) => a[1] - b[1] || a[2] - b[2]).map(([tag2]) => tag2);
    } else {
      insertTags = tags.map(([tag2]) => tag2);
    }
    insertTags.forEach((tag2) => {
      buffer[0] = buffer[0].replaceAll(tag2, "");
    });
    buffer[0] = buffer[0].replace(/(?=<\/head>)/, insertTags.join(""));
  }
};
var returnWithoutSpecialBehavior = (tag, children, props) => raw(new JSXNode(tag, props, toArray(children ?? [])).toString());
var documentMetadataTag = (tag, children, props, sort) => {
  if ("itemProp" in props) {
    return returnWithoutSpecialBehavior(tag, children, props);
  }
  let { precedence, blocking, ...restProps } = props;
  precedence = sort ? precedence ?? "" : void 0;
  if (sort) {
    restProps[dataPrecedenceAttr] = precedence;
  }
  const string = new JSXNode(tag, restProps, toArray(children || [])).toString();
  if (string instanceof Promise) {
    return string.then(
      (resString) => raw(string, [
        ...resString.callbacks || [],
        insertIntoHead(tag, resString, restProps, precedence)
      ])
    );
  } else {
    return raw(string, [insertIntoHead(tag, string, restProps, precedence)]);
  }
};
var title = ({ children, ...props }) => {
  const nameSpaceContext2 = getNameSpaceContext();
  if (nameSpaceContext2) {
    const context = useContext(nameSpaceContext2);
    if (context === "svg" || context === "head") {
      return new JSXNode(
        "title",
        props,
        toArray(children ?? [])
      );
    }
  }
  return documentMetadataTag("title", children, props, false);
};
var script = ({
  children,
  ...props
}) => {
  const nameSpaceContext2 = getNameSpaceContext();
  if (["src", "async"].some((k) => !props[k]) || nameSpaceContext2 && useContext(nameSpaceContext2) === "head") {
    return returnWithoutSpecialBehavior("script", children, props);
  }
  return documentMetadataTag("script", children, props, false);
};
var style = ({
  children,
  ...props
}) => {
  if (!["href", "precedence"].every((k) => k in props)) {
    return returnWithoutSpecialBehavior("style", children, props);
  }
  props["data-href"] = props.href;
  delete props.href;
  return documentMetadataTag("style", children, props, true);
};
var link = ({ children, ...props }) => {
  if (["onLoad", "onError"].some((k) => k in props) || props.rel === "stylesheet" && (!("precedence" in props) || "disabled" in props)) {
    return returnWithoutSpecialBehavior("link", children, props);
  }
  return documentMetadataTag("link", children, props, isStylesheetLinkWithPrecedence(props));
};
var meta = ({ children, ...props }) => {
  const nameSpaceContext2 = getNameSpaceContext();
  if (nameSpaceContext2 && useContext(nameSpaceContext2) === "head") {
    return returnWithoutSpecialBehavior("meta", children, props);
  }
  return documentMetadataTag("meta", children, props, false);
};
var newJSXNode = (tag, { children, ...props }) => (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new JSXNode(tag, props, toArray(children ?? []))
);
var form = (props) => {
  if (typeof props.action === "function") {
    props.action = PERMALINK in props.action ? props.action[PERMALINK] : void 0;
  }
  return newJSXNode("form", props);
};
var formActionableElement = (tag, props) => {
  if (typeof props.formAction === "function") {
    props.formAction = PERMALINK in props.formAction ? props.formAction[PERMALINK] : void 0;
  }
  return newJSXNode(tag, props);
};
var input = (props) => formActionableElement("input", props);
var button = (props) => formActionableElement("button", props);

// node_modules/hono/dist/jsx/utils.js
var normalizeElementKeyMap = /* @__PURE__ */ new Map([
  ["className", "class"],
  ["htmlFor", "for"],
  ["crossOrigin", "crossorigin"],
  ["httpEquiv", "http-equiv"],
  ["itemProp", "itemprop"],
  ["fetchPriority", "fetchpriority"],
  ["noModule", "nomodule"],
  ["formAction", "formaction"]
]);
var normalizeIntrinsicElementKey = (key) => normalizeElementKeyMap.get(key) || key;
var invalidAttributeNameCharRe = /[\s"'<>/=`\\\x00-\x1f\x7f-\x9f]/;
var isValidAttributeName = (name) => {
  const len = name.length;
  if (len === 0) {
    return false;
  }
  for (let i = 0; i < len; i++) {
    const c = name.charCodeAt(i);
    if (!(c >= 97 && c <= 122 || // a-z
    c >= 65 && c <= 90 || // A-Z
    c >= 48 && c <= 57 || // 0-9
    c === 45 || // -
    c === 95 || // _
    c === 46 || // .
    c === 58)) {
      return !invalidAttributeNameCharRe.test(name);
    }
  }
  return true;
};
var styleObjectForEach = (style2, fn) => {
  for (const [k, v] of Object.entries(style2)) {
    const key = k[0] === "-" || !/[A-Z]/.test(k) ? k : k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
    fn(
      key,
      v == null ? null : typeof v === "number" ? !key.match(
        /^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/
      ) ? `${v}px` : `${v}` : v
    );
  }
};

// node_modules/hono/dist/jsx/base.js
var nameSpaceContext = void 0;
var getNameSpaceContext = () => nameSpaceContext;
var toSVGAttributeName = (key) => /[A-Z]/.test(key) && // Presentation attributes are findable in style object. "clip-path", "font-size", "stroke-width", etc.
// Or other un-deprecated kebab-case attributes. "overline-position", "paint-order", "strikethrough-position", etc.
key.match(
  /^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/
) ? key.replace(/([A-Z])/g, "-$1").toLowerCase() : key;
var emptyTags = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
];
var booleanAttributes = [
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "download",
  "formnovalidate",
  "hidden",
  "inert",
  "ismap",
  "itemscope",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected"
];
var childrenToStringToBuffer = (children, buffer) => {
  for (let i = 0, len = children.length; i < len; i++) {
    const child = children[i];
    if (typeof child === "string") {
      escapeToBuffer(child, buffer);
    } else if (typeof child === "boolean" || child === null || child === void 0) {
      continue;
    } else if (child instanceof JSXNode) {
      child.toStringToBuffer(buffer);
    } else if (typeof child === "number" || child.isEscaped) {
      ;
      buffer[0] += child;
    } else if (child instanceof Promise) {
      buffer.unshift("", child);
    } else {
      childrenToStringToBuffer(child, buffer);
    }
  }
};
var JSXNode = class {
  tag;
  props;
  key;
  children;
  isEscaped = true;
  localContexts;
  constructor(tag, props, children) {
    this.tag = tag;
    this.props = props;
    this.children = children;
  }
  get type() {
    return this.tag;
  }
  // Added for compatibility with libraries that rely on React's internal structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get ref() {
    return this.props.ref || null;
  }
  toString() {
    const buffer = [""];
    this.localContexts?.forEach(([context, value]) => {
      context.values.push(value);
    });
    try {
      this.toStringToBuffer(buffer);
    } finally {
      this.localContexts?.forEach(([context]) => {
        context.values.pop();
      });
    }
    return buffer.length === 1 ? "callbacks" in buffer ? resolveCallbackSync(raw(buffer[0], buffer.callbacks)).toString() : buffer[0] : stringBufferToString(buffer, buffer.callbacks);
  }
  toStringToBuffer(buffer) {
    const tag = this.tag;
    const props = this.props;
    let { children } = this;
    buffer[0] += `<${tag}`;
    const normalizeKey = nameSpaceContext && useContext(nameSpaceContext) === "svg" ? (key) => toSVGAttributeName(normalizeIntrinsicElementKey(key)) : (key) => normalizeIntrinsicElementKey(key);
    for (let [key, v] of Object.entries(props)) {
      key = normalizeKey(key);
      if (!isValidAttributeName(key)) {
        continue;
      }
      if (key === "children") {
      } else if (key === "style" && typeof v === "object") {
        let styleStr = "";
        styleObjectForEach(v, (property, value) => {
          if (value != null) {
            styleStr += `${styleStr ? ";" : ""}${property}:${value}`;
          }
        });
        buffer[0] += ' style="';
        escapeToBuffer(styleStr, buffer);
        buffer[0] += '"';
      } else if (typeof v === "string") {
        buffer[0] += ` ${key}="`;
        escapeToBuffer(v, buffer);
        buffer[0] += '"';
      } else if (v === null || v === void 0) {
      } else if (typeof v === "number" || v.isEscaped) {
        buffer[0] += ` ${key}="${v}"`;
      } else if (typeof v === "boolean" && booleanAttributes.includes(key)) {
        if (v) {
          buffer[0] += ` ${key}=""`;
        }
      } else if (key === "dangerouslySetInnerHTML") {
        if (children.length > 0) {
          throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
        }
        children = [raw(v.__html)];
      } else if (v instanceof Promise) {
        buffer[0] += ` ${key}="`;
        buffer.unshift('"', v);
      } else if (typeof v === "function") {
        if (!key.startsWith("on") && key !== "ref") {
          throw new Error(`Invalid prop '${key}' of type 'function' supplied to '${tag}'.`);
        }
      } else {
        buffer[0] += ` ${key}="`;
        escapeToBuffer(v.toString(), buffer);
        buffer[0] += '"';
      }
    }
    if (emptyTags.includes(tag) && children.length === 0) {
      buffer[0] += "/>";
      return;
    }
    buffer[0] += ">";
    childrenToStringToBuffer(children, buffer);
    buffer[0] += `</${tag}>`;
  }
};
var JSXFunctionNode = class extends JSXNode {
  toStringToBuffer(buffer) {
    const { children } = this;
    const props = { ...this.props };
    if (children.length) {
      props.children = children.length === 1 ? children[0] : children;
    }
    const res = this.tag.call(null, props);
    if (typeof res === "boolean" || res == null) {
      return;
    } else if (res instanceof Promise) {
      if (globalContexts.length === 0) {
        buffer.unshift("", res);
      } else {
        const currentContexts = globalContexts.map((c) => [c, c.values.at(-1)]);
        buffer.unshift(
          "",
          res.then((childRes) => {
            if (childRes instanceof JSXNode) {
              childRes.localContexts = currentContexts;
            }
            return childRes;
          })
        );
      }
    } else if (res instanceof JSXNode) {
      res.toStringToBuffer(buffer);
    } else if (typeof res === "number" || res.isEscaped) {
      buffer[0] += res;
      if (res.callbacks) {
        buffer.callbacks ||= [];
        buffer.callbacks.push(...res.callbacks);
      }
    } else {
      escapeToBuffer(res, buffer);
    }
  }
};
var JSXFragmentNode = class extends JSXNode {
  toStringToBuffer(buffer) {
    childrenToStringToBuffer(this.children, buffer);
  }
};
var initDomRenderer = false;
var jsxFn = (tag, props, children) => {
  if (!initDomRenderer) {
    for (const k in domRenderers) {
      ;
      components_exports[k][DOM_RENDERER] = domRenderers[k];
    }
    initDomRenderer = true;
  }
  if (typeof tag === "function") {
    return new JSXFunctionNode(tag, props, children);
  } else if (components_exports[tag]) {
    return new JSXFunctionNode(
      components_exports[tag],
      props,
      children
    );
  } else if (tag === "svg" || tag === "head") {
    nameSpaceContext ||= createContext("");
    return new JSXNode(tag, props, [
      new JSXFunctionNode(
        nameSpaceContext,
        {
          value: tag
        },
        children
      )
    ]);
  } else {
    return new JSXNode(tag, props, children);
  }
};

// node_modules/hono/dist/jsx/jsx-dev-runtime.js
function jsxDEV(tag, props, key) {
  let node;
  if (!props || !("children" in props)) {
    node = jsxFn(tag, props, []);
  } else {
    const children = props.children;
    node = Array.isArray(children) ? jsxFn(tag, props, children) : jsxFn(tag, props, [children]);
  }
  node.key = key;
  return node;
}

// src/email/templates/base.tsx
function BaseEmail({ preview, children }) {
  return /* @__PURE__ */ jsxDEV(
    Tailwind,
    {
      config: {
        theme: {
          extend: {
            colors: {
              gold: "#D4AF37",
              background: "#0A0A0B",
              card: "#1A1A1D",
              foreground: "#FFFFFF",
              muted: "#A1A1AA",
              border: "#27272A",
              danger: "#EF4444"
            },
            fontFamily: { sans: ["Plus Jakarta Sans", "Arial", "sans-serif"] }
          }
        }
      },
      children: /* @__PURE__ */ jsxDEV(Html, { children: [
        /* @__PURE__ */ jsxDEV(Head, { children: [
          /* @__PURE__ */ jsxDEV(
            Font,
            {
              fontFamily: "Plus Jakarta Sans",
              fallbackFontFamily: "Arial",
              webFont: {
                url: "https://fonts.gstatic.com/s/plusjakartasans/v8/IJ9aO5Lnw3FPMv7nI5H1U.woff2",
                format: "woff2"
              },
              fontWeight: 400,
              fontStyle: "normal"
            }
          ),
          /* @__PURE__ */ jsxDEV(
            Font,
            {
              fontFamily: "Plus Jakarta Sans",
              fallbackFontFamily: "Arial",
              webFont: {
                url: "https://fonts.gstatic.com/s/plusjakartasans/v8/IJ9aO5Lnw3FPMv7nI5H1U.woff2",
                format: "woff2"
              },
              fontWeight: 600,
              fontStyle: "normal"
            }
          )
        ] }),
        /* @__PURE__ */ jsxDEV(Preview, { children: preview }),
        /* @__PURE__ */ jsxDEV(
          Body,
          {
            className: "mx-auto my-auto px-[8px]",
            style: { backgroundColor: "#0A0A0B", fontFamily: "Plus Jakarta Sans, Arial, sans-serif" },
            children: /* @__PURE__ */ jsxDEV(Container, { className: "mx-auto my-[40px] max-w-[600px]", children: [
              /* @__PURE__ */ jsxDEV(Section, { className: "p-[32px] text-center", children: /* @__PURE__ */ jsxDEV(Link, { href: emailConfig.site.url, children: /* @__PURE__ */ jsxDEV(Text, { className: "m-0 text-[32px] font-bold text-[#D4AF37] no-underline", children: "Luxero" }) }) }),
              /* @__PURE__ */ jsxDEV(
                Section,
                {
                  className: "mx-[24px] my-0 rounded-[12px] border border-solid bg-[#1A1A1D] p-[32px]",
                  style: {
                    borderColor: "#27272A",
                    borderRadius: "12px",
                    backgroundColor: "#1A1A1D",
                    padding: "32px"
                  },
                  children
                }
              ),
              /* @__PURE__ */ jsxDEV(Section, { className: "p-[32px] text-center", children: [
                /* @__PURE__ */ jsxDEV(Text, { className: "m-[8px] text-center text-[12px] leading-[20px] text-[#A1A1AA]", children: [
                  "This email was sent by Luxero.win",
                  /* @__PURE__ */ jsxDEV("br", {}),
                  "Premium Prize Competitions"
                ] }),
                /* @__PURE__ */ jsxDEV(Text, { className: "m-[16px] text-center text-[12px] text-[#A1A1AA]", children: [
                  /* @__PURE__ */ jsxDEV(Link, { href: emailConfig.social.twitter, className: "text-[#D4AF37] no-underline", children: "Twitter" }),
                  " ",
                  "|",
                  " ",
                  /* @__PURE__ */ jsxDEV(Link, { href: emailConfig.social.instagram, className: "text-[#D4AF37] no-underline", children: "Instagram" }),
                  " ",
                  "|",
                  " ",
                  /* @__PURE__ */ jsxDEV(Link, { href: emailConfig.social.facebook, className: "text-[#D4AF37] no-underline", children: "Facebook" })
                ] }),
                /* @__PURE__ */ jsxDEV(Text, { className: "m-[8px] text-center text-[12px] text-[#A1A1AA]", children: [
                  /* @__PURE__ */ jsxDEV(Link, { href: `${emailConfig.site.url}/privacy`, className: "text-[#A1A1AA] underline", children: "Privacy Policy" }),
                  " ",
                  "|",
                  " ",
                  /* @__PURE__ */ jsxDEV(Link, { href: `${emailConfig.site.url}/terms`, className: "text-[#A1A1AA] underline", children: "Terms of Service" }),
                  " ",
                  "|",
                  " ",
                  /* @__PURE__ */ jsxDEV(Link, { href: `${emailConfig.site.url}/contact`, className: "text-[#A1AA] underline", children: "Contact Us" })
                ] }),
                /* @__PURE__ */ jsxDEV(Text, { className: "m-[24px] text-center text-[11px] text-[#A1A1AA]", children: [
                  "\xA9 ",
                  (/* @__PURE__ */ new Date()).getFullYear(),
                  " Luxero. All rights reserved."
                ] })
              ] })
            ] })
          }
        )
      ] })
    }
  );
}
var emailStyles = {
  heading: { className: "text-[24px] font-semibold text-center text-[#FFFFFF] mb-[16px]" },
  subheading: { className: "text-[20px] font-semibold text-[#FFFFFF] mb-[16px]" },
  paragraph: { className: "text-[15px] leading-[24px] text-[#FFFFFF] mb-[16px]" },
  button: {
    className: "bg-[#D4AF37] rounded-[6px] text-[#0A0A0B] font-semibold px-[24px] py-[12px] no-underline inline-block text-center"
  },
  divider: { className: "mx-0 my-[24px] w-full border border-solid" },
  muted: { className: "text-[12px] leading-[20px] text-[#A1A1AA]" }
};

// src/email/templates/email-verification.tsx
function EmailVerificationEmail({ userName, code, verificationUrl }) {
  return /* @__PURE__ */ jsxDEV(BaseEmail, { preview: `Verify your email \u2014 code: ${code}`, children: [
    /* @__PURE__ */ jsxDEV(Text2, { className: emailStyles.heading.className, children: "Verify Your Email" }),
    /* @__PURE__ */ jsxDEV(Text2, { className: emailStyles.paragraph.className, children: [
      "Hi ",
      userName,
      ","
    ] }),
    /* @__PURE__ */ jsxDEV(Text2, { className: emailStyles.paragraph.className, children: "Welcome to Luxero! To complete your registration and start winning incredible prizes, please verify your email address using the code below." }),
    /* @__PURE__ */ jsxDEV(Section2, { className: "my-[32px] text-center", children: [
      /* @__PURE__ */ jsxDEV(
        Text2,
        {
          className: "m-0 mb-[8px] text-[36px] font-semibold tracking-[0.2em] text-[#D4AF37]",
          style: { fontFamily: "ui-monospace, monospace" },
          children: code
        }
      ),
      /* @__PURE__ */ jsxDEV(Text2, { className: emailStyles.muted.className, children: "Enter this code to verify your email" })
    ] }),
    /* @__PURE__ */ jsxDEV(Section2, { className: "my-[24px] text-center", children: /* @__PURE__ */ jsxDEV(Button, { href: verificationUrl, className: emailStyles.button.className, children: "Verify Email Address" }) }),
    /* @__PURE__ */ jsxDEV(Text2, { className: emailStyles.muted.className, children: [
      "If the button above doesn't work, copy and paste this URL into your browser:",
      /* @__PURE__ */ jsxDEV("br", {}),
      /* @__PURE__ */ jsxDEV(Link2, { href: verificationUrl, className: "break-all text-[#D4AF37] no-underline", children: verificationUrl })
    ] }),
    /* @__PURE__ */ jsxDEV(Hr, { className: emailStyles.divider.className }),
    /* @__PURE__ */ jsxDEV(
      Section2,
      {
        className: "my-[16px] rounded-[8px] border-l-4 border-[#D4AF37] bg-[#0A0A0B] px-[20px] py-[16px]",
        style: {
          borderLeftWidth: "4px",
          borderLeftStyle: "solid",
          backgroundColor: "rgba(212, 175, 55, 0.1)"
        },
        children: /* @__PURE__ */ jsxDEV(Text2, { className: "m-0 text-[14px] leading-[22px] text-[#A1A1AA]", children: [
          /* @__PURE__ */ jsxDEV("strong", { className: "text-[#D4AF37]", children: "Security Notice:" }),
          " This verification code expires in 24 hours. If you didn't create an account with Luxero, please ignore this email \u2014 your email will not be used."
        ] })
      }
    ),
    /* @__PURE__ */ jsxDEV(Hr, { className: emailStyles.divider.className }),
    /* @__PURE__ */ jsxDEV(Text2, { className: "mb-[16px] text-[17px] font-semibold text-[#FFFFFF]", children: "What's Next?" }),
    /* @__PURE__ */ jsxDEV(Text2, { className: emailStyles.paragraph.className, children: [
      /* @__PURE__ */ jsxDEV("span", { className: "font-semibold text-[#D4AF37]", children: "1. Browse Competitions" }),
      /* @__PURE__ */ jsxDEV("br", {}),
      "Explore luxury prizes from tech to dream experiences."
    ] }),
    /* @__PURE__ */ jsxDEV(Text2, { className: emailStyles.paragraph.className, children: [
      /* @__PURE__ */ jsxDEV("span", { className: "font-semibold text-[#D4AF37]", children: "2. Get Your Tickets" }),
      /* @__PURE__ */ jsxDEV("br", {}),
      "Answer a skill question and secure your entries."
    ] }),
    /* @__PURE__ */ jsxDEV(Text2, { className: emailStyles.paragraph.className, children: [
      /* @__PURE__ */ jsxDEV("span", { className: "font-semibold text-[#D4AF37]", children: "3. Win Big" }),
      /* @__PURE__ */ jsxDEV("br", {}),
      "Live draws, instant notifications, insured delivery."
    ] }),
    /* @__PURE__ */ jsxDEV(Section2, { className: "my-[24px] text-center", children: /* @__PURE__ */ jsxDEV(
      Button,
      {
        href: `${emailConfig.site.url}/competitions`,
        className: emailStyles.button.className,
        children: "Start Browsing Competitions"
      }
    ) }),
    /* @__PURE__ */ jsxDEV(Text2, { className: emailStyles.paragraph.className, children: [
      "Good luck!",
      /* @__PURE__ */ jsxDEV("br", {}),
      "The Luxero Team"
    ] })
  ] });
}

// src/email/templates/password-reset.tsx
import { Button as Button2, Hr as Hr2, Link as Link3, Section as Section3, Text as Text3 } from "@react-email/components";
function PasswordResetEmail({ userName, code, resetUrl }) {
  return /* @__PURE__ */ jsxDEV(BaseEmail, { preview: `Password reset requested \u2014 code: ${code}`, children: [
    /* @__PURE__ */ jsxDEV(
      Section3,
      {
        className: "mb-[24px] rounded-[8px] border-l-4 border-[#EF4444] px-[20px] py-[16px]",
        style: {
          borderLeftWidth: "4px",
          borderLeftStyle: "solid",
          backgroundColor: "rgba(239, 68, 68, 0.1)"
        },
        children: /* @__PURE__ */ jsxDEV(Text3, { className: "m-0 text-[14px] leading-[22px] text-[#A1A1AA]", children: [
          /* @__PURE__ */ jsxDEV("strong", { className: "text-[#EF4444]", children: "Security Alert:" }),
          " If you did not request a password reset, please ignore this email. Your password will remain unchanged."
        ] })
      }
    ),
    /* @__PURE__ */ jsxDEV(Text3, { className: emailStyles.heading.className, children: "Reset Your Password" }),
    /* @__PURE__ */ jsxDEV(Text3, { className: emailStyles.paragraph.className, children: [
      "Hi ",
      userName,
      ","
    ] }),
    /* @__PURE__ */ jsxDEV(Text3, { className: emailStyles.paragraph.className, children: "We received a request to reset your Luxero account password. Use the code below to set a new password." }),
    /* @__PURE__ */ jsxDEV(Section3, { className: "my-[32px] text-center", children: [
      /* @__PURE__ */ jsxDEV(
        Text3,
        {
          className: "m-0 mb-[8px] text-[36px] font-semibold tracking-[0.2em] text-[#D4AF37]",
          style: { fontFamily: "ui-monospace, monospace" },
          children: code
        }
      ),
      /* @__PURE__ */ jsxDEV(Text3, { className: emailStyles.muted.className, children: "Enter this code to reset your password" })
    ] }),
    /* @__PURE__ */ jsxDEV(Section3, { className: "my-[24px] text-center", children: /* @__PURE__ */ jsxDEV(Button2, { href: resetUrl, className: emailStyles.button.className, children: "Reset Password" }) }),
    /* @__PURE__ */ jsxDEV(Text3, { className: emailStyles.muted.className, children: [
      "If the button above doesn't work, copy and paste this URL into your browser:",
      /* @__PURE__ */ jsxDEV("br", {}),
      /* @__PURE__ */ jsxDEV(Link3, { href: resetUrl, className: "break-all text-[#D4AF37] no-underline", children: resetUrl })
    ] }),
    /* @__PURE__ */ jsxDEV(Hr2, { className: emailStyles.divider.className }),
    /* @__PURE__ */ jsxDEV(
      Section3,
      {
        className: "my-[16px] rounded-[8px] border-l-4 border-[#D4AF37] px-[20px] py-[16px]",
        style: {
          borderLeftWidth: "4px",
          borderLeftStyle: "solid",
          backgroundColor: "rgba(212, 175, 55, 0.1)"
        },
        children: /* @__PURE__ */ jsxDEV(Text3, { className: "m-0 text-[14px] leading-[22px] text-[#A1A1AA]", children: [
          /* @__PURE__ */ jsxDEV("strong", { className: "text-[#D4AF37]", children: "Time-Sensitive:" }),
          " This reset code expires in 1 hour. After that, you'll need to request a new one."
        ] })
      }
    ),
    /* @__PURE__ */ jsxDEV(Hr2, { className: emailStyles.divider.className }),
    /* @__PURE__ */ jsxDEV(Text3, { className: "mb-[16px] text-[17px] font-semibold text-[#FFFFFF]", children: "Security Tips" }),
    /* @__PURE__ */ jsxDEV(Text3, { className: emailStyles.paragraph.className, children: [
      /* @__PURE__ */ jsxDEV("span", { className: "font-semibold text-[#D4AF37]", children: "Use a strong password" }),
      /* @__PURE__ */ jsxDEV("br", {}),
      "At least 8 characters with a mix of letters, numbers, and symbols."
    ] }),
    /* @__PURE__ */ jsxDEV(Text3, { className: emailStyles.paragraph.className, children: [
      /* @__PURE__ */ jsxDEV("span", { className: "font-semibold text-[#D4AF37]", children: "Don't reuse passwords" }),
      /* @__PURE__ */ jsxDEV("br", {}),
      "Use a unique password for your Luxero account."
    ] }),
    /* @__PURE__ */ jsxDEV(Text3, { className: emailStyles.muted.className, children: [
      "Need help? Contact our support team at",
      " ",
      /* @__PURE__ */ jsxDEV(
        Link3,
        {
          href: `mailto:${emailConfig.addresses.support}`,
          className: "text-[#D4AF37] no-underline",
          children: emailConfig.addresses.support
        }
      )
    ] }),
    /* @__PURE__ */ jsxDEV(Text3, { className: emailStyles.paragraph.className, children: [
      "Stay secure,",
      /* @__PURE__ */ jsxDEV("br", {}),
      "The Luxero Team"
    ] })
  ] });
}

// src/routes/auth.ts
var app9 = new Hono2();
app9.post("/register", async (c) => {
  try {
    const { email, password, fullName } = await c.req.json();
    if (!email || !password) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "Email and password are required", 400);
    }
    if (password.length < 8) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "Password must be at least 8 characters", 400);
    }
    await db_default();
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return error(c, ErrorCodes.CONFLICT, "An account with this email already exists", 409);
    }
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash: password,
      isVerified: false
    });
    await Profile.create({
      _id: user._id,
      email: email.toLowerCase(),
      fullName: fullName || void 0,
      country: "GB"
    });
    const code = Math.floor(1e5 + Math.random() * 9e5).toString();
    await user.setVerificationCode(code);
    const userName = fullName || email.split("@")[0];
    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/verify-email?email=${encodeURIComponent(email)}&code=${code}`;
    try {
      const emailHtml = await render(EmailVerificationEmail({ userName, code, verificationUrl }));
      await sendEmail({
        to: email.toLowerCase(),
        subject: "Verify your email \u2014 Luxero",
        html: emailHtml
      });
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr);
    }
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin
    });
    return success(c, {
      token,
      user: { id: user._id, email: user.email, isAdmin: user.isAdmin, isVerified: user.isVerified }
    });
  } catch (err) {
    console.error("Register error:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app9.post("/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "Email and password are required", 400);
    }
    await db_default();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return error(c, ErrorCodes.UNAUTHORIZED, "Invalid email or password", 401);
    }
    const valid = await user.comparePassword(password);
    if (!valid) {
      return error(c, ErrorCodes.UNAUTHORIZED, "Invalid email or password", 401);
    }
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin
    });
    return success(c, {
      token,
      user: { id: user._id, email: user.email, isAdmin: user.isAdmin, isVerified: user.isVerified }
    });
  } catch (err) {
    console.error("Login error:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app9.post("/verify-email", async (c) => {
  try {
    const { email, code } = await c.req.json();
    if (!email || !code) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "Email and code are required", 400);
    }
    await db_default();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return error(c, ErrorCodes.NOT_FOUND, "User not found", 404);
    }
    if (user.isVerified) {
      return success(c, { message: "Email already verified" });
    }
    if (!user.verificationCode || !user.verificationExpiry) {
      return error(
        c,
        ErrorCodes.VALIDATION_ERROR,
        "No verification code found. Please request a new one.",
        400
      );
    }
    if (/* @__PURE__ */ new Date() > user.verificationExpiry) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "Verification code has expired", 400);
    }
    const valid = await bcrypt2.compare(code, user.verificationCode);
    if (!valid) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "Invalid verification code", 400);
    }
    user.isVerified = true;
    user.clearVerificationCode();
    await user.save();
    return success(c, { message: "Email verified successfully" });
  } catch (err) {
    console.error("Verify email error:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app9.post("/resend-verification", async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "Email is required", 400);
    }
    await db_default();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return success(c, { message: "If an account exists, a new verification code has been sent" });
    }
    if (user.isVerified) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "Email is already verified", 400);
    }
    const code = Math.floor(1e5 + Math.random() * 9e5).toString();
    await user.setVerificationCode(code);
    let userName = email.split("@")[0];
    try {
      const profile = await Profile.findById(user._id).lean();
      if (profile?.fullName) userName = profile.fullName;
    } catch {
    }
    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/verify-email?email=${encodeURIComponent(email)}&code=${code}`;
    try {
      const emailHtml = await render(EmailVerificationEmail({ userName, code, verificationUrl }));
      await sendEmail({
        to: email.toLowerCase(),
        subject: "Resend: Verify your email \u2014 Luxero",
        html: emailHtml
      });
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr);
    }
    return success(c, { message: "If an account exists, a new verification code has been sent" });
  } catch (err) {
    console.error("Resend verification error:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app9.post("/forgot-password", async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "Email is required", 400);
    }
    await db_default();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return success(c, { message: "If an account exists, a reset email has been sent" });
    }
    const code = Math.floor(1e5 + Math.random() * 9e5).toString();
    await user.setResetCode(code);
    await user.save();
    let userName = email.split("@")[0];
    try {
      const profile = await Profile.findById(user._id).lean();
      if (profile?.fullName) userName = profile.fullName;
    } catch {
    }
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/auth/reset-password?email=${encodeURIComponent(email)}&code=${code}`;
    try {
      const emailHtml = await render(PasswordResetEmail({ userName, code, resetUrl }));
      await sendEmail({
        to: email.toLowerCase(),
        subject: "Reset your password \u2014 Luxero",
        html: emailHtml
      });
    } catch (emailErr) {
      console.error("Failed to send password reset email:", emailErr);
    }
    return success(c, { message: "If an account exists, a reset email has been sent" });
  } catch (err) {
    console.error("Forgot password error:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app9.post("/reset-password", async (c) => {
  try {
    const { email, code, newPassword } = await c.req.json();
    if (!email || !code || !newPassword) {
      return error(
        c,
        ErrorCodes.VALIDATION_ERROR,
        "Email, code, and newPassword are required",
        400
      );
    }
    if (newPassword.length < 8) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "Password must be at least 8 characters", 400);
    }
    await db_default();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return error(c, ErrorCodes.NOT_FOUND, "User not found", 404);
    }
    if (!user.resetCode || !user.resetExpiry) {
      return error(
        c,
        ErrorCodes.VALIDATION_ERROR,
        "No reset code found. Please request a new one.",
        400
      );
    }
    if (/* @__PURE__ */ new Date() > user.resetExpiry) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "Reset code has expired", 400);
    }
    const valid = await bcrypt2.compare(code, user.resetCode);
    if (!valid) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "Invalid reset code", 400);
    }
    user.passwordHash = newPassword;
    user.clearResetCode();
    await user.save();
    return success(c, { message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app9.get("/me", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return error(c, ErrorCodes.UNAUTHORIZED, "Authentication required", 401);
    }
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (!payload) {
      return error(c, ErrorCodes.UNAUTHORIZED, "Invalid or expired token", 401);
    }
    await db_default();
    const user = await User.findById(payload.userId).lean();
    if (!user) {
      return error(c, ErrorCodes.NOT_FOUND, "User not found", 404);
    }
    return success(c, {
      id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified
    });
  } catch (err) {
    console.error("Get me error:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
var auth_default = app9;

// src/routes/categories.ts
var app10 = new Hono2();
app10.get("/", async (c) => {
  try {
    await db_default();
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 }).lean();
    return success(c, categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
var categories_default2 = app10;

// src/routes/competitions.ts
var app11 = new Hono2();
app11.get("/", async (c) => {
  try {
    const { limit, page, skip } = parsePagination(c);
    await db_default();
    const query = {};
    const status = c.req.query("status");
    if (status) {
      query.status = status;
    } else {
      query.status = "active";
    }
    const category = c.req.query("category");
    if (category) query.category = category;
    const exclude = c.req.query("exclude");
    if (exclude) query._id = { $ne: exclude };
    const [competitions, total] = await Promise.all([
      Competition.find(query).sort({ displayOrder: 1, drawDate: 1 }).skip(skip).limit(limit).lean(),
      Competition.countDocuments(query)
    ]);
    return paginated(c, competitions, total, page, limit);
  } catch (err) {
    console.error("Error fetching competitions:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app11.get("/featured", async (c) => {
  try {
    await db_default();
    const competitions = await Competition.find({
      status: "active",
      isFeatured: true
    }).sort({ displayOrder: 1, drawDate: 1 }).limit(6).lean();
    return success(c, competitions);
  } catch (err) {
    console.error("Error fetching featured competitions:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app11.get("/categories", async (c) => {
  try {
    await db_default();
    const categories = await Competition.distinct("category", {
      status: "active"
    });
    return success(c, categories.filter(Boolean));
  } catch (err) {
    console.error("Error fetching categories:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app11.get("/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");
    await db_default();
    const competition = await Competition.findOne({ slug }).lean();
    if (!competition) {
      return error(c, ErrorCodes.NOT_FOUND, "Competition not found", 404);
    }
    return success(c, competition);
  } catch (err) {
    console.error("Error fetching competition:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app11.get("/:id/availability", async (c) => {
  try {
    const id = c.req.param("id");
    await db_default();
    const competition = await Competition.findById(id).select("maxTickets ticketsSold maxTicketsPerUser status").lean();
    if (!competition) {
      return error(c, ErrorCodes.NOT_FOUND, "Competition not found", 404);
    }
    const ticketsSold = competition.ticketsSold ?? 0;
    const maxTickets = competition.maxTickets;
    return success(c, {
      available: maxTickets - ticketsSold,
      total: maxTickets,
      sold: ticketsSold,
      percentageSold: Math.round(ticketsSold / maxTickets * 100),
      maxPerUser: competition.maxTicketsPerUser,
      isActive: competition.status === "active"
    });
  } catch (err) {
    console.error("Error fetching availability:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app11.get("/categories", async (c) => {
  try {
    await db_default();
    const categories = await Competition.distinct("category", {
      status: "active"
    });
    return success(c, categories.filter(Boolean));
  } catch (err) {
    console.error("Error fetching categories:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
var competitions_default2 = app11;

// src/routes/contact.ts
import { render as render2 } from "@react-email/render";

// src/email/templates/contact-notification.tsx
import { Hr as Hr3, Link as Link4, Section as Section4, Text as Text4 } from "@react-email/components";
function ContactNotificationEmail({ name, email, subject, message, submittedAt }) {
  return /* @__PURE__ */ jsxDEV(BaseEmail, { preview: `New contact form submission from ${name}`, children: [
    /* @__PURE__ */ jsxDEV(Text4, { className: emailStyles.heading.className, children: "New Contact Form Submission" }),
    /* @__PURE__ */ jsxDEV(Text4, { className: emailStyles.paragraph.className, children: "A new message has been submitted through the contact form on Luxero.win." }),
    /* @__PURE__ */ jsxDEV(Hr3, { className: emailStyles.divider.className }),
    /* @__PURE__ */ jsxDEV(Section4, { className: "mb-[16px]", children: [
      /* @__PURE__ */ jsxDEV(Text4, { className: "m-0 mb-[4px] text-[11px] uppercase tracking-wide font-semibold text-[#A1A1AA]", children: "From:" }),
      /* @__PURE__ */ jsxDEV(Text4, { className: "m-0 mb-[16px] text-[15px] text-[#FFFFFF]", children: name }),
      /* @__PURE__ */ jsxDEV(Text4, { className: "m-0 mb-[4px] text-[11px] uppercase tracking-wide font-semibold text-[#A1A1AA]", children: "Email:" }),
      /* @__PURE__ */ jsxDEV(Text4, { className: "m-0 mb-[16px] text-[15px]", children: /* @__PURE__ */ jsxDEV(Link4, { href: `mailto:${email}`, className: "text-[#D4AF37] no-underline", children: email }) }),
      /* @__PURE__ */ jsxDEV(Text4, { className: "m-0 mb-[4px] text-[11px] uppercase tracking-wide font-semibold text-[#A1A1AA]", children: "Subject:" }),
      /* @__PURE__ */ jsxDEV(Text4, { className: "m-0 mb-[16px] text-[15px] text-[#FFFFFF]", children: subject }),
      /* @__PURE__ */ jsxDEV(Text4, { className: "m-0 mb-[4px] text-[11px] uppercase tracking-wide font-semibold text-[#A1A1AA]", children: "Submitted:" }),
      /* @__PURE__ */ jsxDEV(Text4, { className: "m-0 text-[15px] text-[#FFFFFF]", children: submittedAt })
    ] }),
    /* @__PURE__ */ jsxDEV(Hr3, { className: emailStyles.divider.className }),
    /* @__PURE__ */ jsxDEV(Text4, { className: "m-0 mb-[8px] text-[11px] uppercase tracking-wide font-semibold text-[#A1A1AA]", children: "Message:" }),
    /* @__PURE__ */ jsxDEV(
      Section4,
      {
        className: "rounded-[12px] border border-[#27272A] bg-[#0A0A0B] p-[16px]",
        style: { borderWidth: "1px", borderStyle: "solid" },
        children: /* @__PURE__ */ jsxDEV(Text4, { className: "m-0 whitespace-pre-wrap text-[14px] leading-[22px] text-[#FFFFFF]", children: message })
      }
    ),
    /* @__PURE__ */ jsxDEV(Hr3, { className: emailStyles.divider.className }),
    /* @__PURE__ */ jsxDEV(Text4, { className: emailStyles.muted.className, children: "Reply directly to this email to respond to the customer, or click the email address above." })
  ] });
}

// src/routes/contact.ts
var app12 = new Hono2();
app12.post("/", async (c) => {
  try {
    const { name, email, subject, message } = await c.req.json();
    if (!name || !email || !subject || !message) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "All fields are required", 400);
    }
    const submittedAt = (/* @__PURE__ */ new Date()).toLocaleString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short"
    });
    const emailHtml = await render2(
      ContactNotificationEmail({ name, email, subject, message, submittedAt })
    );
    await sendEmail({
      to: "support@luxero.win",
      subject: `Contact Form: ${subject} (from ${name})`,
      html: emailHtml,
      replyTo: email
    });
    return success(c, { message: "Message sent successfully" });
  } catch (err) {
    console.error("Contact error:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Failed to send message", 500);
  }
});
var contact_default = app12;

// src/routes/content.ts
var app13 = new Hono2();
var STEPS = [
  {
    stepNumber: 1,
    title: "Browse Competitions",
    description: "Explore our luxury competitions and find a prize that excites you.",
    icon: "Search"
  },
  {
    stepNumber: 2,
    title: "Select Your Tickets",
    description: "Choose how many tickets you'd like \u2014 more tickets increase your chances.",
    icon: "Ticket"
  },
  {
    stepNumber: 3,
    title: "Complete Purchase",
    description: "Quick and secure checkout with card, Apple Pay or Google Pay.",
    icon: "CreditCard"
  },
  {
    stepNumber: 4,
    title: "Await the Draw",
    description: "Sit back and watch the countdown. Winners are selected at random.",
    icon: "Clock"
  },
  {
    stepNumber: 5,
    title: "Win & Celebrate",
    description: "Winners are notified by email and prizes dispatched within 14 days.",
    icon: "Trophy"
  },
  {
    stepNumber: 6,
    title: "Refer Friends",
    description: "Share your win and earn free tickets for every friend who enters.",
    icon: "Users"
  }
];
var FEATURES = [
  {
    title: "Verified Random Draws",
    description: "Every winner is selected using certified random number generation.",
    icon: "Shield"
  },
  {
    title: "Real Luxury Prizes",
    description: "Only authentic, high-value prizes from trusted brands and retailers.",
    icon: "Gem"
  },
  {
    title: "Instant Notifications",
    description: "Know immediately when you've won via email and your dashboard.",
    icon: "Bell"
  },
  {
    title: "Track Your Entries",
    description: "See all your tickets, draws, and wins in your personal dashboard.",
    icon: "BarChart"
  },
  {
    title: "Secure Payments",
    description: "Stripe-powered checkout with full fraud protection and encryption.",
    icon: "Lock"
  },
  {
    title: "Dedicated Support",
    description: "Our team is here to help every day during business hours.",
    icon: "Headphones"
  }
];
app13.get("/steps", async (c) => {
  return success(c, STEPS);
});
app13.get("/features", async (c) => {
  return success(c, FEATURES);
});
var content_default = app13;

// src/routes/faq.ts
var app14 = new Hono2();
var FAQ_DATA = {
  general: [
    {
      question: "How do I enter a competition?",
      answer: "Browse our competitions, select your desired prize, choose how many tickets you'd like to purchase, and complete the checkout process. You'll receive a confirmation email with your ticket numbers."
    },
    {
      question: "How are winners selected?",
      answer: "Winners are selected using a verified random number generator (RNG) that picks a winning ticket number after the competition closes. The winner is notified via email within 7 days of the draw."
    },
    {
      question: "When will the draw take place?",
      answer: "Each competition page shows the scheduled draw date and time. Draws occur automatically once all tickets are sold or the countdown timer reaches zero, whichever comes first."
    },
    {
      question: "How will I know if I've won?",
      answer: "We'll email the winner at the email address used during purchase. The winner's name and prize will also be displayed on our Winners page. Make sure to keep your account email up to date."
    },
    {
      question: "How long does prize delivery take?",
      answer: "Once winner verification is complete, prizes are typically dispatched within 14 working days. UK deliveries usually arrive within 5-7 working days. International deliveries may take longer depending on location."
    },
    {
      question: "Can I get a refund on my tickets?",
      answer: "All ticket purchases are final and non-refundable. Competition entries remain valid even if the draw date changes. Please ensure you're able to commit to the competition before purchasing."
    },
    {
      question: "Are there any age restrictions?",
      answer: "Yes, you must be 18 years or older to participate in any competition. We reserve the right to verify the age of winners before a prize is dispatched."
    },
    {
      question: "Can I buy tickets for someone else?",
      answer: "Yes, you can purchase tickets as a gift. The tickets will be assigned to your account, but you can notify us after the draw if the winner is a different person and we'll update the delivery details accordingly."
    }
  ],
  payment: [
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit and debit cards including Visa, Mastercard, and American Express. Apple Pay and Google Pay are also supported for faster checkout."
    },
    {
      question: "Is my payment information secure?",
      answer: "Absolutely. All payments are processed through Stripe, one of the world's most trusted payment platforms. We never store your card details \u2014 they're handled entirely by Stripe's secure infrastructure."
    },
    {
      question: "Can I use a promo code?",
      answer: "Yes, you can enter a promo code at checkout for discounts or bonus tickets. Promo codes cannot be combined with other offers and have expiry dates."
    }
  ],
  delivery: [
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to most countries worldwide. International shipping costs and delivery times vary by destination. All customs duties and import taxes are the responsibility of the recipient."
    },
    {
      question: "What happens if I'm not home for delivery?",
      answer: "The courier will usually attempt delivery twice before returning the package. We recommend providing a safe location or office address for prize deliveries to avoid missed deliveries."
    }
  ]
};
app14.get("/", async (c) => {
  const category = c.req.query("category") || "general";
  const items = FAQ_DATA[category] || FAQ_DATA.general;
  return success(c, items);
});
var faq_default = app14;

// src/routes/me/entries.ts
import mongoose15 from "mongoose";
var app15 = new Hono2();
app15.use("*", auth);
app15.get("/", async (c) => {
  try {
    const { limit, page, skip } = parsePagination(c);
    const userId = c.get("userId");
    await db_default();
    const [entries, total] = await Promise.all([
      Entry.find({ userId: new mongoose15.Types.ObjectId(userId) }).populate("competitionId", "title prizeTitle prizeImageUrl status drawDate").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Entry.countDocuments({ userId: new mongoose15.Types.ObjectId(userId) })
    ]);
    return paginated(c, entries, total, page, limit);
  } catch (err) {
    console.error("Error fetching entries:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app15.get("/competition/:competitionId", async (c) => {
  try {
    const competitionId = c.req.param("competitionId");
    const userId = c.get("userId");
    await db_default();
    const entries = await Entry.find({
      userId: new mongoose15.Types.ObjectId(userId),
      competitionId: new mongoose15.Types.ObjectId(competitionId)
    }).lean();
    const totalTickets = entries.reduce((sum, e) => sum + e.quantity, 0);
    const ticketNumbers = entries.flatMap((e) => e.ticketNumbers || []);
    return success(c, { entries, totalTickets, ticketNumbers });
  } catch (err) {
    console.error("Error fetching entries:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
var entries_default = app15;

// src/routes/me/orders.ts
import mongoose16 from "mongoose";
var app16 = new Hono2();
app16.use("*", auth);
app16.get("/", async (c) => {
  try {
    const { limit, page, skip } = parsePagination(c);
    const userId = c.get("userId");
    await db_default();
    const [orders, total] = await Promise.all([
      Order.find({ userId: new mongoose16.Types.ObjectId(userId) }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments({ userId: new mongoose16.Types.ObjectId(userId) })
    ]);
    return paginated(c, orders, total, page, limit);
  } catch (err) {
    console.error("Error fetching orders:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app16.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const userId = c.get("userId");
    await db_default();
    const order = await Order.findOne({
      _id: new mongoose16.Types.ObjectId(id),
      userId: new mongoose16.Types.ObjectId(userId)
    }).lean();
    if (!order) {
      return error(c, ErrorCodes.NOT_FOUND, "Order not found", 404);
    }
    return success(c, order);
  } catch (err) {
    console.error("Error fetching order:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
var orders_default2 = app16;

// src/routes/me/profile.ts
import mongoose17 from "mongoose";
var app17 = new Hono2();
app17.use("*", auth);
app17.get("/", async (c) => {
  try {
    const userId = c.get("userId");
    await db_default();
    let profile = await Profile.findById(userId).lean();
    if (!profile) {
      const user = await User.findById(userId).lean();
      if (!user) {
        return error(c, ErrorCodes.NOT_FOUND, "User not found", 404);
      }
      profile = await Profile.create({
        _id: userId,
        email: user.email,
        country: "GB"
      });
    }
    return success(c, profile);
  } catch (err) {
    console.error("Error fetching profile:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app17.put("/", async (c) => {
  try {
    const userId = c.get("userId");
    const body = await c.req.json();
    await db_default();
    const allowedFields = [
      "fullName",
      "phone",
      "dateOfBirth",
      "addressLine1",
      "addressLine2",
      "city",
      "postcode",
      "country",
      "marketingConsent",
      "instagram",
      "facebook",
      "twitter",
      "tiktok",
      "youtube",
      "websiteUrl",
      "showLastName",
      "showLocation",
      "showSocials"
    ];
    const updateData = {};
    for (const field of allowedFields) {
      if (body[field] !== void 0) {
        updateData[field] = body[field];
      }
    }
    const profile = await Profile.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true
    }).lean();
    if (!profile) {
      return error(c, ErrorCodes.NOT_FOUND, "Profile not found", 404);
    }
    return success(c, profile);
  } catch (err) {
    console.error("Error updating profile:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app17.get("/wins", async (c) => {
  try {
    const { limit, page, skip } = parsePagination(c);
    const userId = c.get("userId");
    await db_default();
    const [wins, total] = await Promise.all([
      mongoose17.model("Winner").find({ userId: new mongoose17.Types.ObjectId(userId) }).populate("competitionId", "title prizeTitle prizeImageUrl drawDate").sort({ drawnAt: -1 }).skip(skip).limit(limit).lean(),
      mongoose17.model("Winner").countDocuments({ userId: new mongoose17.Types.ObjectId(userId) })
    ]);
    return paginated(c, wins, total, page, limit);
  } catch (err) {
    console.error("Error fetching wins:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app17.get("/stats", async (c) => {
  try {
    const userId = c.get("userId");
    await db_default();
    const profile = await Profile.findById(userId).lean();
    if (!profile) {
      return error(c, ErrorCodes.NOT_FOUND, "Profile not found", 404);
    }
    const entriesCount = await mongoose17.model("Entry").countDocuments({ userId: new mongoose17.Types.ObjectId(userId) });
    const winsCount = await mongoose17.model("Winner").countDocuments({ userId: new mongoose17.Types.ObjectId(userId) });
    return success(c, {
      activeEntries: entriesCount,
      totalWins: winsCount,
      totalSpent: profile.totalSpent || 0,
      totalEntries: profile.totalEntries || 0
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
var profile_default = app17;

// src/routes/me/referrals.ts
import mongoose18 from "mongoose";
var app18 = new Hono2();
app18.use("*", auth);
app18.get("/", async (c) => {
  try {
    const userId = c.get("userId");
    await db_default();
    const profile = await Profile.findById(userId).lean();
    if (!profile) {
      return error(c, ErrorCodes.NOT_FOUND, "Profile not found", 404);
    }
    const totalReferralCount = profile.referralCount || 0;
    const thirtyDaysAgo = /* @__PURE__ */ new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activePurchases = await ReferralPurchase.find({
      referrerId: new mongoose18.Types.ObjectId(userId),
      purchasedAt: { $gte: thirtyDaysAgo }
    }).lean();
    const activeReferralCount = activePurchases.length;
    let tierTickets = 0;
    if (activeReferralCount >= 15) tierTickets = 10;
    else if (activeReferralCount >= 10) tierTickets = 5;
    else if (activeReferralCount >= 5) tierTickets = 2;
    const referralsToNextTier = activeReferralCount < 5 ? 5 - activeReferralCount : activeReferralCount < 10 ? 10 - activeReferralCount : activeReferralCount < 15 ? 15 - activeReferralCount : 0;
    const recentReferrals = await Profile.find({ referredBy: userId }).select("fullName email createdAt").sort({ createdAt: -1 }).limit(10).lean();
    const leaderboard = await Profile.find({ referralCount: { $gt: 0 } }).select("fullName email referralCount").sort({ referralCount: -1 }).limit(10).lean();
    return success(c, {
      referralCode: profile.referralCode || null,
      totalReferralCount,
      activeReferralCount,
      tierTickets,
      referralsToNextTier,
      pendingTickets: profile.referralTierPendingTickets || 0,
      totalAwardedTickets: profile.referralTierAwardedTickets || 0,
      recentReferrals: recentReferrals.map((r) => ({
        id: r._id.toString(),
        name: r.fullName || r.email?.split("@")[0] || "Anonymous",
        email: r.email,
        joinedAt: r.createdAt
      })),
      leaderboard: leaderboard.map((l, i) => ({
        rank: i + 1,
        name: l.fullName || l.email?.split("@")[0] || "Anonymous",
        count: l.referralCount
      }))
    });
  } catch (err) {
    console.error("Error fetching referrals:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
var referrals_default = app18;

// src/routes/payments.ts
var app19 = new Hono2();
app19.post("/create-checkout-session", async (c) => {
  try {
    const body = await c.req.json();
    const { items, userId, subtotal, discount } = body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "items array is required", 400);
    }
    if (!userId) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "userId is required", 400);
    }
    await db_default();
    for (const item of items) {
      const competition = await Competition.findById(item.competitionId).lean();
      if (!competition) {
        return error(c, ErrorCodes.NOT_FOUND, `Competition ${item.competitionId} not found`, 404);
      }
      if (competition.status !== "active") {
        return error(
          c,
          ErrorCodes.VALIDATION_ERROR,
          `Competition "${competition.title}" is not active`,
          400
        );
      }
      const available = competition.maxTickets - (competition.ticketsSold || 0);
      if (item.quantity > available) {
        return error(
          c,
          ErrorCodes.VALIDATION_ERROR,
          `Only ${available} tickets available for "${competition.title}"`,
          400
        );
      }
    }
    const total = subtotal - (discount || 0);
    const orderNumber = Date.now();
    const order = await Order.create({
      orderNumber,
      userId,
      status: "pending",
      subtotal: subtotal || 0,
      discountAmount: discount || 0,
      total,
      promoCodeId: void 0,
      referralBonusTickets: 0,
      referralBalanceUsed: 0,
      stripeSessionId: `cs_mock_${Date.now()}`
    });
    order.status = "completed";
    order.paidAt = /* @__PURE__ */ new Date();
    await order.save();
    for (const item of items) {
      const competition = await Competition.findById(item.competitionId).lean();
      if (!competition) continue;
      const startTicket = (competition.ticketsSold || 0) + 1;
      const ticketNumbers = Array.from({ length: item.quantity }, (_, i) => startTicket + i);
      await Entry.create({
        userId,
        competitionId: item.competitionId,
        orderId: order._id,
        ticketNumbers,
        quantity: item.quantity,
        answerIndex: item.answerIndex
      });
      await Competition.findByIdAndUpdate(item.competitionId, {
        $inc: { ticketsSold: item.quantity }
      });
      await Profile.findByIdAndUpdate(userId, {
        $inc: { totalEntries: item.quantity, totalSpent: competition.ticketPrice * item.quantity }
      });
    }
    return success(c, {
      orderId: order._id,
      sessionId: `cs_mock_${Date.now()}`,
      status: "succeeded",
      amount: total,
      currency: "gbp"
    });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app19.post("/webhook", async (c) => {
  try {
    const { sessionId, competitionId, tickets, userId, paymentStatus } = await c.req.json();
    if (paymentStatus !== "succeeded") {
      return error(c, ErrorCodes.VALIDATION_ERROR, "Payment not succeeded", 400);
    }
    await db_default();
    const order = await Order.findOne({ stripeSessionId: sessionId });
    if (!order) {
      return error(c, ErrorCodes.NOT_FOUND, "Order not found", 404);
    }
    if (order.status === "completed") {
      return success(c, { order, entries: [] });
    }
    const competition = await Competition.findById(competitionId).lean();
    if (!competition) {
      return error(c, ErrorCodes.NOT_FOUND, "Competition not found", 404);
    }
    const startTicket = (competition.ticketsSold || 0) + 1;
    const ticketNumbers = Array.from({ length: tickets }, (_, i) => startTicket + i);
    const entries = await Entry.create({
      userId,
      competitionId,
      orderId: order._id,
      ticketNumbers,
      quantity: tickets
    });
    order.status = "completed";
    order.paidAt = /* @__PURE__ */ new Date();
    await order.save();
    await Competition.findByIdAndUpdate(competitionId, {
      $inc: { ticketsSold: tickets }
    });
    await Profile.findByIdAndUpdate(userId, {
      $inc: { totalEntries: tickets, totalSpent: competition.ticketPrice * tickets }
    });
    return success(c, { order, entries });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app19.get("/session/:sessionId", async (c) => {
  try {
    const sessionId = c.req.param("sessionId");
    await db_default();
    const order = await Order.findOne({ stripeSessionId: sessionId }).lean();
    if (!order) {
      return success(c, { sessionId, status: "pending" });
    }
    return success(c, { sessionId, status: order.status });
  } catch (err) {
    console.error("Error verifying session:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
var payments_default = app19;

// src/routes/promo-codes.ts
var app20 = new Hono2();
app20.post("/validate", async (c) => {
  try {
    const { code, subtotal } = await c.req.json();
    if (!code) {
      return error(c, ErrorCodes.VALIDATION_ERROR, "Promo code is required", 400);
    }
    await db_default();
    const promoCode = await PromoCode.findOne({
      code: code.toUpperCase(),
      isActive: true
    }).lean();
    if (!promoCode) {
      return success(c, { valid: false, error: "Invalid promo code" });
    }
    const now = /* @__PURE__ */ new Date();
    if (promoCode.validFrom && promoCode.validFrom > now) {
      return success(c, { valid: false, error: "Promo code is not yet valid" });
    }
    if (promoCode.validUntil && promoCode.validUntil < now) {
      return success(c, { valid: false, error: "Promo code has expired" });
    }
    if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
      return success(c, { valid: false, error: "Promo code has reached maximum uses" });
    }
    if (promoCode.minOrderValue && subtotal < promoCode.minOrderValue) {
      return success(c, {
        valid: false,
        error: `Minimum order value is \xA3${promoCode.minOrderValue}`
      });
    }
    return success(c, {
      valid: true,
      discountType: promoCode.discountType,
      discountValue: promoCode.discountValue
    });
  } catch (err) {
    console.error("Error validating promo code:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
var promo_codes_default2 = app20;

// src/routes/stats.ts
var app21 = new Hono2();
var statsCache = null;
var CACHE_TTL_MS = 6e4;
app21.get("/", async (c) => {
  try {
    const now = Date.now();
    if (statsCache && statsCache.expiresAt > now) {
      return success(c, statsCache.data);
    }
    await db_default();
    const [prizeValueResult, usersResult, entriesResult] = await Promise.all([
      Winner.aggregate([{ $group: { _id: null, total: { $sum: "$prizeValue" } } }]),
      Profile.countDocuments(),
      Entry.aggregate([{ $group: { _id: null, total: { $sum: "$quantity" } } }])
    ]);
    const result = {
      totalPrizeValue: prizeValueResult[0]?.total || 0,
      totalUsers: usersResult,
      totalEntries: entriesResult[0]?.total || 0
    };
    statsCache = { data: result, expiresAt: now + CACHE_TTL_MS };
    return success(c, result);
  } catch (err) {
    console.error("Error fetching stats:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
var stats_default = app21;

// src/routes/winners.ts
var app22 = new Hono2();
app22.get("/", async (c) => {
  try {
    const { limit, page, skip } = parsePagination(c);
    await db_default();
    const [winners, total] = await Promise.all([
      Winner.find().sort({ drawnAt: -1 }).skip(skip).limit(limit).lean(),
      Winner.countDocuments()
    ]);
    return paginated(c, winners, total, page, limit);
  } catch (err) {
    console.error("Error fetching winners:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app22.get("/competition/:competitionId", async (c) => {
  try {
    const competitionId = c.req.param("competitionId");
    await db_default();
    const winners = await Winner.find({ competitionId }).populate("userId", "fullName avatarUrl").lean();
    return success(c, winners);
  } catch (err) {
    console.error("Error fetching competition winners:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
app22.get("/stats", async (c) => {
  try {
    await db_default();
    const winnersCount = await Winner.countDocuments();
    const prizeAgg = await Winner.aggregate([
      { $group: { _id: null, total: { $sum: "$prizeValue" } } }
    ]).exec();
    return success(c, {
      totalWinners: winnersCount,
      totalPrizeValue: prizeAgg[0]?.total || 0,
      totalWinnersAllTime: winnersCount
    });
  } catch (err) {
    console.error("Error fetching winner stats:", err);
    return error(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
  }
});
var winners_default = app22;

// src/index.ts
var app23 = new Hono2();
app23.use(
  "*",
  cors({
    origin: "*",
    credentials: true
  })
);
app23.get("/health", (c) => c.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() }));
app23.route("/api/competitions", competitions_default2);
app23.route("/api/categories", categories_default2);
app23.route("/api/winners", winners_default);
app23.route("/api/promo-codes", promo_codes_default2);
app23.route("/api/stats", stats_default);
app23.route("/api/payments", payments_default);
app23.route("/api/auth", auth_default);
app23.route("/api/contact", contact_default);
app23.route("/api/faq", faq_default);
app23.route("/api/content", content_default);
app23.route("/api/me/orders", orders_default2);
app23.route("/api/me/entries", entries_default);
app23.route("/api/me/profile", profile_default);
app23.route("/api/me/referrals", referrals_default);
app23.route("/api/admin/competitions", competitions_default);
app23.route("/api/admin/categories", categories_default);
app23.route("/api/admin/orders", orders_default);
app23.route("/api/admin/users", users_default);
app23.route("/api/admin/promo-codes", promo_codes_default);
app23.route("/api/admin/instant-prizes", instant_prizes_default);
app23.route("/api/admin/referral-purchases", referral_purchases_default);
app23.route("/api/admin/languages", languages_default);
var index_default = app23;
export {
  index_default as default
};
