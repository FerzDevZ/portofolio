import { describe, it, expect } from "vitest";
import { formatTemplate } from "@/lib/content/index";

describe("content/index", () => {
  describe("formatTemplate", () => {
    it("replaces single token with string value", () => {
      const result = formatTemplate("Hello {name}!", { name: "World" });
      expect(result).toBe("Hello World!");
    });

    it("replaces single token with number value", () => {
      const result = formatTemplate("Count: {count}", { count: 42 });
      expect(result).toBe("Count: 42");
    });

    it("replaces multiple tokens", () => {
      const result = formatTemplate("{greeting} {name}, you have {count} messages", {
        greeting: "Hello",
        name: "Alice",
        count: 5,
      });
      expect(result).toBe("Hello Alice, you have 5 messages");
    });

    it("replaces the same token multiple times", () => {
      const result = formatTemplate("{name} and {name} are friends", { name: "Bob" });
      expect(result).toBe("Bob and Bob are friends");
    });

    it("leaves undefined tokens as placeholders", () => {
      const result = formatTemplate("Hello {name}, from {location}", { name: "Charlie" });
      expect(result).toBe("Hello Charlie, from {location}");
    });

    it("handles empty string values", () => {
      const result = formatTemplate("Value: {value}", { value: "" });
      expect(result).toBe("Value: ");
    });

    it("handles zero as a number value", () => {
      const result = formatTemplate("Count: {count}", { count: 0 });
      expect(result).toBe("Count: 0");
    });

    it("handles template with no tokens", () => {
      const result = formatTemplate("No tokens here", { name: "test" });
      expect(result).toBe("No tokens here");
    });

    it("handles empty template", () => {
      const result = formatTemplate("", { name: "test" });
      expect(result).toBe("");
    });

    it("handles empty values object", () => {
      const result = formatTemplate("Hello {name}", {});
      expect(result).toBe("Hello {name}");
    });

    it("converts number to string correctly", () => {
      const result = formatTemplate("Pi is approximately {pi}", { pi: 3.14159 });
      expect(result).toBe("Pi is approximately 3.14159");
    });

    it("handles negative numbers", () => {
      const result = formatTemplate("Temperature: {temp}°C", { temp: -15 });
      expect(result).toBe("Temperature: -15°C");
    });

    it("does not replace partial token matches", () => {
      /* `{name}` matches inside `{name}ing` because the token regex has no
         trailing word boundary — the remainder stays as literal text. */
      const result = formatTemplate("{name}s and {name}ing", { name: "test" });
      expect(result).toBe("tests and testing");
    });

    it("handles tokens with underscores", () => {
      const result = formatTemplate("{user_name} logged in", { user_name: "john_doe" });
      expect(result).toBe("john_doe logged in");
    });

    it("handles tokens with numbers", () => {
      const result = formatTemplate("{value1} and {value2}", { value1: "first", value2: "second" });
      expect(result).toBe("first and second");
    });

    it("preserves tokens with non-word characters", () => {
      const result = formatTemplate("{user-name} or {user.name}", { "user-name": "test" });
      expect(result).toBe("{user-name} or {user.name}");
    });

    it("handles adjacent tokens", () => {
      const result = formatTemplate("{first}{second}", { first: "Hello", second: "World" });
      expect(result).toBe("HelloWorld");
    });

    it("handles real-world template example", () => {
      const result = formatTemplate(
        "You have {unread} unread message{plural} from {sender}",
        { unread: 3, plural: "s", sender: "Team" },
      );
      expect(result).toBe("You have 3 unread messages from Team");
    });

    it("handles large numbers", () => {
      const result = formatTemplate("Total: {total}", { total: 1234567890 });
      expect(result).toBe("Total: 1234567890");
    });

    it("preserves whitespace around tokens", () => {
      const result = formatTemplate("  {name}  ", { name: "test" });
      expect(result).toBe("  test  ");
    });

    it("handles special characters in values", () => {
      const result = formatTemplate("Message: {msg}", { msg: "Hello! @#$%" });
      expect(result).toBe("Message: Hello! @#$%");
    });
  });
});
