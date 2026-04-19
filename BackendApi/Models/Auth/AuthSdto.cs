namespace BackendApi.Models.Auth;

public class AuthSdto
{
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? ExpiresAt { get; set; }
}