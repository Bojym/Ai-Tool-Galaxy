
import { ForumThread, ForumComment } from '../types';
import { MOCK_API_DELAY, PLACEHOLDER_IMAGE_URL } from '../constants';

let MOCK_FORUM_THREADS: ForumThread[] = [
  {
    id: 'thread1',
    title: 'What are your favorite AI tools for image upscaling?',
    content: 'I\'ve been trying out a few different AI image upscalers, but I\'m curious to hear what the community recommends. Looking for something that preserves detail well and is reasonably priced or free. Any suggestions?',
    userId: 'user1',
    username: 'PixelPeeker',
    avatarUrl: PLACEHOLDER_IMAGE_URL(40,40,'user1'),
    upvotes: 42,
    createdAt: new Date(Date.now() - 86400000 * 3),
    commentCount: 2,
    tags: ['image processing', 'upscaling', 'recommendations'],
  },
  {
    id: 'thread2',
    title: 'Discussion: The Ethics of AI in Creative Writing',
    content: 'AI text generators are becoming incredibly powerful. What are the ethical implications for authors and the publishing industry? Can AI-generated content truly be original? Let\'s discuss!',
    userId: 'admin1',
    username: 'EthicalAIMod',
    avatarUrl: PLACEHOLDER_IMAGE_URL(40,40,'admin1'),
    upvotes: 78,
    createdAt: new Date(Date.now() - 86400000 * 7),
    commentCount: 1,
    tags: ['ethics', 'text generation', 'creative writing', 'discussion'],
  },
];

let MOCK_FORUM_COMMENTS: ForumComment[] = [
    { id: 'fc1', threadId: 'thread1', userId: 'admin1', username: 'TechGuru', avatarUrl: PLACEHOLDER_IMAGE_URL(40,40,'admin1'), text: 'I highly recommend Gigapixel AI for photo upscaling. It does a fantastic job with details.', upvotes: 12, createdAt: new Date(Date.now() - 86400000 * 2) },
    { id: 'fc2', threadId: 'thread1', userId: 'user1', username: 'ArtFan', avatarUrl: PLACEHOLDER_IMAGE_URL(40,40,'user1'), text: 'There are also some great open-source options like Real-ESRGAN if you are comfortable with a bit of setup.', upvotes: 8, createdAt: new Date(Date.now() - 86400000 * 1) },
    { id: 'fc3', threadId: 'thread2', userId: 'user1', username: 'Bookworm', avatarUrl: PLACEHOLDER_IMAGE_URL(40,40,'user1'), text: 'It\'s a complex issue. I think AI can be a great tool for brainstorming, but human creativity should always be at the core.', upvotes: 20, createdAt: new Date(Date.now() - 86400000 * 6) },
];

export const getForumThreads = async (): Promise<ForumThread[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Add comment counts dynamically
      const threadsWithCounts = MOCK_FORUM_THREADS.map(thread => ({
        ...thread,
        commentCount: MOCK_FORUM_COMMENTS.filter(c => c.threadId === thread.id).length
      })).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
      resolve(threadsWithCounts);
    }, MOCK_API_DELAY / 2);
  });
};

export const getForumThreadById = async (threadId: string): Promise<ForumThread | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const thread = MOCK_FORUM_THREADS.find(t => t.id === threadId);
      if (thread) {
        resolve({
            ...thread,
            commentCount: MOCK_FORUM_COMMENTS.filter(c => c.threadId === thread.id).length
        });
      } else {
        resolve(undefined);
      }
    }, MOCK_API_DELAY / 3);
  });
};

export const getCommentsForThread = async (threadId: string): Promise<ForumComment[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_FORUM_COMMENTS.filter(c => c.threadId === threadId).sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime()));
        }, MOCK_API_DELAY / 3);
    });
};

export const createForumThread = async (data: Omit<ForumThread, 'id' | 'createdAt' | 'upvotes' | 'commentCount'>): Promise<ForumThread> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newThread: ForumThread = {
                ...data,
                id: `thread${Date.now()}`,
                createdAt: new Date(),
                upvotes: 0,
                commentCount: 0,
            };
            MOCK_FORUM_THREADS.unshift(newThread);
            resolve(newThread);
        }, MOCK_API_DELAY);
    });
};

export const addCommentToThread = async (threadId: string, commentData: Omit<ForumComment, 'id' | 'threadId' | 'createdAt' | 'upvotes'>): Promise<ForumComment> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newComment: ForumComment = {
                ...commentData,
                id: `fc${Date.now()}`,
                threadId,
                createdAt: new Date(),
                upvotes: 0,
            };
            MOCK_FORUM_COMMENTS.push(newComment);
            // Optionally update thread's comment count or last activity
            resolve(newComment);
        }, MOCK_API_DELAY);
    });
};

export const upvoteThread = async (threadId: string): Promise<ForumThread | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const threadIndex = MOCK_FORUM_THREADS.findIndex(t => t.id === threadId);
            if (threadIndex > -1) {
                MOCK_FORUM_THREADS[threadIndex].upvotes +=1;
                resolve(MOCK_FORUM_THREADS[threadIndex]);
            } else {
                resolve(undefined);
            }
        }, MOCK_API_DELAY / 4);
    });
};

export const upvoteForumComment = async (commentId: string): Promise<ForumComment | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const commentIndex = MOCK_FORUM_COMMENTS.findIndex(c => c.id === commentId);
            if (commentIndex > -1) {
                MOCK_FORUM_COMMENTS[commentIndex].upvotes +=1;
                resolve(MOCK_FORUM_COMMENTS[commentIndex]);
            } else {
                resolve(undefined);
            }
        }, MOCK_API_DELAY / 4);
    });
};

    