import { SavingChallenge } from '../types';

export const INITIAL_SAVING_CHALLENGES: SavingChallenge[] = [
  {
    id: 'ch-chai-swap',
    title: 'The "Artisanal Chai" Flask Quest',
    category: 'Food and dining',
    weeklySavingEstimate: 180,
    twist: 'Never skip your chai break! Brew authentic ginger tea or filter coffee at home/hostel and carry a flask instead of buying daily takeaway.',
    description:
      'Swapping 3 café teas/snacks a week for home-brewed tea saves real cash without sacrificing your caffeine fix.',
    impactBenchmark: 'Saves ₹780/month — equivalent to a full month of unlimited high-speed broadband!',
    isCompleted: false,
    badge: '☕ Chai Champion',
  },
  {
    id: 'ch-cart-cooling',
    title: '48-Hour Cart Cooling-Off Twist',
    category: 'Shopping',
    weeklySavingEstimate: 750,
    twist: 'Whenever you feel the urge to click "Buy Now" on Amazon/Myntra/Blinkit, move the item to "Save for Later" for 48 hours. If you still need it after 2 days, buy it guilt-free!',
    description:
      'Psychological studies show 68% of impulse online purchases are forgotten after 48 hours of dopamine cooling.',
    impactBenchmark: 'Saves ~₹3,000/month — easily covers your monthly groceries or gym membership.',
    isCompleted: false,
    badge: '🛒 Impulse Shield',
  },
  {
    id: 'ch-walk-one-stop',
    title: 'Walk the Last Metro / Auto Stop',
    category: 'Transport',
    weeklySavingEstimate: 220,
    twist: 'Get off 1 metro station earlier or walk destinations under 1 km instead of booking an auto-rickshaw or bike taxi.',
    description:
      'Skip surge pricing for minor distances. You save money, dodge traffic jams, and clock in 4,000 extra healthy steps.',
    impactBenchmark: 'Saves ₹950/month + burns 1,200 calories.',
    isCompleted: false,
    badge: '🚶‍♂️ Urban Strider',
  },
  {
    id: 'ch-diy-friday',
    title: 'Roommate / Family DIY Friday Feast',
    category: 'Food and dining',
    weeklySavingEstimate: 450,
    twist: 'Replace one expensive weekend Zomato/Swiggy order with a fun cook-together night (e.g., gourmet pasta, paneer bhurji, or homemade pizza).',
    description:
      'Cooking with friends turns food preparation into a social event while avoiding ₹150 delivery fees, GST, and packaging charges.',
    impactBenchmark: 'Saves ~₹1,800/month — enough to fund an entire mutual fund SIP!',
    isCompleted: false,
    badge: '👨‍🍳 Master Chef',
  },
  {
    id: 'ch-spare-change',
    title: 'The Digital "Round-Up" Piggy Bank',
    category: 'Micro-Savings',
    weeklySavingEstimate: 260,
    twist: 'Every time you pay a UPI bill with an odd amount (e.g. ₹134 for lunch), stash the spare change to the nearest ₹50 (₹16) into your savings vault.',
    description:
      'Painlessly sweeps pocket change into your investment piggy bank without feeling any pinch in your daily lifestyle.',
    impactBenchmark: 'Accumulates ~₹13,500 over 12 months with zero lifestyle change.',
    isCompleted: false,
    badge: '🪙 Spare Coin Wizard',
  },
  {
    id: 'ch-phantom-power',
    title: 'The Phantom Vampire Power Audit',
    category: 'Bills and utilities',
    weeklySavingEstimate: 140,
    twist: 'Switch off laptop chargers, monitors, microwave switches, and AC mains directly from the wall socket before bed.',
    description:
      'Idle standby gadgets silently bleed 5-10% of residential electricity bills across Indian households.',
    impactBenchmark: 'Trims ₹560/month off utility bills.',
    isCompleted: false,
    badge: '⚡ Watt Guard',
  },
];
