using BackendApi.Repositories.User;
using BackendApi.Services.Auth;
using BackendApi.Services.Claude;
using BackendApi.Services.Jwt;
using BackendApi.Services.User;

namespace BackendApi.Configuration;

public static class DependencyInjectionConfiguration
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // HTTP Context
        services.AddHttpContextAccessor();

        // HTTP Clients
        services.AddHttpClient("Claude");

        // Services
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IClaudeService, ClaudeService>();

        // Repositories
        services.AddScoped<IUserRepository, UserRepository>();

        return services;
    }
}