import { GeneralLLMService } from './general-llm.service';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ISystemPromptGenerator } from './interfaces/system-prompt-generator.service.requirements';

jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn().mockImplementation(() => ({
    invoke: jest.fn(),
  })),
}));

describe('The GeneralLLMService class', () => {
  let llmService: GeneralLLMService;
  let mockInvoke: jest.Mock;
  let mockPromptGenerator: ISystemPromptGenerator;

  beforeEach(() => {
    mockInvoke = jest.fn();
    mockPromptGenerator = {
      generatePrompt: jest.fn(),
    };
    llmService = new GeneralLLMService(
      { invoke: mockInvoke } as unknown as BaseChatModel,
      mockPromptGenerator
    );
  });

  describe('The askQuestion method', () => {
    it('should create a prompt using the prompt generator and invoke the LLM when context is relevant', async () => {
      const context = ['Relevant context'];
      const question = 'What is the capital of France?';
      const generatedPrompt = 'Generated prompt here';
      const responseText = 'Paris is the capital of France.';

      (mockPromptGenerator.generatePrompt as jest.Mock).mockReturnValue(
        generatedPrompt
      );
      mockInvoke.mockResolvedValue(responseText);

      const response = await llmService.askQuestion(question, context, true);

      expect(mockPromptGenerator.generatePrompt).toHaveBeenCalledWith(
        context,
        question
      );
      expect(mockInvoke).toHaveBeenCalledWith(generatedPrompt);
      expect(response).toBe(responseText);
    });

    it('should return a generic message when context is not relevant', async () => {
      const context: string[] = [];
      const question = 'What is the capital of France?';

      const response = await llmService.askQuestion(question, context, false);

      expect(mockPromptGenerator.generatePrompt).not.toHaveBeenCalled();
      expect(response).toBe(
        'Unfortunately, no relevant context was found to answer your question.'
      );
    });

    it('should handle an array response from the LLM', async () => {
      const context = ['Relevant context'];
      const question = 'What is the capital of France?';
      const generatedPrompt = 'Generated prompt here';
      const mockResponse = [{ text: 'Paris' }, { text: 'is the capital.' }];

      (mockPromptGenerator.generatePrompt as jest.Mock).mockReturnValue(
        generatedPrompt
      );
      mockInvoke.mockResolvedValue(mockResponse);

      const response = await llmService.askQuestion(question, context, true);

      expect(response).toBe('Paris is the capital.');
    });

    it('should throw an error on unexpected response format', async () => {
      const context = ['Relevant context'];
      const question = 'What is the capital of France?';
      const generatedPrompt = 'Generated prompt here';

      (mockPromptGenerator.generatePrompt as jest.Mock).mockReturnValue(
        generatedPrompt
      );
      mockInvoke.mockResolvedValue({ unexpected: 'response' });

      await expect(
        llmService.askQuestion(question, context, true)
      ).rejects.toThrow('Unexpected response format from LLM');
    });

    it('should throw an error if LLM invocation fails', async () => {
      const context = ['Relevant context'];
      const question = 'What is the capital of France?';
      const generatedPrompt = 'Generated prompt here';

      (mockPromptGenerator.generatePrompt as jest.Mock).mockReturnValue(
        generatedPrompt
      );
      mockInvoke.mockRejectedValue(new Error('Invocation failed'));

      await expect(
        llmService.askQuestion(question, context, true)
      ).rejects.toThrow('LLM invocation failed: Invocation failed');
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
      const response = { unexpected: 'response' } as unknown as string;
      expect(() => llmService['extractResponseText'](response)).toThrow(
        'Unexpected response format from LLM'
      );
    });
  });
});
