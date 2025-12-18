import { Localization, setDefaultLanguage } from "./localization.js";
import { Platform } from "./platform.js";
import { TestRunner, expect } from "./test/test-runner.js";

const runner = new TestRunner();

const sampleSymbols = {
  GREETING: ["Dev_Hi", "Hello", "Olá"],
  FAREWELL: ["Dev_Bye", "Goodbye", "Adeus"],
};

// --- Localization Class Tests ---
runner.test("Localization constructor: valid initialization", () => {
  const localizer = new Localization("en-US", sampleSymbols);
  expect.toBeDefined(localizer, "Localizer instance should be created.");
  expect.toBe(localizer.getCurrentLanguage(), "en-US");
  const strings = localizer.getLocalizedStrings();
  expect.toEqual(strings, { GREETING: "Hello", FAREWELL: "Goodbye" });
  expect.toBe(localizer.getString("GREETING"), "Hello");
  expect.toEqual(localizer.getSupportedLanguages(), ["dev", "en-US", "pt-BR"]);
});

runner.test(
  "Localization constructor: initialization with 'dev' language",
  () => {
    const localizer = new Localization("dev", sampleSymbols);
    expect.toBe(localizer.getString("GREETING"), "Dev_Hi");
  },
);

runner.test(
  "Localization constructor: initialization with 'pt-BR' language",
  () => {
    const localizer = new Localization("pt-BR", sampleSymbols);
    expect.toBe(localizer.getString("GREETING"), "Olá");
  },
);

runner.test("Localization constructor: throws for invalid language", () => {
  expect.toThrow(
    () => new Localization("fr-FR", sampleSymbols),
    "Error: Language must be one of {dev, en-US, pt-BR}",
  );
});

runner.test(
  "Localization constructor: throws if symbols is not an object",
  () => {
    expect.toThrow(
      () => new Localization("en-US", "not-an-object"),
      "Error: symbols is an object that associates tokens with localized strings",
    );
  },
);

runner.test(
  "Localization constructor: throws if a symbol value is not an array",
  () => {
    const invalidSymbols = { GREETING: "not-an-array" };
    expect.toThrow(
      () => new Localization("en-US", invalidSymbols),
      `Error: GREETING must be an array of localized strings`,
    );
  },
);

runner.test(
  "Localization constructor: throws if a symbol array has insufficient translations",
  () => {
    const insufficientSymbols = { GREETING: ["Hello"] }; // Only 1 translation
    expect.toThrow(
      () => new Localization("en-US", insufficientSymbols),
      `Error: GREETING must have translations for all supported languages`,
    );
  },
);

runner.test(
  "Localization.updateLanguage: updates language and strings correctly",
  () => {
    const localizer = new Localization("en-US", sampleSymbols);
    localizer.updateLanguage("pt-BR");
    expect.toBe(localizer.getCurrentLanguage(), "pt-BR");
    expect.toBe(localizer.getString("FAREWELL"), "Adeus");
  },
);

runner.test("Localization.updateLanguage: updates with new symbols", () => {
  const localizer = new Localization("en-US", sampleSymbols);
  const newSymbols = { PROMPT: ["Dev_Enter", "Enter", "Entrar"] };
  localizer.updateLanguage("dev", newSymbols);
  expect.toBe(localizer.getCurrentLanguage(), "dev");
  expect.toBe(localizer.getString("PROMPT"), "Dev_Enter");
  // Check that old symbols are gone if newSymbols doesn't include them
  expect.toThrow(
    () => localizer.getString("GREETING"),
    "Error: key 'GREETING' not found in localized strings",
  );
});

runner.test(
  "Localization.updateLanguage: throws for invalid new language",
  () => {
    const localizer = new Localization("en-US", sampleSymbols);
    expect.toThrow(
      () => localizer.updateLanguage("es-ES"),
      "Error: Language must be one of {dev, en-US, pt-BR}",
    );
  },
);

runner.test("Localization.getString: throws for non-string key", () => {
  const localizer = new Localization("en-US", sampleSymbols);
  expect.toThrow(() => localizer.getString(123), "Error: key must be a string");
});

runner.test("Localization.getString: throws for key not found", () => {
  const localizer = new Localization("en-US", sampleSymbols);
  expect.toThrow(
    () => localizer.getString("NON_EXISTENT_KEY"),
    "Error: key 'NON_EXISTENT_KEY' not found in localized strings",
  );
});

runner.test(
  "Localization.getLocalizedStrings: returns a copy, not a reference",
  () => {
    const localizer = new Localization("en-US", sampleSymbols);
    const strings1 = localizer.getLocalizedStrings();
    strings1.GREETING = "Modified Greeting"; // Modify the copy
    const strings2 = localizer.getLocalizedStrings(); // Get a new copy
    expect.toBe(
      strings2.GREETING,
      "Hello",
      "Original localized strings should not be affected by modifications to a retrieved copy.",
    );
  },
);

// --- setDefaultLanguage Function Tests ---
let originalNavigator;

runner.beforeEach(() => {
  if (Platform.isBrowser()) {
    originalNavigator = global.navigator;
  }
});

runner.afterEach(() => {
  if (Platform.isBrowser()) {
    global.navigator = originalNavigator;
  }
});

runner.test("setDefaultLanguage: 'dev' environment returns 'dev'", () => {
  expect.toBe(setDefaultLanguage("dev"), "dev");
});

runner.test(
  "setDefaultLanguage: Node.js environment (no navigator) returns 'en-US'",
  () => {
    if (Platform.isNode()) {
      // In Node, navigator is undefined, so it should hit the catch block
      expect.toBe(setDefaultLanguage("prod"), "en-US");
    }
  },
);

if (Platform.isBrowser()) {
  runner.test(
    "setDefaultLanguage: browser 'pt-BR' (navigator.language) returns 'pt-BR'",
    () => {
      global.navigator = { language: "pt-BR" };
      expect.toBe(setDefaultLanguage("prod"), "pt-BR");
    },
  );

  runner.test(
    "setDefaultLanguage: browser 'pt-BR' (navigator.userLanguage) returns 'pt-BR'",
    () => {
      global.navigator = { userLanguage: "pt-BR" }; // language is undefined
      expect.toBe(setDefaultLanguage("prod"), "pt-BR");
    },
  );

  runner.test(
    "setDefaultLanguage: browser 'en-US' (navigator.language) returns 'en-US'",
    () => {
      global.navigator = { language: "en-US" };
      expect.toBe(setDefaultLanguage("prod"), "en-US");
    },
  );

  runner.test(
    "setDefaultLanguage: browser other language (e.g., 'fr-FR') returns 'en-US'",
    () => {
      global.navigator = { language: "fr-FR" };
      expect.toBe(setDefaultLanguage("prod"), "en-US");
    },
  );

  runner.test(
    "setDefaultLanguage: browser with navigator but no language properties returns 'en-US'",
    () => {
      global.navigator = {};
      expect.toBe(setDefaultLanguage("prod"), "en-US");
    },
  );
}

runner.run();
