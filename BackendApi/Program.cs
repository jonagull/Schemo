using BackendApi.Configuration;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddJsonConfiguration();
builder.Services.AddDatabaseConfiguration(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddCorsConfiguration(builder.Configuration);
builder.Services.AddSwaggerConfiguration();

var app = builder.Build();

await app.ApplyMigrationsAsync();

// Configure the HTTP request pipeline
app.UseSwaggerConfiguration();
app.UseCorsConfiguration();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();