'use client'

import { useAuthCheck } from '@shared'
import ContentWrapper from '@/components/layout/ContentWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function StructurePage() {
  useAuthCheck()

  return (
    <ContentWrapper>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              🧪 Developer
            </Badge>
            <p className="text-sm text-muted-foreground">
              This is a development documentation page for understanding the project structure.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Project Structure & Technology</h1>
          <p className="text-xl text-muted-foreground">
            Understanding how the codebase is organized and what technologies power it.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project Structure</CardTitle>
            <CardDescription>High-level overview of the codebase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Backend (BackendApi/)</h3>
              <p className="text-sm text-muted-foreground mb-2">
                The server that handles requests and talks to the database.
              </p>
              <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                <code>{`BackendApi/
├── Controllers/    # API endpoints (what frontend calls)
├── Services/       # Business logic (the actual work)
├── Repositories/   # Database access (reading/writing)
├── Entities/       # Database models (what's stored)
├── Models/         # Data transfer objects (DTOs)
├── Data/           # Database configuration
└── Configuration/  # App configuration`}</code>
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Frontend (web/)</h3>
              <p className="text-sm text-muted-foreground mb-2">
                The user interface that people see and interact with.
              </p>
              <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                <code>{`web/
├── src/app/        # Pages (what users see)
├── src/components/ # Reusable UI components
└── shared/         # Shared code
    ├── api/        # API client (calls backend)
    ├── hooks/      # Custom React hooks
    ├── stores/     # State management
    └── types/      # TypeScript types`}</code>
              </pre>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-3">
              <p className="text-sm">
                <strong>How it works:</strong> Frontend sends requests → Backend processes them → Database stores data →
                Backend sends response → Frontend displays it
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technology Stack</CardTitle>
            <CardDescription>What powers this application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  Backend
                  <Badge variant="secondary">C# .NET 8</Badge>
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• .NET 8.0 (C#)</li>
                  <li>• ASP.NET Core Web API</li>
                  <li>• PostgreSQL 16 (Database)</li>
                  <li>• Entity Framework Core (Database access)</li>
                  <li>• JWT Authentication (Security)</li>
                  <li>• BCrypt (Password hashing)</li>
                  <li>• Swagger/OpenAPI (API docs)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  Frontend
                  <Badge variant="secondary">Next.js 15</Badge>
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Next.js 15 (React framework)</li>
                  <li>• React 19 with TypeScript</li>
                  <li>• Tailwind CSS (Styling)</li>
                  <li>• Shadcn/ui (Components)</li>
                  <li>• TanStack Query (Data fetching)</li>
                  <li>• Zustand (State management)</li>
                  <li>• Zod (Form validation)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Get up and running</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Prerequisites</h3>
              <ul className="space-y-1 text-sm list-disc list-inside text-muted-foreground">
                <li>.NET 8 SDK</li>
                <li>Node.js 18+</li>
                <li>pnpm 8+</li>
                <li>Docker (for database)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Option 1: Use Scripts (Recommended)</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">First time setup:</p>
                  <pre className="bg-muted p-3 rounded-md text-sm">
                    <code>./setup.sh</code>
                  </pre>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Running the project:</p>
                  <pre className="bg-muted p-3 rounded-md text-sm">
                    <code>./start.sh</code>
                  </pre>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Option 2: Manual Setup</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">1. Start the Database</p>
                  <pre className="bg-muted p-3 rounded-md text-sm">
                    <code>{`cd BackendApi
docker-compose up -d`}</code>
                  </pre>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">2. Setup Backend</p>
                  <pre className="bg-muted p-3 rounded-md text-sm">
                    <code>{`cd BackendApi
dotnet restore
dotnet ef database update
dotnet run`}</code>
                  </pre>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">3. Setup Frontend</p>
                  <pre className="bg-muted p-3 rounded-md text-sm">
                    <code>{`cd web
pnpm install
pnpm dev`}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                Backend: <code className="bg-muted px-1 py-0.5 rounded">http://localhost:5157</code> | Swagger:{' '}
                <code className="bg-muted px-1 py-0.5 rounded">http://localhost:5157/swagger</code>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Frontend: <code className="bg-muted px-1 py-0.5 rounded">http://localhost:3000</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ContentWrapper>
  )
}
