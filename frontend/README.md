# test-devscaffolding Frontend

Next.js frontend application with TypeScript, Tailwind CSS, and shadcn/ui.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Testing**: Vitest + React Testing Library

## Development Setup

### Prerequisites

- Node.js 20+
- npm or yarn

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set environment variables:
```bash
# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

3. Run development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Docker Development

Build and run with Docker:

```bash
docker build -t test-devscaffolding-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://backend:8000 test-devscaffolding-frontend
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Home page
│   └── globals.css   # Global styles
├── components/       # React components
│   └── ui/          # shadcn/ui components
├── lib/             # Utility functions
│   ├── api-client.ts # API client
│   └── utils.ts     # Helper functions
└── types/           # TypeScript type definitions
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://backend:8000)

## Adding shadcn/ui Components

To add new shadcn/ui components:

```bash
npx shadcn-ui@latest add [component-name]
```

Example:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
```

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Building for Production

```bash
npm run build
npm start
```

The build output will be in the `.next` directory with standalone mode enabled for Docker deployment.
