import { collection, addDoc, getDocs, query, limit, serverTimestamp, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const demoUsers = [
  {
    uid: 'demo-user-bilaspur-1',
    name: 'Amit Sharma',
    email: 'amit.sharma@demo.com',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    skills: ['Tutoring', 'Errands', 'Tech Help'],
    helpsGiven: 8,
    activeCity: 'bilaspur_cg',
  },
  {
    uid: 'demo-user-bilaspur-2',
    name: 'Priya Verma',
    email: 'priya.verma@demo.com',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    skills: ['Gardening', 'Cooking', 'Pet Care'],
    helpsGiven: 12,
    activeCity: 'bilaspur_cg',
  },
  {
    uid: 'demo-user-bilaspur-3',
    name: 'Rahul Patel',
    email: 'rahul.patel@demo.com',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    skills: ['Heavy Lifting', 'Handyman', 'Driving'],
    helpsGiven: 15,
    activeCity: 'bilaspur_cg',
  },
  {
    uid: 'demo-user-koni-1',
    name: 'Sneha Gupta',
    email: 'sneha.gupta@demo.com',
    photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    skills: ['Study Help', 'Notes Sharing', 'Research'],
    helpsGiven: 20,
    activeCity: 'koni_bilaspur',
  },
  {
    uid: 'demo-user-koni-2',
    name: 'Vikram Singh',
    email: 'vikram.singh@demo.com',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    skills: ['Furniture Repair', 'Electronics', 'Carpentry'],
    helpsGiven: 10,
    activeCity: 'koni_bilaspur',
  },
];

const demoRequests = [
  // Bilaspur, C.G requests
  {
    title: 'Need help carrying groceries to my apartment',
    description: 'I have some heavy grocery bags and need help carrying them up to the 3rd floor. Should take about 15-20 minutes.',
    category: 'Other',
    payment: 50,
    createdBy: 'demo-user-bilaspur-1',
    status: 'open' as const,
    city: 'bilaspur_cg',
    area: 'Vyapar Vihar',
    society: 'Near Central Mall',
  },
  {
    title: 'Looking for someone to explain basic math to a school student',
    description: 'My nephew is struggling with 8th grade mathematics. Need someone patient to explain fractions and algebra basics. About 1-2 hours of tutoring.',
    category: 'Other',
    payment: 150,
    createdBy: 'demo-user-bilaspur-2',
    status: 'open' as const,
    city: 'bilaspur_cg',
    area: 'Sarkanda',
    society: 'Shivaji Nagar Colony',
  },
  {
    title: 'Can someone help me set up my new phone?',
    description: 'Just bought a new smartphone and need help transferring contacts, setting up WhatsApp, and installing some basic apps. Elderly person needs assistance.',
    category: 'Technology',
    payment: 100,
    createdBy: 'demo-user-bilaspur-3',
    status: 'in_review' as const,
    city: 'bilaspur_cg',
    area: 'Torwa',
    society: 'Gandhi Chowk',
  },
  {
    title: 'Need help finding a nearby stationery shop',
    description: "New to this area and need to find a good stationery shop that sells art supplies for my daughter's school project. Would appreciate if someone can guide me.",
    category: 'Other',
    payment: 30,
    createdBy: 'demo-user-bilaspur-1',
    status: 'open' as const,
    city: 'bilaspur_cg',
    area: 'Gole Bazaar',
    society: '',
  },
  {
    title: 'Help needed to water plants while I\'m away today',
    description: 'Going out of town for a day and need someone to water my balcony plants in the evening. There are about 15 small pots. Keys can be collected from neighbor.',
    category: 'Other',
    payment: 80,
    createdBy: 'demo-user-bilaspur-2',
    status: 'open' as const,
    city: 'bilaspur_cg',
    area: 'Nehru Nagar',
    society: 'Sunrise Apartments',
  },
  // Koni, Bilaspur requests
  {
    title: 'Need help with college assignment clarification',
    description: 'Studying BCA 2nd year and stuck with a Java programming assignment. Need someone who can explain object-oriented concepts clearly.',
    category: 'Technology',
    payment: 100,
    createdBy: 'demo-user-koni-1',
    status: 'open' as const,
    city: 'koni_bilaspur',
    area: 'Near CSVTU',
    society: 'University Road',
  },
  {
    title: 'Looking for someone to help move a chair',
    description: 'Need help moving a heavy armchair from ground floor to 2nd floor. It\'s too heavy for one person. Should take about 10 minutes.',
    category: 'Other',
    payment: 40,
    createdBy: 'demo-user-koni-2',
    status: 'open' as const,
    city: 'koni_bilaspur',
    area: 'Koni Road',
    society: 'Krishna Complex',
  },
  {
    title: 'Need notes for yesterday\'s class',
    description: 'Missed my morning lecture in ECE department. Looking for someone who can share notes or explain what was covered. Will pay for the help!',
    category: 'Other',
    payment: 50,
    createdBy: 'demo-user-koni-1',
    status: 'in_review' as const,
    city: 'koni_bilaspur',
    area: 'College Campus',
    society: 'Hostel Block B',
  },
  {
    title: 'Can anyone guide me to the nearest medical store?',
    description: 'Need to buy some medicines urgently but new to this area. Would appreciate if someone can walk with me to the nearest pharmacy.',
    category: 'Other',
    payment: 30,
    createdBy: 'demo-user-koni-2',
    status: 'open' as const,
    city: 'koni_bilaspur',
    area: 'Main Market',
    society: '',
  },
  {
    title: 'Help needed to fix a loose table leg',
    description: 'The leg of my study table has come loose and wobbles a lot. Need someone with basic tools to fix it. I don\'t have tools myself.',
    category: 'Other',
    payment: 60,
    createdBy: 'demo-user-koni-1',
    status: 'open' as const,
    city: 'koni_bilaspur',
    area: 'Koni',
    society: 'Near Bus Stand',
  },
];

let seedingInProgress = false;
let seedingCompleted = false;

// Remove duplicate requests from database
const removeDuplicates = async (): Promise<void> => {
  try {
    const requestsSnap = await getDocs(collection(db, 'requests'));
    const seenTitles = new Map<string, string>(); // title -> first doc id
    const duplicateIds: string[] = [];
    
    requestsSnap.docs.forEach((docSnap) => {
      const title = docSnap.data().title;
      if (seenTitles.has(title)) {
        duplicateIds.push(docSnap.id);
      } else {
        seenTitles.set(title, docSnap.id);
      }
    });
    
    // Delete duplicates
    for (const id of duplicateIds) {
      await deleteDoc(doc(db, 'requests', id));
    }
    
    if (duplicateIds.length > 0) {
      console.log(`Removed ${duplicateIds.length} duplicate requests`);
    }
  } catch (error) {
    console.error('Error removing duplicates:', error);
  }
};

// Clear old demo data and reseed
const clearOldDemoData = async (): Promise<void> => {
  try {
    // Delete old demo users
    const oldDemoUserIds = [
      'demo-user-1', 'demo-user-2', 'demo-user-3', 'demo-user-4', 'demo-user-5'
    ];
    for (const uid of oldDemoUserIds) {
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch (e) {
        // Ignore if doesn't exist
      }
    }
    
    // Delete old requests without city field or with old categories
    const requestsSnap = await getDocs(collection(db, 'requests'));
    for (const docSnap of requestsSnap.docs) {
      const data = docSnap.data();
      // Delete if no city field or if it has old professional categories
      if (!data.city || data.category === 'Design' || data.category === 'Writing' || data.category === 'Marketing' || data.category === 'Finance' || data.category === 'Legal') {
        await deleteDoc(doc(db, 'requests', docSnap.id));
      }
    }
  } catch (error) {
    console.error('Error clearing old demo data:', error);
  }
};

export const seedDemoData = async (): Promise<boolean> => {
  // Prevent multiple simultaneous seeding attempts
  if (seedingInProgress || seedingCompleted) {
    return false;
  }
  
  seedingInProgress = true;
  
  try {
    // Clear old demo data first
    await clearOldDemoData();
    
    // Remove any duplicates
    await removeDuplicates();
    
    // Check if new demo data already exists
    const requestsQuery = query(collection(db, 'requests'), limit(1));
    const existingRequests = await getDocs(requestsQuery);
    
    // Check if we have the new demo requests (with city field)
    let hasNewDemoData = false;
    if (!existingRequests.empty) {
      const firstDoc = existingRequests.docs[0].data();
      hasNewDemoData = !!firstDoc.city;
    }
    
    if (hasNewDemoData) {
      console.log('New demo data already exists');
      seedingCompleted = true;
      seedingInProgress = false;
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
    seedingCompleted = true;
    seedingInProgress = false;
    return true;
  } catch (error) {
    console.error('Error seeding demo data:', error);
    seedingInProgress = false;
    return false;
  }
};
