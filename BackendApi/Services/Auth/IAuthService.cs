using BackendApi.Models.Auth;

namespace BackendApi.Services.Auth;

public interface IAuthService
{
    Task<(bool success, AuthSdto? response, string? error)> LoginAsync(LoginRdto request);
    Task<(bool success, AuthSdto? response, string? error)> RegisterAsync(RegisterRdto request);
    Task<(bool success, AuthSdto? response, string? error)> RefreshTokenAsync();
    Task<bool> LogoutAsync();
}