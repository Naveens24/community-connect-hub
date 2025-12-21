import { collection, addDoc, getDocs, query, limit, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const demoUsers = [
  {
    uid: 'demo-user-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@demo.com',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    skills: ['React', 'TypeScript', 'UI/UX'],
    helpsGiven: 15,
  },
  {
    uid: 'demo-user-2',
    name: 'Marcus Johnson',
    email: 'marcus.j@demo.com',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    skills: ['Python', 'Machine Learning', 'Data Analysis'],
    helpsGiven: 23,
  },
  {
    uid: 'demo-user-3',
    name: 'Emily Rodriguez',
    email: 'emily.r@demo.com',
    photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    skills: ['Graphic Design', 'Branding', 'Illustration'],
    helpsGiven: 31,
  },
  {
    uid: 'demo-user-4',
    name: 'David Kim',
    email: 'david.kim@demo.com',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    skills: ['Content Writing', 'SEO', 'Copywriting'],
    helpsGiven: 18,
  },
  {
    uid: 'demo-user-5',
    name: 'Priya Patel',
    email: 'priya.p@demo.com',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    skills: ['Financial Planning', 'Accounting', 'Tax Advisory'],
    helpsGiven: 12,
  },
];

const demoRequests = [
  {
    title: 'Need help building a React dashboard',
    description: 'Looking for someone experienced with React and charting libraries to help build an analytics dashboard. Should include real-time data visualization and responsive design.',
    category: 'Technology',
    payment: 150,
    createdBy: 'demo-user-1',
    status: 'open' as const,
  },
  {
    title: 'Logo design for my startup',
    description: 'Need a modern, minimalist logo for a tech startup. We are in the AI/ML space and want something that conveys innovation and trust.',
    category: 'Design',
    payment: 200,
    createdBy: 'demo-user-2',
    status: 'in_review' as const,
  },
  {
    title: 'Write blog posts about cryptocurrency',
    description: 'Looking for a writer who understands blockchain and crypto to write 5 engaging blog posts. Each should be around 1000 words with SEO optimization.',
    category: 'Writing',
    payment: 250,
    createdBy: 'demo-user-3',
    status: 'open' as const,
  },
  {
    title: 'Social media marketing strategy',
    description: 'Need help developing a 3-month social media strategy for our e-commerce brand. Should include content calendar and engagement tactics.',
    category: 'Marketing',
    payment: 300,
    createdBy: 'demo-user-4',
    status: 'open' as const,
  },
  {
    title: 'Tax preparation assistance',
    description: 'Looking for someone to help with small business tax preparation. Need guidance on deductions and quarterly filing.',
    category: 'Finance',
    payment: 175,
    createdBy: 'demo-user-5',
    status: 'assigned' as const,
  },
  {
    title: 'Mobile app UI/UX review',
    description: 'Need an experienced designer to review our mobile app mockups and provide feedback on usability and visual design improvements.',
    category: 'Design',
    payment: 100,
    createdBy: 'demo-user-1',
    status: 'open' as const,
  },
  {
    title: 'Python script for data automation',
    description: 'Need help creating a Python script that automates data extraction from multiple APIs and generates weekly reports.',
    category: 'Technology',
    payment: 180,
    createdBy: 'demo-user-2',
    status: 'in_review' as const,
  },
  {
    title: 'Legal document review',
    description: 'Looking for someone with legal background to review our terms of service and privacy policy documents.',
    category: 'Legal',
    payment: 225,
    createdBy: 'demo-user-3',
    status: 'open' as const,
  },
];

export const seedDemoData = async (): Promise<boolean> => {
  try {
    // Check if demo data already exists
    const requestsQuery = query(collection(db, 'requests'), limit(1));
    const existingRequests = await getDocs(requestsQuery);
    
    if (!existingRequests.empty) {
      console.log('Demo data already exists');
      return false;
    }

    // Seed demo users
    for (const user of demoUsers) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        ...user,
        createdAt: serverTimestamp(),
      });
    }

    // Seed demo requests
    for (const request of demoRequests) {
      await addDoc(collection(db, 'requests'), {
        ...request,
        createdAt: serverTimestamp(),
      });
    }

    console.log('Demo data seeded successfully');
    return true;
  } catch (error) {
    console.error('Error seeding demo data:', error);
    return false;
  }
};
