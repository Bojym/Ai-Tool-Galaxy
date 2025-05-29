
import { NewsletterIssue } from '../types';
import { MOCK_API_DELAY } from '../constants';

let MOCK_NEWSLETTER_ISSUES: NewsletterIssue[] = [
  {
    id: 'issue1',
    title: 'AI Tool Galaxy Weekly #1: The Rise of Generative Video',
    summary: 'This week, we dive into the latest advancements in generative video tools, spotlight new image editors, and share tips for creative AI prompting.',
    content: '<h2>Welcome to the first issue!</h2><p>Generative video is exploding! Tools like Pika Labs and Runway Gen-2 are making it easier than ever to create stunning video content from text prompts or existing images. We also saw some exciting updates to popular image generation models, offering even more realism and control.</p><h3>Tool Spotlight: VisionCraft Pro</h3><p>VisionCraft Pro just launched version 3.0 with enhanced features for artists...</p>',
    sentAt: new Date(Date.now() - 86400000 * 7),
  },
  {
    id: 'issue2',
    title: 'AI Tool Galaxy Weekly #2: AI for Productivity & Coding',
    summary: 'Discover how AI can supercharge your workflow, from AI coding assistants that write boilerplate for you to smart schedulers that organize your life.',
    content: '<h2>Boost Your Productivity with AI!</h2><p>This issue focuses on tools that can save you time and effort. AI coding assistants like GitHub Copilot and Tabnine are changing the game for developers. We also explore AI-powered project management tools and personal assistants.</p><h3>Tip of the Week: Effective Prompting for Code Gen</h3><p>When using AI to generate code, be as specific as possible with your requirements...</p>',
    sentAt: new Date(Date.now() - 86400000 * 1),
  },
];

export const getNewsletterIssues = async (): Promise<NewsletterIssue[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...MOCK_NEWSLETTER_ISSUES].sort((a,b) => b.sentAt.getTime() - a.sentAt.getTime()));
    }, MOCK_API_DELAY / 2);
  });
};

export const createNewsletterIssue = async (issueData: Omit<NewsletterIssue, 'id' | 'sentAt'>): Promise<NewsletterIssue> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newIssue: NewsletterIssue = {
        ...issueData,
        id: `issue${Date.now()}`,
        sentAt: new Date(), // Or make this settable by admin before "sending"
      };
      MOCK_NEWSLETTER_ISSUES.push(newIssue);
      resolve(newIssue);
    }, MOCK_API_DELAY);
  });
};

// Simulate sending (in a real app, this would involve an email service)
export const sendNewsletterIssue = async (issueId: string): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const issue = MOCK_NEWSLETTER_ISSUES.find(iss => iss.id === issueId);
            if (issue) {
                console.log(`Simulating sending newsletter: "${issue.title}"`);
                // Here you would integrate with an email API
                resolve(true);
            } else {
                resolve(false);
            }
        }, MOCK_API_DELAY);
    });
};
    