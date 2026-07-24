🎒 Campus Lost & Found Platform
A full-stack web application built for college campuses to streamline reporting, tracking, and recovery of lost and found items. Powered by Jina AI semantic matching embeddings and real-time communication tools.

✨ Project Overview
The Campus Lost & Found Platform solves campus asset management and item recovery challenges by providing a centralized digital space for students and faculty. Instead of relying on passive notice boards, this platform leverages AI vector embeddings to actively match lost item reports against found items in real time.

🔑 Core Features
AI Semantic Matching Engine: Integrated Jina AI vector embeddings to analyze item descriptions and automatically compute high-confidence similarity scores between lost reports and found assets.

Real-Time Communication: Built-in live chat and negotiation channels powered by Socket.IO, enabling reporters and finders to communicate instantly.

Multi-Step Claim & Ownership Verification: Custom verification question workflows requiring claimants to prove ownership before retrieving items.

Cloud Media Management: Integrated Cloudinary for scalable image uploads, storage, and optimization.

Responsive Dashboard: Interactive feed featuring category filters, status indicators, and custom owner badges.

Authentication & Authorization: Secure JWT-based user authentication ensuring protected routes and user-specific report management.

🛠️ Technology Stack
Frontend: React, Tailwind CSS, Lucide Icons, Axios, React Router

Backend: Node.js, Express.js, Socket.IO

Database: MongoDB & Mongoose ODM

Cloud Services & AI: Cloudinary (Media Storage), Jina AI (Vector Embeddings)
