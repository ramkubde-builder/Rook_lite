import { DemoData } from './types';

export const DEMO_CONTENT: DemoData = {
  audit: `Product: "DevStream"
Type: SaaS Project Management Tool for Developers

Landing Page Copy:
Welcome to DevStream. The best tool for coding teams.
We have features like boards and charts.
It is easy to track your bugs here.
Our pricing is very affordable at $10/user.
Sign up today to get started.
We integrate with GitHub and stuff.
Teams love us because we are simple.
Stop missing deadlines.`,

  idea: `Idea: "PlantPal"
Concept: An AI-powered mobile app that identifies houseplant diseases from photos and sets up automatic watering reminders based on local humidity and plant type.
Target: Urban millennials who kill their plants but want a green apartment.
Monetization: $5/month subscription for unlimited diagnoses.`,

  compareA: `Product: "TaskFlow" (My Product)
Copy: Manage your tasks simply. Drag and drop interface. Good for small teams. $10/month. We have a mobile app.`,

  compareB: `Product: "Asana" (Competitor)
Copy: The #1 AI-driven work management platform. Streamline workflows, automate repetitive tasks, and see project progress in real-time. Trusted by 80% of Fortune 100. Enterprise-grade security.`
};

export const SYSTEM_INSTRUCTION_BASE = `
You are Rook Lite, a world-class Chief Marketing Officer (CMO).
Your goal is to provide deep, strategic, conversion-focused analysis.
Avoid generic advice. Be specific, critical, and authoritative.
Always use internal reasoning before generating the final JSON output.
`;