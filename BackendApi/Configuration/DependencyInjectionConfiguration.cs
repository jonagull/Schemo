using BackendApi.Repositories.User;
using BackendApi.Services.Auth;
using BackendApi.Services.Jwt;
using BackendApi.Services.User;

namespace BackendApi.Configuration;

public static class DependencyInjectionConfiguration
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // HTTP Context
        services.AddHttpContextAccessor();

        // Services
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();

        // Repositories
        services.AddScoped<IUserRepository, UserRepository>();

        return services;
    }
}