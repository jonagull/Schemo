using BackendApi.Entities;
using BackendApi.Models.Auth;
using BackendApi.Repositories.User;
using BackendApi.Services.Jwt;
using UserEntity = BackendApi.Entities.User;

namespace BackendApi.Services.Auth;

public class AuthService(
    IJwtService jwtService,
    IConfiguration configuration,
    IHttpContextAccessor httpContextAccessor,
    IUserRepository userRepository) : IAuthService
{
    public async Task<(bool success, AuthSdto? response, string? error)> LoginAsync(LoginRdto request)
    {
        var user = await userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            return (false, null, "Invalid email or password");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return (false, null, "Invalid email or password");
        }

        if (!user.IsActive)
        {
            return (false, null, "Account is inactive");
        }

        // Generate tokens
        var accessToken = jwtService.GenerateAccessToken(user);
        var refreshToken = jwtService.GenerateRefreshToken();
        var expiresAt = DateTime.UtcNow.AddMinutes(int.Parse(configuration["Jwt:AccessTokenExpirationMinutes"] ?? "15"));

        // Handle response based on client type
        if (request.ClientType == ClientType.Web)
        {
            // Set httpOnly cookies for web clients
            var httpContext = httpContextAccessor.HttpContext;
            if (httpContext != null)
            {
                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true, // Use HTTPS in production
                    SameSite = SameSiteMode.Strict,
                    Expires = expiresAt
                };

                httpContext.Response.Cookies.Append("AccessToken", accessToken, cookieOptions);

                var refreshCookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTime.UtcNow.AddDays(7) // Refresh token lasts longer
                };

                httpContext.Response.Cookies.Append("RefreshToken", refreshToken, refreshCookieOptions);
            }

            // For web clients, we don't return tokens in the response body
            return (true, new AuthSdto { ExpiresAt = expiresAt }, null);
        }
        else if (request.ClientType == ClientType.Mobile)
        {
            // Return tokens in response body for mobile clients
            return (true, new AuthSdto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresAt = expiresAt
            }, null);
        }

        return (false, null, "Invalid client type");
    }

    public async Task<(bool success, AuthSdto? response, string? error)> RegisterAsync(RegisterRdto request)
    {
        // Check if user already exists
        var existingUser = await userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return (false, null, "User with this email already exists");
        }

        // Create new user
        var user = new UserEntity
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        // Save user to database
        await userRepository.AddAsync(user);

        // Generate tokens
        var accessToken = jwtService.GenerateAccessToken(user);
        var refreshToken = jwtService.GenerateRefreshToken();
        var expiresAt = DateTime.UtcNow.AddMinutes(int.Parse(configuration["Jwt:AccessTokenExpirationMinutes"] ?? "15"));

        // Handle response based on client type
        if (request.ClientType == ClientType.Web)
        {
            // Set httpOnly cookies for web clients
            var httpContext = httpContextAccessor.HttpContext;
            if (httpContext != null)
            {
                var cookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true, // Use HTTPS in production
                    SameSite = SameSiteMode.Strict,
                    Expires = expiresAt
                };

                httpContext.Response.Cookies.Append("AccessToken", accessToken, cookieOptions);

                var refreshCookieOptions = new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTime.UtcNow.AddDays(7) // Refresh token lasts longer
                };

                httpContext.Response.Cookies.Append("RefreshToken", refreshToken, refreshCookieOptions);
            }

            // For web clients, we don't return tokens in the response body
            return (true, new AuthSdto { ExpiresAt = expiresAt }, null);
        }
        else if (request.ClientType == ClientType.Mobile)
        {
            // Return tokens in response body for mobile clients
            return (true, new AuthSdto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresAt = expiresAt
            }, null);
        }

        return (false, null, "Invalid client type");
    }

    public async Task<(bool success, AuthSdto? response, string? error)> RefreshTokenAsync()
    {
        var httpContext = httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            return (false, null, "HTTP context not available");
        }

        // Get refresh token from cookie
        if (!httpContext.Request.Cookies.TryGetValue("RefreshToken", out var refreshToken) || string.IsNullOrEmpty(refreshToken))
        {
            return (false, null, "Refresh token not found");
        }

        // Get access token from cookie to extract user info
        if (!httpContext.Request.Cookies.TryGetValue("AccessToken", out var oldAccessToken) || string.IsNullOrEmpty(oldAccessToken))
        {
            return (false, null, "Access token not found");
        }

        // Validate the old access token to get user info
        var principal = jwtService.ValidateToken(oldAccessToken);
        if (principal == null)
        {
            return (false, null, "Invalid access token");
        }

        var userIdClaim = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return (false, null, "Invalid user ID in token");
        }

        // Get user from database
        var user = await userRepository.GetByIdAsync(userId);
        if (user == null || !user.IsActive)
        {
            return (false, null, "User not found or inactive");
        }

        // Generate new tokens
        var newAccessToken = jwtService.GenerateAccessToken(user);
        var newRefreshToken = jwtService.GenerateRefreshToken();
        var expiresAt = DateTime.UtcNow.AddMinutes(int.Parse(configuration["Jwt:AccessTokenExpirationMinutes"] ?? "15"));

        // Set new tokens in cookies
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = expiresAt
        };

        httpContext.Response.Cookies.Append("AccessToken", newAccessToken, cookieOptions);

        var refreshCookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(7)
        };

        httpContext.Response.Cookies.Append("RefreshToken", newRefreshToken, refreshCookieOptions);

        // Return response (tokens are in cookies for web clients)
        return (true, new AuthSdto { ExpiresAt = expiresAt }, null);
    }

    public async Task<bool> LogoutAsync()
    {
        // Simulate async operation
        await Task.CompletedTask;

        var httpContext = httpContextAccessor.HttpContext;
        if (httpContext != null)
        {
            // Clear cookies if they exist
            if (httpContext.Request.Cookies.ContainsKey("AccessToken"))
            {
                httpContext.Response.Cookies.Delete("AccessToken");
            }

            if (httpContext.Request.Cookies.ContainsKey("RefreshToken"))
            {
                httpContext.Response.Cookies.Delete("RefreshToken");
            }
        }

        return true;
    }
}