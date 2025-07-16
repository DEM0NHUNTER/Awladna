// src/__tests__/A11yAudit.test.tsx
import React from "react";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import Chat from "../pages/Chat";

expect.extend(toHaveNoViolations);

describe("Accessibility check", () => {
  it("Chat page should have no violations", async () => {
    const { container } = render(<Chat />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
