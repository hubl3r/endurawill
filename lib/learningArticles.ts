export type LearningArticle = {
  title: string;
  description: string;
  lastUpdated: string;
  content: Array<{
    heading?: string;
    body: string;
  }>;
};

export const learningArticles: Record<string, LearningArticle> = {
  'what-is-a-last-will-and-testament': {
    title: 'What Is a Last Will and Testament?',
    description:
      'An overview of what a last will and testament is, what it does, and why it is a foundational estate planning document.',
    lastUpdated: 'January 2025',
    content: [
      {
        body:
          'A last will and testament is a legal document that outlines how a person’s assets should be distributed after their death. It also allows you to name an executor, appoint guardians for minor children, and provide other final instructions.',
      },
      {
        heading: 'What a Will Can Do',
        body:
          'A will can specify who receives your property, designate guardians for minor children, and name an executor to manage your estate. Without a will, these decisions are typically made according to state law.',
      },
      {
        heading: 'What a Will Cannot Do',
        body:
          'Certain assets, such as retirement accounts or life insurance policies with named beneficiaries, generally pass outside of a will. A will also does not avoid probate.',
      },
    ],
  },
};
