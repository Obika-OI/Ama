# Ama Baby Care Companion

Ama is a comprehensive and secure baby care companion application designed to empower parents and members of their care circle. It provides intuitive tracking, smart recommendations, acoustic analysis, and role-based village coordination to ensure your baby receives the highest standard of care.

## Key Features

1. Intelligent Acoustic Cry Analyzer
The app analyzes baby cries in real time to provide immediate insights into common baby needs such as hunger, sleepiness, colic, or discomfort.

2. Comprehensive Growth and Nutrition Tracker
Includes daily tracking for feeds, sleep, diaper changes, and developmental milestones. It maintains a persistent history of records to monitor growth over time.

3. Dynamic Weaning and Solid Meal Planner
Generates professional 7-day solid food meal plans adapted to your baby's age and local region. It also includes categorized local grocery lists with estimated price ranges.

4. Chronological Age Calculator
Uses the baby's exact Date of Birth to dynamically calculate age down to days for newborns, weeks for early infancy, and months or years as they grow. This ensures all milestones and diet plans are perfectly aligned with developmental stages.

5. Secure Village Caregiver Permissions
Allows primary parents to invite members of their village (such as grandparents, doctors, or babysitters) with specific roles. It enforces secure view-only permissions for guest care circle members to protect private logs.

6. Hands-Free Wake-Word Activation
Features a continuous background listener that responds to natural activation phrases like "Hey Ama" to instantly open the digital assistant, prompt a response, and start recording hands-free.

7. PDF Care Report Export
Generates professional, printable PDF summaries of the baby's care logs, sleep cycles, and weaning progress to share directly with pediatricians or co-parents.

## Project Structure

1. Frontend Application (src/)
- src/App.tsx: Contains the core user interface, state management, onboarding flow, logging dashboard, and village settings.
- src/components/VoiceAssistant.tsx: Manages hands-free speech activation, wake-word listeners, and the interactive assistant drawer.
- src/types.ts: Declarations of shared database and state models.

2. Backend Service (server.ts)
- Custom Express server routing API calls, managing AI assistant flows, and serving compiled static resources.

## Development and Build Instructions

Follow these simple steps to run the application locally or deploy it to a production environment.

1. Prerequisites
- Node.js installed on your computer.
- npm package manager.

2. Installation
- Open your terminal and run "npm install" to download and configure all necessary dependencies.

3. Development Server
- Run "npm run dev" to start the server in development mode.
- Access the application at http://localhost:3000 in your browser.

4. Production Build
- Run "npm run build" to compile both the React client bundle and the Express backend server.
- The compiled output will be generated inside the "dist" directory.

5. Run Production Server
- Run "npm run start" to boot up the production application server.

## Contributors and Experts

The guidance and technology driving Ama are maintained by:

1. Ekenedilichukwu Okoli (Software Developer and engineer)
2. Ogochukwu Okoli (Nutraceuticals/functional foods scientist and Developer)
3. Ngozi Obika-Ndiri (Maternal and child health Nurse)
