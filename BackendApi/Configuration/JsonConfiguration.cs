using System.Text.Json.Serialization;

namespace BackendApi.Configuration;

public static class JsonConfiguration
{
    public static IServiceCollection AddJsonConfiguration(this IServiceCollection services)
    {
        services.AddControllers()
            .AddJsonOptions(options =>
            {
                // Configure JSON serialization to use string enums globally
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
            });
        
        return services;
    }
}