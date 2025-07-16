// src/hooks/useChat.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useChat } from './useChat';
import { server } from '../__mocks__/server';
import { rest } from 'msw';
import React from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ token: 'fake-token' }),
}));

jest.mock('../context/ChatContext', () => ({
  useChatContext: () => ({
    addMessageToChat: jest.fn(),
    currentChatId: 'chat1',
    currentChat: {
      id: 'chat1',
      childId: 1,
      childAge: 9,
      childName: 'Alice',
    },
  }),
}));

describe('useChat hook', () => {
  it('fetches children successfully', async () => {
    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loadingChildren).toBe(false);
      expect(result.current.children.length).toBe(2);
      expect(result.current.children[0].name).toBe('Alice');
    });
  });

  it('handles fetch error', async () => {
    server.use(
      rest.get('/api/auth/child/', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.childrenError).toBeTruthy();
    });
  });

  it('mutates AI response successfully', async () => {
    server.use(
      rest.post('/api/chat', (req, res, ctx) => {
        return res(
          ctx.json({
            response: 'Hi there!',
            sentiment: 'positive',
            sentiment_score: 0.95,
            suggested_actions: ['Give praise'],
          })
        );
      })
    );

    const { result } = renderHook(() => useChat(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loadingChildren).toBe(false));

    await result.current.aiMutation.mutateAsync({
      message: 'How are you?',
      chat: {
        id: 'chat1',
        childId: 1,
        childAge: 9,
        childName: 'Alice',
      },
    });

    expect(result.current.aiMutation.isSuccess).toBe(true);
  });
});
