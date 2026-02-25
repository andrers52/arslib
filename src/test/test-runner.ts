import { it, expect as vitestExpect, beforeEach, afterEach } from 'vitest';

export class TestRunner {
    test(name: string, testFn: any) {
        it(name, testFn);
    }
    beforeEach(fn: any) {
        beforeEach(fn);
    }
    afterEach(fn: any) {
        afterEach(fn);
    }
    run() {
        return Promise.resolve(true);
    }
}

export const expect = {
    toBe(actual: any, expected: any, message?: string) {
        vitestExpect(actual, message).toBe(expected);
    },
    toBeGreaterThanOrEqual(actual: number, expected: number, message?: string) {
        vitestExpect(actual, message).toBeGreaterThanOrEqual(expected);
    },
    toBeGreaterThan(actual: number, expected: number, message?: string) {
        vitestExpect(actual, message).toBeGreaterThan(expected);
    },
    toEqual(actual: any, expected: any, message?: string) {
        vitestExpect(actual, message).toStrictEqual(expected);
    },
    toBeTruthy(value: any, message?: string) {
        vitestExpect(value, message).toBeTruthy();
    },
    toBeFalsy(value: any, message?: string) {
        vitestExpect(value, message).toBeFalsy();
    },
    toBeNull(value: any, message?: string) {
        vitestExpect(value, message).toBeNull();
    },
    toBeUndefined(value: any, message?: string) {
        vitestExpect(value, message).toBeUndefined();
    },
    toBeDefined(value: any, message?: string) {
        vitestExpect(value, message).toBeDefined();
    },
    toThrow(fn: any, expectedMessage?: string, message?: string) {
        if (expectedMessage) {
            vitestExpect(fn, message).toThrowError(expectedMessage);
        } else {
            vitestExpect(fn, message).toThrow();
        }
    },
    toDoesNotThrow(fn: any, message?: string) {
        vitestExpect(fn, message).not.toThrow();
    },
    toBeType(value: any, type: string, message?: string) {
        if (type === 'array') {
            vitestExpect(Array.isArray(value), message).toBe(true);
        } else {
            vitestExpect(typeof value, message).toBe(type);
        }
    },
    toHaveLength(array: any, length: number, message?: string) {
        vitestExpect(array?.length, message).toBe(length);
    },
    toHaveProperty(obj: any, prop: string, message?: string) {
        vitestExpect(obj, message).toHaveProperty(prop);
    }
};
