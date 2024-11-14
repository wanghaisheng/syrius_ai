import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { LLMService } from './llm.service';

jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn().mockImplementation(() => ({
    invoke: jest.fn(),
  })),
}));

jest.mock('@langchain/anthropic', () => ({
  ChatAnthropic: jest.fn().mockImplementation(() => ({
    invoke: jest.fn(),
  })),
}));

jest.mock('@langchain/mistralai', () => ({
  ChatMistralAI: jest.fn().mockImplementation(() => ({
    invoke: jest.fn(),
  })),
}));

describe('The LLMService class', () => {
  let llmService: LLMService;
  let mockInvoke: jest.Mock;

  beforeEach(() => {
    mockInvoke = jest.fn();
    llmService = new LLMService({
      invoke: mockInvoke,
    } as unknown as BaseChatModel);
  });

  describe('The askQuestion method', () => {
    it('should create a prompt and invoke the LLM when context is relevant', async () => {
      const context = ['Context line 1', 'Context line 2'];
      const question = 'What is the answer?';
      const responseText = 'This is the answer.';

      mockInvoke.mockResolvedValue(responseText);

      const response = await llmService.askQuestion(question, context, true);

      expect(mockInvoke).toHaveBeenCalledWith(
        expect.stringContaining(
          'Context line 1\nContext line 2\n\nQuestion: What is the answer?\nAnswer:'
        )
      );
      expect(response).toBe(responseText);
    });

    it('should return a generic message when context is not relevant', async () => {
      const context: string[] = [];
      const question = 'What is the answer?';

      const response = await llmService.askQuestion(question, context, false);

      expect(response).toBe(
        'Unfortunately, no context-specific information was found.'
      );
    });

    it('should handle an array response from the LLM', async () => {
      const context = ['Context line 1'];
      const question = 'What is the answer?';

      mockInvoke.mockResolvedValue([
        { text: 'This' },
        { text: 'is the answer.' },
      ]);

      const response = await llmService.askQuestion(question, context, true);
      expect(response).toBe('This is the answer.');
    });

    it('should throw an error on unexpected response format', async () => {
      const context = ['Context line 1'];
      const question = 'What is the answer?';

      mockInvoke.mockResolvedValue({ unexpected: 'response' });

      await expect(
        llmService.askQuestion(question, context, true)
      ).rejects.toThrow('Unexpected response format from LLM');
    });

    it('should throw an error if LLM invocation fails', async () => {
      const context = ['Context line 1'];
      const question = 'What is the answer?';

      mockInvoke.mockRejectedValue(new Error('Invocation failed'));

      await expect(
        llmService.askQuestion(question, context, true)
      ).rejects.toThrow('LLM invocation failed: Invocation failed');
    });
  });

  describe('The createPrompt method', () => {
    it('should correctly format the prompt', () => {
      const context = ['Line 1', 'Line 2'];
      const question = 'What is the capital of France?';
      const expectedPrompt =
        'Context:\nLine 1\nLine 2\n\nQuestion: What is the capital of France?\nAnswer:';

      const result = llmService['createPrompt'](context, question);

      expect(result).toBe(expectedPrompt);
    });
  });

  describe('The extractResponseText method', () => {
    it('should return response if it is a string', () => {
      const response = 'This is the response';
      expect(llmService['extractResponseText'](response)).toBe(response);
    });

    it('should concatenate text if response is an array of objects', () => {
      const response = [{ text: 'Hello' }, { text: 'world!' }];
      expect(llmService['extractResponseText'](response)).toBe('Hello world!');
    });

    it('should return text property if response is an object with text', () => {
      const response = { text: 'Single object response' };
      expect(llmService['extractResponseText'](response)).toBe(
        'Single object response'
      );
    });

    it('should throw error on unexpected response format', () => {
      const response = { unknown: 'data' };
      expect(() => llmService['extractResponseText'](response)).toThrow(
        'Unexpected response format from LLM'
      );
    });
  });
});
