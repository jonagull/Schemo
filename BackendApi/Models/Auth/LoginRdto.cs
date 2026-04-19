namespace BackendApi.Models.Auth;

public class LoginRdto
{
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required ClientType ClientType { get; set; }
}