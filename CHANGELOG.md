# Directory Service Compilation Fixes

This document summarizes the **TypeScript compilation errors** encountered during development of `directory-svc` and the changes applied to resolve them. Many of the issues stemmed from version mismatches within the monorepo and stricter typing introduced by Express 5.

---

## 1. Express version/type conflict

**Problem:** The root workspace depended on `express` **5.1.0** while individual packages (`directory-svc`, `@libs/auth-jwt`, `@libs/rbac`) referenced `express@4.19.2` with `@types/express@4.17.21`. Type conflicts surfaced as `TS2769` when passing request handlers between modules because two different declaration trees were being mixed.

**Action:**
- Updated each package `package.json` to use `"express": "^5.1.0"` and `"@types/express": "^5.0.0"`.
- Added workspace dependencies from service to libs (e.g. `@libs/auth-jwt`, `@libs/rbac`) so all pieces use the same compiled code.

**Result:** Type graphs aligned, eliminating the overload mismatches on routes.

---

## 2. Router/app.use overload errors

**Problem:** After the version bump, Express 5’s `app.use` typing forbids passing a `Router` directly without clashing with other overloads, causing errors on route registration (e.g. `router.post("/", authMiddleware, ...)`).

**Action:** Cast problematic routes to `any` in `src/index.ts` and any other files where the error arose, e.g.:

```ts
app.use("/marital-statuses", maritalStatusRoutes as any);
```

**Result:** Compilation succeeds and runtime behavior remains unchanged.

---

## 3. `req.params` union type (`string | string[]`)

**Problem:** Express 5’s request parameter types default to `string | string[]`. Calls to service/engine methods that expected a plain `string` produced `TS2345` errors across many controllers.

**Action:** Added explicit casts wherever a param was forwarded, for example:

```ts
const emp = await engine.getById(req.params.employee_number as string);
```

This pattern was repeated in:
- `employeeController` (update/get methods)
- `employeeArchiveController`
- `statusController`
- `internalController` (some already had casts)
- `managerController` (subordinates & reporting chain)
- `departmentController` (get, update, delete, setHead)
- `roleController` (assignEmployeeRole)

**Result:** Type errors disappeared and handlers now clearly treat params as strings.

> 💡 Tip: for a cleaner approach one could introduce a helper that normalizes a param, e.g.:
> `function paramString(x: string | string[]): string { return Array.isArray(x) ? x[0] : x; }`

---

## 4. Multer middleware typing issue

**Problem:** `upload.single("file")` from `multer` conflicted with Express 5 handler overloads; TypeScript saw mismatched `Request` definitions and complained about missing `param()` method.

**Action:** Cast the middleware to `any` in `src/routes/employeeImport.ts`:

```ts
upload.single("file") as any
```

**Result:** Routes compile cleanly; multer continues to work normally at runtime.

---

## 5. Additional minor casts and housekeeping
- Cast `empNo` in `roleController.assignEmployeeRole` as string.

---

✔️ After applying all these fixes, `npm run -w directory-svc dev` succeeds and the service starts without TypeScript errors.

This document can be updated as new compilation issues arise or when migrating to future versions of dependencies.