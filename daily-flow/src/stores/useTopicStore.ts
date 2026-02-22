import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Topic, TopicPage, Tag } from '@/types';

const generateId = () => Math.random().toString(36).substring(2, 11);

interface TopicStore {
  topics: Topic[];
  topicPages: TopicPage[];
  tags: Tag[];
  setTopics: (topics: Topic[]) => void;
  setTopicPages: (pages: TopicPage[]) => void;
  setTags: (tags: Tag[]) => void;
  addTopic: (topic: Omit<Topic, 'id' | 'createdAt'>) => Topic;
  deleteTopic: (id: string) => void;
  addTopicPage: (page: Omit<TopicPage, 'id' | 'createdAt'>) => TopicPage;
  getTopicById: (id: string) => Topic | undefined;
  getTopicByName: (name: string) => Topic | undefined;
  getTopicPages: (topicId: string) => TopicPage[];
  getChildPageIds: (topicId: string) => string[];
  resolveTopicPath: (path: string, autoCreate?: boolean) => string[] | null;
  getTopicPath: (id: string) => string;
  addTag: (name: string) => Tag;
  getOrCreateTag: (name: string) => Tag;
}

export const useTopicStore = create<TopicStore>()(
  persist(
    (set, get) => ({
      topics: [],
      topicPages: [],
      tags: [],

      setTopics: (topics) => set({ topics }),
      setTopicPages: (pages) => set({ topicPages: pages }),
      setTags: (tags) => set({ tags }),

      addTopic: (topicData) => {
        const topic: Topic = { ...topicData, id: `topic-${generateId()}`, createdAt: new Date() };
        set((state) => ({ topics: [...state.topics, topic] }));
        return topic;
      },

      deleteTopic: (id) => {
        set((state) => ({
          topics: state.topics.filter(t => t.id !== id),
          topicPages: state.topicPages.filter(p => p.topicId !== id),
        }));
      },

      addTopicPage: (pageData) => {
        const page: TopicPage = { ...pageData, id: `page-${generateId()}`, createdAt: new Date() };
        set((state) => ({ topicPages: [...state.topicPages, page] }));
        return page;
      },

      getTopicById: (id) => {
        const { topics, topicPages } = get();
        return topics.find(t => t.id === id) || topicPages.find(p => p.id === id) as Topic | undefined;
      },

      getTopicByName: (name) => {
        const lowerName = name.toLowerCase();
        const { topics, topicPages } = get();
        return topics.find(t => t.name.toLowerCase() === lowerName) || topicPages.find(p => p.name.toLowerCase() === lowerName) as Topic | undefined;
      },

      getTopicPages: (topicId) => get().topicPages.filter(p => p.topicId === topicId),

      getChildPageIds: (topicId) => get().topicPages.filter(p => p.topicId === topicId).map(p => p.id),

      resolveTopicPath: (path, autoCreate = false) => {
        const parts = path.split('/').map(p => p.trim()).filter(Boolean);
        if (parts.length === 0) return null;
        const { topics, topicPages, addTopic, addTopicPage } = get();
        const topicName = parts[0];
        let topic = topics.find(t => t.name.toLowerCase() === topicName.toLowerCase());
        if (!topic) {
          if (!autoCreate) return null;
          topic = addTopic({ name: topicName });
        }
        if (parts.length === 1) return [topic.id];
        const pageName = parts.slice(1).join('/');
        let page = topicPages.find(p => p.topicId === topic!.id && p.name.toLowerCase() === pageName.toLowerCase());
        if (!page) {
          if (!autoCreate) return null;
          page = addTopicPage({ topicId: topic.id, name: pageName });
        }
        return [topic.id, page.id];
      },

      getTopicPath: (id) => {
        const { topics, topicPages } = get();
        const topic = topics.find(t => t.id === id);
        if (topic) return topic.name;
        const page = topicPages.find(p => p.id === id);
        if (page) {
          const parentTopic = topics.find(t => t.id === page.topicId);
          return parentTopic ? `${parentTopic.name}/${page.name}` : page.name;
        }
        return '';
      },

      addTag: (name) => {
        const tag: Tag = { id: `tag-${generateId()}`, name: name.toLowerCase() };
        set((state) => ({ tags: [...state.tags, tag] }));
        return tag;
      },

      getOrCreateTag: (name) => {
        const existing = get().tags.find(t => t.name.toLowerCase() === name.toLowerCase());
        if (existing) return existing;
        return get().addTag(name);
      },
    }),
    { name: 'kaivoo-topics', partialize: (state) => ({ topics: state.topics, topicPages: state.topicPages, tags: state.tags }) }
  )
);
