const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Course = require('./models/Course');
const LiveSession = require('./models/LiveSession');
const Community = require('./models/Community');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Hash password for sample accounts
  const salt = await bcrypt.genSalt(10);
  const samplePassword = await bcrypt.hash('SkillfinixPass2026!', salt);

  // 1. Create Professional Users
  const userData = [
    {
      name: 'Elena Vance',
      email: 'elena.vance@skillfinix.dev',
      password: samplePassword,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      bio: 'Staff Product Designer at Lattice. Passionate about design systems, accessible token architectures, and micro-interactions. Looking to learn full-stack React and GraphQL.',
      skills: ['Design Systems', 'Figma', 'UI/UX Design', 'Design Tokens', 'Prototyping'],
      interests: ['React', 'Next.js', 'GraphQL', 'Tailwind CSS'],
      skillLevel: 'Advanced',
      role: 'user',
      location: 'San Francisco, CA',
    },
    {
      name: 'Liam Chen',
      email: 'liam.chen@skillfinix.dev',
      password: samplePassword,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      bio: 'Senior Full-Stack & Cloud Architect. Building distributed systems, high-throughput microservices, and Docker pipelines. Eager to master 3D spatial UI and Three.js.',
      skills: ['Node.js', 'TypeScript', 'Docker', 'PostgreSQL', 'Microservices'],
      interests: ['Three.js', 'WebGL', 'Figma', 'Design Systems'],
      skillLevel: 'Advanced',
      role: 'user',
      location: 'Seattle, WA',
    },
    {
      name: 'Amina Al-Mansoor',
      email: 'amina.ai@skillfinix.dev',
      password: samplePassword,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      bio: 'AI Research Scientist working on LLM fine-tuning, RAG architectures, and multimodal reasoning. Happy to trade ML insights for mobile Flutter dev.',
      skills: ['Python', 'PyTorch', 'Large Language Models', 'LangChain', 'RAG'],
      interests: ['Flutter', 'React Native', 'Mobile UI'],
      skillLevel: 'Advanced',
      role: 'user',
      location: 'London, UK',
    },
    {
      name: 'Marcus Reid',
      email: 'marcus.reid@skillfinix.dev',
      password: samplePassword,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      bio: 'DevOps Lead & SRE. Kubernetes cluster orchestration, Terraform IaC, and CI/CD pipelines. Wanting to level up my Product Management and system design skills.',
      skills: ['Kubernetes', 'Terraform', 'CI/CD', 'AWS', 'Linux'],
      interests: ['System Design', 'Product Strategy', 'Python'],
      skillLevel: 'Advanced',
      role: 'user',
      location: 'Austin, TX',
    },
    {
      name: 'Maya Lin',
      email: 'maya.lin@skillfinix.dev',
      password: samplePassword,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      bio: 'Frontend Engineer specializing in React performance, smooth WebGL canvas animations, and Tailwind styling. Interested in backend distributed caching with Redis.',
      skills: ['React', 'Next.js', 'Tailwind CSS', 'Framer Motion', 'Web Performance'],
      interests: ['Redis', 'Go', 'Distributed Systems'],
      skillLevel: 'Intermediate',
      role: 'user',
      location: 'New York, NY',
    },
    {
      name: 'Julian Rivera',
      email: 'julian.rivera@skillfinix.dev',
      password: samplePassword,
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
      bio: 'Mobile Engineering Lead building high-rated iOS & Android apps with Flutter. Seeking to exchange mobile engineering knowledge for DevOps and Docker deployment.',
      skills: ['Flutter', 'Dart', 'Mobile Dev', 'State Management', 'App Store Deployment'],
      interests: ['Docker', 'Kubernetes', 'CI/CD'],
      skillLevel: 'Advanced',
      role: 'user',
      location: 'Berlin, Germany',
    },
  ];

  const createdUsers = await User.insertMany(userData);
  console.log(`Created ${createdUsers.length} professional users.`);

  // Setup follow relationships among users so network stats look active
  createdUsers[0].following.push(createdUsers[1]._id, createdUsers[2]._id);
  createdUsers[0].followers.push(createdUsers[3]._id, createdUsers[4]._id);
  createdUsers[1].following.push(createdUsers[0]._id, createdUsers[4]._id);
  createdUsers[1].followers.push(createdUsers[0]._id);
  await createdUsers[0].save();
  await createdUsers[1].save();

  // Helper mapping
  const userMap = {};
  createdUsers.forEach((u) => {
    userMap[u.name] = u;
  });

  // 2. Create Professional Courses
  const courseData = [
    {
      user: userMap['Maya Lin']._id,
      title: 'Mastering Modern React & Next.js 15 Architectures',
      instructor: 'Maya Lin',
      instructorAvatar: userMap['Maya Lin'].avatar,
      description: 'Deep dive into server components, streaming SSR, modern cache primitives, and scalable production state management in React 19.',
      category: 'Frontend',
      level: 'Intermediate',
      duration: '18:40',
      rating: 4.9,
      reviewCount: 124,
      views: 3420,
      enrolledCount: 580,
      tags: ['React', 'Next.js', 'Frontend', 'TypeScript'],
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      visibility: 'public',
    },
    {
      user: userMap['Elena Vance']._id,
      title: 'Enterprise Design Systems: From Tokens to Code',
      instructor: 'Elena Vance',
      instructorAvatar: userMap['Elena Vance'].avatar,
      description: 'Learn how to build, document, and ship production-grade design systems with Figma Variables, modern token pipelines, and headless UI.',
      category: 'Design',
      level: 'Advanced',
      duration: '24:15',
      rating: 5.0,
      reviewCount: 88,
      views: 2890,
      enrolledCount: 410,
      tags: ['Design Systems', 'Figma', 'UI/UX', 'Design Tokens'],
      thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      visibility: 'public',
    },
    {
      user: userMap['Amina Al-Mansoor']._id,
      title: 'Production AI Agents with LangChain & PyTorch',
      instructor: 'Amina Al-Mansoor',
      instructorAvatar: userMap['Amina Al-Mansoor'].avatar,
      description: 'Architect, evaluate, and deploy autonomous LLM agents with memory structures, tool-calling APIs, and retrieval-augmented generation (RAG).',
      category: 'AI / ML',
      level: 'Advanced',
      duration: '32:10',
      rating: 4.9,
      reviewCount: 210,
      views: 4150,
      enrolledCount: 890,
      tags: ['AI / ML', 'Python', 'LangChain', 'PyTorch', 'LLMs'],
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      visibility: 'public',
    },
    {
      user: userMap['Liam Chen']._id,
      title: 'High-Concurrency Backend Microservices in Node & Go',
      instructor: 'Liam Chen',
      instructorAvatar: userMap['Liam Chen'].avatar,
      description: 'Build fault-tolerant distributed services handling millions of requests with Redis queues, PostgreSQL partitioning, and Docker clusters.',
      category: 'Backend',
      level: 'Advanced',
      duration: '28:30',
      rating: 4.8,
      reviewCount: 95,
      views: 2150,
      enrolledCount: 340,
      tags: ['Backend', 'Node.js', 'Microservices', 'PostgreSQL', 'Docker'],
      thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      visibility: 'public',
    },
    {
      user: userMap['Marcus Reid']._id,
      title: 'Kubernetes & Cloud-Native Infrastructure at Scale',
      instructor: 'Marcus Reid',
      instructorAvatar: userMap['Marcus Reid'].avatar,
      description: 'Master zero-downtime rolling deployments, service meshes, observability with Prometheus/Grafana, and Terraform infrastructure-as-code.',
      category: 'DevOps',
      level: 'Advanced',
      duration: '22:50',
      rating: 4.9,
      reviewCount: 76,
      views: 1890,
      enrolledCount: 290,
      tags: ['DevOps', 'Kubernetes', 'Terraform', 'Cloud'],
      thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      visibility: 'public',
    },
  ];

  const createdCourses = await Course.insertMany(courseData);
  console.log(`Created ${createdCourses.length} professional courses.`);

  // 3. Create Professional Live Sessions
  const now = new Date();
  const liveSessionsData = [
    {
      title: 'Live System Design: Scaling Web Applications to 10M DAU',
      description: 'Interactive whiteboard session exploring database sharding, distributed cache layers, message brokers, and load balancing patterns.',
      mentor: userMap['Liam Chen']._id,
      category: 'Backend',
      tags: ['System Design', 'Backend', 'Architecture'],
      scheduledAt: new Date(now.getTime() - 15 * 60 * 1000), // Started 15 min ago -> currently LIVE
      durationMinutes: 60,
      status: 'live',
      participants: [userMap['Maya Lin']._id, userMap['Marcus Reid']._id],
      meetingLink: 'https://meet.jit.si/skillfinix-system-design-live',
      thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
      maxParticipants: 100,
    },
    {
      title: 'Figma to Production Code: Design Tokens & Tailwind Masterclass',
      description: 'Learn to translate complex Figma prototypes into clean, accessible, semantic React components with zero styling regressions.',
      mentor: userMap['Elena Vance']._id,
      category: 'Design',
      tags: ['Design Systems', 'Tailwind', 'Figma'],
      scheduledAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      durationMinutes: 45,
      status: 'upcoming',
      participants: [userMap['Maya Lin']._id, userMap['Julian Rivera']._id],
      meetingLink: 'https://meet.jit.si/skillfinix-figma-to-code',
      thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
      maxParticipants: 100,
    },
    {
      title: 'Building Autonomous Agentic Workflows with LangGraph',
      description: 'Hands-on live coding workshop building cyclical AI reasoning graphs, human-in-the-loop approvals, and multi-agent systems.',
      mentor: userMap['Amina Al-Mansoor']._id,
      category: 'AI / ML',
      tags: ['AI / ML', 'Agents', 'Python'],
      scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // In 3 days
      durationMinutes: 90,
      status: 'upcoming',
      participants: [userMap['Liam Chen']._id],
      meetingLink: 'https://meet.jit.si/skillfinix-langgraph-agents',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
      maxParticipants: 100,
    },
  ];

  const createdLiveSessions = await LiveSession.insertMany(liveSessionsData);
  console.log(`Created ${createdLiveSessions.length} professional live sessions.`);

  // 4. Create Professional Communities
  const communityData = [
    {
      name: 'Full-Stack System Architects',
      description: 'A high-craft community of engineers discussing microservices, caching topologies, API design, and cloud infrastructure.',
      category: 'Backend',
      coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
      createdBy: userMap['Liam Chen']._id,
      members: [userMap['Liam Chen']._id, userMap['Maya Lin']._id, userMap['Marcus Reid']._id],
      posts: [
        {
          user: userMap['Liam Chen']._id,
          text: 'What is your team’s preferred strategy for distributed transaction consistency? Two-phase commit vs. Saga pattern with event orchestrator?',
          likes: [userMap['Marcus Reid']._id],
        },
      ],
    },
    {
      name: 'Product Designers & UI Artisans',
      description: 'Where designers and creative technologists collaborate on design systems, token architecture, typography, and motion UX.',
      category: 'Design',
      coverImage: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
      createdBy: userMap['Elena Vance']._id,
      members: [userMap['Elena Vance']._id, userMap['Maya Lin']._id],
      posts: [
        {
          user: userMap['Elena Vance']._id,
          text: 'Just published our open-source token naming taxonomy guide for multi-brand design systems. Check it out and let us know your thoughts!',
          likes: [userMap['Maya Lin']._id],
        },
      ],
    },
    {
      name: 'Applied AI & Machine Learning Engineers',
      description: 'Sharing real-world implementations of RAG, model fine-tuning, autonomous agents, and inference optimization.',
      category: 'AI / ML',
      coverImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
      createdBy: userMap['Amina Al-Mansoor']._id,
      members: [userMap['Amina Al-Mansoor']._id, userMap['Liam Chen']._id],
      posts: [
        {
          user: userMap['Amina Al-Mansoor']._id,
          text: 'Benchmarks on semantic chunking vs. fixed-length sliding windows for dense retrieval vectors show a 23% increase in recall precision on technical docs.',
          likes: [userMap['Liam Chen']._id],
        },
      ],
    },
  ];

  const createdCommunities = await Community.insertMany(communityData);
  console.log(`Created ${createdCommunities.length} professional communities.`);

  console.log('Seeding completed successfully!');
  await mongoose.disconnect();
}

seed().catch(console.error);
