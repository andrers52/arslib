import { TestRunner, expect } from "../test/test-runner.js";
import { ModuleId, ModuleState, moduleStateCanTransitionTo, ModuleError, ModuleErrorClass } from "./module.js";

const runner = new TestRunner();

runner.test("ModuleId wraps u32", () => {
    const id = new ModuleId(42);
    expect.toBe(id.value, 42, "Value should be 42");
    expect.toBe(id.toString(), "42", "toString should be '42'");
});

runner.test("ModuleId wraps at u32 max", () => {
    const id = new ModuleId(0xffffffff + 1);
    expect.toBe(id.value, 0, "Should wrap to 0");
});

runner.test("ModuleId equals", () => {
    const a = new ModuleId(1);
    const b = new ModuleId(1);
    const c = new ModuleId(2);
    expect.toBe(a.equals(b), true, "Same value should be equal");
    expect.toBe(a.equals(c), false, "Different value should not be equal");
});

runner.test("moduleStateCanTransitionTo valid paths", () => {
    expect.toBe(moduleStateCanTransitionTo(ModuleState.Created, ModuleState.Initialized), true, "Created -> Initialized");
    expect.toBe(moduleStateCanTransitionTo(ModuleState.Initialized, ModuleState.Running), true, "Initialized -> Running");
    expect.toBe(moduleStateCanTransitionTo(ModuleState.Initialized, ModuleState.Stopped), true, "Initialized -> Stopped");
    expect.toBe(moduleStateCanTransitionTo(ModuleState.Running, ModuleState.Stopped), true, "Running -> Stopped");
    expect.toBe(moduleStateCanTransitionTo(ModuleState.Running, ModuleState.Failed), true, "Running -> Failed");
});

runner.test("moduleStateCanTransitionTo invalid paths", () => {
    expect.toBe(moduleStateCanTransitionTo(ModuleState.Created, ModuleState.Running), false, "Created -> Running is invalid");
    expect.toBe(moduleStateCanTransitionTo(ModuleState.Stopped, ModuleState.Running), false, "Stopped -> Running is invalid");
    expect.toBe(moduleStateCanTransitionTo(ModuleState.Failed, ModuleState.Running), false, "Failed -> Running is invalid");
    expect.toBe(moduleStateCanTransitionTo(ModuleState.Running, ModuleState.Initialized), false, "Running -> Initialized is invalid");
});

runner.test("ModuleState toString", () => {
    expect.toBe(ModuleState.toString(ModuleState.Created), "Created", "Created toString");
    expect.toBe(ModuleState.toString(ModuleState.Running), "Running", "Running toString");
    expect.toBe(ModuleState.toString(ModuleState.Failed), "Failed", "Failed toString");
});

runner.test("ModuleError structured enum variants", () => {
    const initErr: ModuleError = { kind: "InitFailed", reason: "config missing" };
    expect.toBe(initErr.kind, "InitFailed", "kind should be InitFailed");
    expect.toBe(initErr.reason, "config missing", "reason should match");

    const transitionErr: ModuleError = { kind: "InvalidTransition", from: ModuleState.Created, to: ModuleState.Running };
    expect.toBe(transitionErr.kind, "InvalidTransition", "kind should be InvalidTransition");
    expect.toBe(transitionErr.from, ModuleState.Created, "from state");
    expect.toBe(transitionErr.to, ModuleState.Running, "to state");
});

runner.test("ModuleError toString", () => {
    const err: ModuleError = { kind: "InitFailed", reason: "config missing" };
    const str = ModuleError.toString(err);
    expect.toBe(str.includes("config missing"), true, "toString should include reason");
    expect.toBe(str.includes("init failed"), true, "toString should include variant");

    const trans: ModuleError = { kind: "InvalidTransition", from: ModuleState.Created, to: ModuleState.Running };
    const transStr = ModuleError.toString(trans);
    expect.toBe(transStr.includes("Created"), true, "toString should include from state");
    expect.toBe(transStr.includes("Running"), true, "toString should include to state");
});

runner.test("ModuleErrorClass wraps structured error", () => {
    const err: ModuleError = { kind: "StartFailed", reason: "port in use" };
    const exc = new ModuleErrorClass(err);
    expect.toBe(exc.name, "ModuleError", "name should be ModuleError");
    expect.toBe(exc.error, err, "error should reference original");
    expect.toBe(exc.message.includes("port in use"), true, "message should include reason");

    const structured = exc.toStructured();
    expect.toBe(structured.kind, "StartFailed", "toStructured should preserve kind");
});
