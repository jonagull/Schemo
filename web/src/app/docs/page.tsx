'use client'

import { useAuthCheck } from '@shared'
import ContentWrapper from '@/components/layout/ContentWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DocsPage() {
  useAuthCheck()

  return (
    <ContentWrapper>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              🧪 Developer
            </Badge>
            <p className="text-sm text-muted-foreground">
              This is a development documentation page for learning how to build features.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold">How to Add a New Feature</h1>
          <p className="text-xl text-muted-foreground">
            A simple step-by-step guide to adding functionality to your application.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Example: Adding a "Posts" Feature</CardTitle>
            <CardDescription>Let's say you want users to create and view posts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
              <p className="text-sm">
                <strong>Tip:</strong> Follow the same pattern as the existing User feature. Look at those files as a
                reference!
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-lg">Backend Steps</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-1">1. Create Database Model</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Create <code className="bg-muted px-1 rounded">BackendApi/Entities/Post.cs</code> - this defines
                    what a post looks like in the database.
                  </p>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                    <code>{`namespace BackendApi.Entities;

public class Post
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; }
}`}</code>
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">2. Add to Database Context</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    In <code className="bg-muted px-1 rounded">BackendApi/Data/ApplicationDbContext.cs</code>, add:
                  </p>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                    <code>{`public DbSet<Post> Posts { get; set; }`}</code>
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">3. Create DTOs</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Create files in <code className="bg-muted px-1 rounded">BackendApi/Models/Post/</code> - these are
                    the data structures you send/receive from the frontend.
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Create <code className="bg-muted px-1 rounded">PostSdto.cs</code> (what you send) and{' '}
                    <code className="bg-muted px-1 rounded">CreatePostRdto.cs</code> (what you receive).
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">4. Create Repository</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Create <code className="bg-muted px-1 rounded">BackendApi/Repositories/Post/</code> - this handles
                    reading and writing to the database.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Create both <code className="bg-muted px-1 rounded">IPostRepository.cs</code> (interface) and{' '}
                    <code className="bg-muted px-1 rounded">PostRepository.cs</code> (implementation).
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">5. Create Service</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Create <code className="bg-muted px-1 rounded">BackendApi/Services/Post/</code> - this contains the
                    business logic (what actually happens when you create a post).
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Create both <code className="bg-muted px-1 rounded">IPostService.cs</code> (interface) and{' '}
                    <code className="bg-muted px-1 rounded">PostService.cs</code> (implementation).
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">6. Create Controller</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Create <code className="bg-muted px-1 rounded">BackendApi/Controllers/PostController.cs</code> -
                    this is the API endpoint the frontend will call.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">7. Register Services</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    In <code className="bg-muted px-1 rounded">DependencyInjectionConfiguration.cs</code>, add:
                  </p>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                    <code>{`services.AddScoped<IPostRepository, PostRepository>();
services.AddScoped<IPostService, PostService>();`}</code>
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">8. Create Migration</h4>
                  <p className="text-xs text-muted-foreground mb-2">Run these commands:</p>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                    <code>{`cd BackendApi
dotnet ef migrations add AddPost
dotnet ef database update`}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-lg">Frontend Steps</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-1">1. Create Types</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Create <code className="bg-muted px-1 rounded">web/shared/types/post.ts</code> - TypeScript types
                    that match your backend DTOs.
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Then export them from <code className="bg-muted px-1 rounded">web/shared/types/index.ts</code>
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">2. Create API Client</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Create <code className="bg-muted px-1 rounded">web/shared/api/post.ts</code> - functions that call
                    your backend API.
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Then export them from <code className="bg-muted px-1 rounded">web/shared/api/index.ts</code>
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-1">3. Create Component</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Create a component in <code className="bg-muted px-1 rounded">web/src/components/</code> - the UI
                    that users interact with.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Use the API client functions you created to fetch and send data.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md p-4">
              <p className="text-sm font-medium mb-2">The Pattern (Always Follow This):</p>
              <p className="text-xs text-muted-foreground mb-2">
                <strong>Backend:</strong> Entity → DTOs → Repository → Service → Controller → Register Services →
                Migration
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Frontend:</strong> Types → API Client → Component
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                Look at the existing User feature files to see real examples of each step!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ContentWrapper>
  )
}
