# FitLife App

A fitness tracking app built using React Native (Expo) and Firebase.  
Designed to improve motivation and retention through gamification, personalization, and gender-sensitive features.

## 🚀 Getting Started

Quick start:
1. git clone 2. npm i 3. cp .env.example .env 4. npx expo start.
2. Register yourself with your own exmail address and password.

main codes are in app, components folder. 


The project follows a structure where different concerns are separated into dedicated directories. All screen-related files are organized under the app/ directory, with each screen (e.g., profile, goals, register) implemented as an individual .tsx file. This ensures clarity in navigation and routing using Expo Router.

Reusable elements and logic are stored in the components/ folder. For instance, layout wrappers, navigation buttons, and themed elements are placed here. Additionally, utility functions (such as XP calculation or cycle prediction) are grouped in components/utils/, supporting clean separation of logic and UI.

