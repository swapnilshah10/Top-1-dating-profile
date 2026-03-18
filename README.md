# Top 1% Resume Optimizer

A powerful, client-side React application that analyzes resumes using advanced AI to provide elite recruiting feedback, ATS scoring, and line-by-line actionable improvements.

## ✨ Features

- **📄 Secure PDF Parsing:** Extracts text from your resume directly in the browser. Your document is never uploaded to a central server.
- **🤖 Deep AI Analysis:** Evaluates your resume against elite recruiting standards, calculating an ATS score and identifying critical areas for improvement.
- **💡 Actionable Feedback:** Provides a brutally honest executive summary, top 3 "must-fix" items, and line-by-line suggestions color-coded by severity (Strong, Polish, Fix).
- **🔑 Bring Your Own Key (BYOK):** Users provide their own AI API key via the UI. The key is stored securely in the browser's `localStorage` and is only used to communicate directly with the AI provider.

## 🛠️ Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/resume-optimizer.git
   cd resume-optimizer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

## ⚙️ Usage & Configuration

1. Open the application in your browser.
2. Upload a PDF version of your resume.
3. The app will parse the PDF and prompt you for an API key.
4. Enter your API key. It will be saved locally in your browser.
5. Review your personalized, line-by-line resume analysis!

*Note: You can clear your saved API key at any time using the "Clear API Key" button in the top navigation bar.*

## 🔒 Privacy & Security

This application is designed with privacy in mind. PDF parsing happens entirely on the client side. The only data transmitted over the network is the extracted text sent directly to the AI API for analysis, using the API key you provide. No data or API keys are stored on our servers.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
