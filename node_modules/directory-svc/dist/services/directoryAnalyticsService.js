"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectoryAnalyticsService = void 0;
class DirectoryAnalyticsService {
    repo;
    cache = new Map();
    constructor(repo) {
        this.repo = repo;
    }
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached)
            return null;
        if (Date.now() > cached.expiry) {
            this.cache.delete(key);
            return null;
        }
        return cached.data;
    }
    setCache(key, data, ttlMs) {
        this.cache.set(key, {
            data,
            expiry: Date.now() + ttlMs,
        });
    }
    async getDepartmentSummary() {
        const cacheKey = "department_summary_ke";
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        const data = await this.repo.getDepartmentSummary();
        this.setCache(cacheKey, data, 5 * 60_000);
        return data;
    }
    async getEmployeesByNumbers(employeeNumbers) {
        const cacheKey = `employees_by_numbers_${employeeNumbers.sort().join(",")}`;
        const cached = this.getFromCache(cacheKey);
        if (cached)
            return cached;
        const data = await this.repo.getEmployeesByNumbers(employeeNumbers);
        this.setCache(cacheKey, data, 10 * 60_000);
        return data;
    }
}
exports.DirectoryAnalyticsService = DirectoryAnalyticsService;
