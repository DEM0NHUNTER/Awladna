// src/pages/__tests__/Chat.integration.test.tsx
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { server } from "../../../__mocks__/server";
import Chat from "../Chat";
import { ChatProvider } from "../../../context/ChatContext";
import { AuthProvider } from "../../../context/AuthContext";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const queryClient = new QueryClient();

const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>{children}</ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

describe("Chat integration flow", () => {
  it("should load children and send/receive a chat message", async () => {
    render(<Chat />, { wrapper: AppWrapper });

    // Wait for child dropdown to appear
    const dropdown = await screen.findByRole("combobox");

    expect(dropdown).toBeInTheDocument();
    expect(dropdown).toHaveDisplayValue("Select a child");

    // Select Alice
    userEvent.selectOptions(dropdown, "1");

    // Wait for chat input to appear
    const input = await screen.findByRole("textbox");
    expect(input).toBeInTheDocument();

    // Type and send message
    await userEvent.type(input, "Hello AI");
    const sendButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendButton);

    // Typing indicator
    expect(await screen.findByText(/sentiment/i)).toBeInTheDocument();

    // Wait for AI response
    await waitFor(() =>
      expect(screen.getByText("AI echo: Hello AI")).toBeInTheDocument()
    );
  });

  it("should show error if chat fails", async () => {
    // Override chat endpoint to fail
    server.use(
      rest.post("/api/chat", (req, res, ctx) =>
        res(ctx.status(500), ctx.json({ detail: "fail" }))
      )
    );

    render(<Chat />, { wrapper: AppWrapper });

    const dropdown = await screen.findByRole("combobox");
    userEvent.selectOptions(dropdown, "1");

    const input = await screen.findByRole("textbox");
    await userEvent.type(input, "trigger error");

    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/failed to get ai response/i)
      ).toBeInTheDocument();
    });
  });
});
