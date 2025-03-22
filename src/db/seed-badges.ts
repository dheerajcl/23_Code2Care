import { supabase } from '@/lib/supabase';

const initialBadges = [
  {
    id: 'first-login',
    name: 'First Steps',
    description: 'Welcome to Samarthanam! You took your first step by logging in.',
    icon: '🌟',
    points: 10,
    criteria: { type: 'login', count: 1 }
  },
  {
    id: 'regular-visitor',
    name: 'Regular Visitor',
    description: 'You\'ve logged in 5 times! Your dedication is showing.',
    icon: '🏅',
    points: 25,
    criteria: { type: 'login', count: 5 }
  },
  {
    id: 'dedicated-volunteer',
    name: 'Dedicated Volunteer',
    description: 'A true champion! You\'ve logged in 10 times.',
    icon: '🏆',
    points: 50,
    criteria: { type: 'login', count: 10 }
  },
  {
    id: 'first-event',
    name: 'Event Pioneer',
    description: 'Participated in your first event!',
    icon: '🎉',
    points: 50,
    criteria: { type: 'event', count: 1 }
  },
  {
    id: 'event-enthusiast',
    name: 'Event Enthusiast',
    description: 'Participated in 5 events!',
    icon: '🌟',
    points: 100,
    criteria: { type: 'event', count: 5 }
  },
  {
    id: 'feedback-contributor',
    name: 'Feedback Star',
    description: 'Thank you for providing valuable feedback!',
    icon: '⭐',
    points: 25,
    criteria: { type: 'feedback', count: 1 }
  }
];

async function seedBadges() {
  console.log('Seeding badges...');

  for (const badge of initialBadges) {
    const { data, error } = await supabase
      .from('badges')
      .upsert(badge, { onConflict: 'id' })
      .select();

    if (error) {
      console.error(`Error seeding badge ${badge.name}:`, error);
    } else {
      console.log(`Seeded badge: ${badge.name}`);
    }
  }

  console.log('Badge seeding complete!');
}

// Run the seeding
seedBadges().catch(console.error); 