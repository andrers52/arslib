import { strict as assert } from "assert";
import { Localization, setDefaultLanguage } from "./localization.js";
import { Platform } from "./platform.js";

const sampleSymbols = {
  GREETING: ["Dev_Hi", "Hello", "Olá"],
  FAREWELL: ["Dev_Bye", "Goodbye", "Adeus"],
};

describe("Localization", function() {
  let originalNavigator;

  beforeEach(function() {
    if (Platform.isBrowser()) {
      originalNavigator = global.navigator;
    }
  });

  afterEach(function() {
    if (Platform.isBrowser()) {
      global.navigator = originalNavigator;
    }
  });

  describe("Constructor", function() {
    it("should initialize with valid parameters", function() {
      const localizer = new Localization("en-US", sampleSymbols);
      assert.ok(localizer, "Localizer instance should be created.");
      assert.strictEqual(localizer.getCurrentLanguage(), "en-US");
      const strings = localizer.getLocalizedStrings();
      assert.deepStrictEqual(strings, { GREETING: "Hello", FAREWELL: "Goodbye" });
      assert.strictEqual(localizer.getString("GREETING"), "Hello");
      assert.deepStrictEqual(localizer.getSupportedLanguages(), ["dev", "en-US", "pt-BR"]);
    });

    it("should initialize with 'dev' language", function() {
      const localizer = new Localization("dev", sampleSymbols);
      assert.strictEqual(localizer.getString("GREETING"), "Dev_Hi");
    });

    it("should initialize with 'pt-BR' language", function() {
      const localizer = new Localization("pt-BR", sampleSymbols);
      assert.strictEqual(localizer.getString("GREETING"), "Olá");
    });

    it("should throw for invalid language", function() {
      assert.throws(
        () => new Localization("fr-FR", sampleSymbols),
        /Language must be one of {dev, en-US, pt-BR}/
      );
    });

    it("should throw if symbols is not an object", function() {
      assert.throws(
        () => new Localization("en-US", "not-an-object"),
        /symbols is an object that associates tokens with localized strings/
      );
    });

    it("should throw if a symbol value is not an array", function() {
      const invalidSymbols = { GREETING: "not-an-array" };
      assert.throws(
        () => new Localization("en-US", invalidSymbols),
        /GREETING must be an array of localized strings/
      );
    });

    it("should throw if a symbol array has insufficient translations", function() {
      const insufficientSymbols = { GREETING: ["Hello"] }; // Only 1 translation
      assert.throws(
        () => new Localization("en-US", insufficientSymbols),
        /GREETING must have translations for all supported languages/
      );
    });
  });

  describe("updateLanguage", function() {
    it("should update language and strings correctly", function() {
      const localizer = new Localization("en-US", sampleSymbols);
      localizer.updateLanguage("pt-BR");
      assert.strictEqual(localizer.getCurrentLanguage(), "pt-BR");
      assert.strictEqual(localizer.getString("FAREWELL"), "Adeus");
    });

    it("should update with new symbols", function() {
      const localizer = new Localization("en-US", sampleSymbols);
      const newSymbols = { PROMPT: ["Dev_Enter", "Enter", "Entrar"] };
      localizer.updateLanguage("dev", newSymbols);
      assert.strictEqual(localizer.getCurrentLanguage(), "dev");
      assert.strictEqual(localizer.getString("PROMPT"), "Dev_Enter");
      // Check that old symbols are gone if newSymbols doesn't include them
      assert.throws(
        () => localizer.getString("GREETING"),
        /key 'GREETING' not found in localized strings/
      );
    });

    it("should throw for invalid new language", function() {
      const localizer = new Localization("en-US", sampleSymbols);
      assert.throws(
        () => localizer.updateLanguage("es-ES"),
        /Language must be one of {dev, en-US, pt-BR}/
      );
    });
  });

  describe("getString", function() {
    it("should throw for non-string key", function() {
      const localizer = new Localization("en-US", sampleSymbols);
      assert.throws(() => localizer.getString(123), /key must be a string/);
    });

    it("should throw for key not found", function() {
      const localizer = new Localization("en-US", sampleSymbols);
      assert.throws(
        () => localizer.getString("NON_EXISTENT_KEY"),
        /key 'NON_EXISTENT_KEY' not found in localized strings/
      );
    });
  });

  describe("getLocalizedStrings", function() {
    it("should return a copy, not a reference", function() {
      const localizer = new Localization("en-US", sampleSymbols);
      const strings1 = localizer.getLocalizedStrings();
      strings1.GREETING = "Modified Greeting"; // Modify the copy
      const strings2 = localizer.getLocalizedStrings(); // Get a new copy
      assert.strictEqual(
        strings2.GREETING,
        "Hello",
        "Original localized strings should not be affected by modifications to a retrieved copy."
      );
    });
  });
});

describe("setDefaultLanguage", function() {
  it("should return 'dev' for dev environment", function() {
    assert.strictEqual(setDefaultLanguage("dev"), "dev");
  });

  it("should return 'en-US' for Node.js environment", function() {
    if (Platform.isNode()) {
      // In Node, navigator is undefined, so it should hit the catch block
      assert.strictEqual(setDefaultLanguage("prod"), "en-US");
    }
  });

  if (Platform.isBrowser()) {
    it("should return 'pt-BR' for browser with navigator.language", function() {
      global.navigator = { language: "pt-BR" };
      assert.strictEqual(setDefaultLanguage("prod"), "pt-BR");
    });

    it("should return 'pt-BR' for browser with navigator.userLanguage", function() {
      global.navigator = { userLanguage: "pt-BR" }; // language is undefined
      assert.strictEqual(setDefaultLanguage("prod"), "pt-BR");
    });

    it("should return 'en-US' for browser with navigator.language", function() {
      global.navigator = { language: "en-US" };
      assert.strictEqual(setDefaultLanguage("prod"), "en-US");
    });

    it("should return 'en-US' for browser with other language", function() {
      global.navigator = { language: "fr-FR" };
      assert.strictEqual(setDefaultLanguage("prod"), "en-US");
    });
  }
});
