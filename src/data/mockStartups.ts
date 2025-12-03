import { Startup } from '@/types/startup';

export const mockStartups: Startup[] = [
  {
    id: '1',
    name: 'NeuralPath AI',
    description: 'Enterprise AI platform for automated decision-making and workflow optimization using large language models.',
    eli5: 'They help big companies use AI to make faster and smarter business decisions automatically.',
    website: 'https://neuralpath.ai',
    sector: ['AI/ML', 'Enterprise'],
    location: { city: 'San Francisco', state: 'CA', country: 'USA' },
    fundingRound: {
      type: 'Series A',
      amount: 24000000,
      date: '2025-12-01',
      leadInvestors: ['Sequoia Capital', 'a16z'],
    },
    metrics: {
      estimatedRevenue: '$2M-5M ARR',
      estimatedSize: '25-50 employees',
      buzzScore: 92,
    },
    dataSources: [
      { name: 'SEC Filing', confidence: 'verified', url: '#' },
      { name: 'TechCrunch', confidence: 'high', url: '#' },
    ],
  },
  {
    id: '2',
    name: 'PayFlow',
    description: 'Next-generation B2B payment infrastructure enabling instant cross-border transactions.',
    eli5: 'They make it super easy and fast for businesses to send money to each other anywhere in the world.',
    website: 'https://payflow.io',
    sector: ['Fintech', 'SaaS'],
    location: { city: 'New York', state: 'NY', country: 'USA' },
    fundingRound: {
      type: 'Series B',
      amount: 45000000,
      date: '2025-11-28',
      leadInvestors: ['Ribbit Capital', 'Index Ventures'],
    },
    metrics: {
      estimatedRevenue: '$8M-12M ARR',
      estimatedSize: '75-100 employees',
      buzzScore: 88,
    },
    dataSources: [
      { name: 'VentureBeat', confidence: 'high', url: '#' },
      { name: 'Company PR', confidence: 'medium', url: '#' },
    ],
  },
  {
    id: '3',
    name: 'MedSync',
    description: 'AI-powered clinical trial matching and patient recruitment platform for pharmaceutical companies.',
    eli5: 'They use AI to find the right patients for medical research trials much faster.',
    website: 'https://medsync.health',
    sector: ['Healthcare', 'AI/ML'],
    location: { city: 'Boston', state: 'MA', country: 'USA' },
    fundingRound: {
      type: 'Seed',
      amount: 8500000,
      date: '2025-11-25',
      leadInvestors: ['Andreessen Horowitz Bio'],
    },
    metrics: {
      estimatedRevenue: '<$1M ARR',
      estimatedSize: '10-25 employees',
      buzzScore: 76,
    },
    dataSources: [
      { name: 'Startups.gallery', confidence: 'medium', url: '#' },
    ],
  },
  {
    id: '4',
    name: 'CarbonTrace',
    description: 'Real-time carbon emissions tracking and reporting software for manufacturing companies.',
    eli5: 'They help factories track exactly how much pollution they create and find ways to reduce it.',
    website: 'https://carbontrace.com',
    sector: ['Climate Tech', 'SaaS'],
    location: { city: 'London', country: 'UK' },
    fundingRound: {
      type: 'Series A',
      amount: 18000000,
      date: '2025-11-22',
      leadInvestors: ['Breakthrough Energy Ventures', 'Lowercarbon Capital'],
    },
    metrics: {
      estimatedRevenue: '$3M-6M ARR',
      estimatedSize: '30-50 employees',
      buzzScore: 84,
    },
    dataSources: [
      { name: 'TechCrunch', confidence: 'high', url: '#' },
      { name: 'Company PR', confidence: 'verified', url: '#' },
    ],
  },
  {
    id: '5',
    name: 'GenomicsX',
    description: 'CRISPR-based gene therapy development platform accelerating rare disease treatments.',
    eli5: 'They use gene editing technology to create new treatments for rare diseases that have no cure.',
    website: 'https://genomicsx.bio',
    sector: ['Biotech', 'Healthcare'],
    location: { city: 'San Diego', state: 'CA', country: 'USA' },
    fundingRound: {
      type: 'Series C',
      amount: 120000000,
      date: '2025-11-18',
      leadInvestors: ['ARCH Venture Partners', 'Flagship Pioneering'],
    },
    metrics: {
      estimatedRevenue: '$15M-25M ARR',
      estimatedSize: '150-200 employees',
      buzzScore: 95,
    },
    dataSources: [
      { name: 'SEC Filing', confidence: 'verified', url: '#' },
      { name: 'BioPharma Dive', confidence: 'high', url: '#' },
    ],
  },
  {
    id: '6',
    name: 'ShopAI',
    description: 'Personalized e-commerce recommendation engine powered by conversational AI.',
    eli5: 'They help online stores suggest products to customers using a smart chatbot that understands what you want.',
    website: 'https://shopai.co',
    sector: ['E-commerce', 'AI/ML'],
    location: { city: 'Austin', state: 'TX', country: 'USA' },
    fundingRound: {
      type: 'Seed',
      amount: 5200000,
      date: '2025-11-15',
      leadInvestors: ['Y Combinator', 'First Round Capital'],
    },
    metrics: {
      estimatedRevenue: '<$500K ARR',
      estimatedSize: '5-15 employees',
      buzzScore: 71,
    },
    dataSources: [
      { name: 'YC Demo Day', confidence: 'high', url: '#' },
    ],
  },
];

export const stats = {
  newStartups: 127,
  newStartupsChange: '+12%',
  totalRaised: 892000000,
  totalRaisedChange: '+8%',
  hotSectors: ['AI/ML', 'Fintech'],
  alertsSent: 1234,
};
