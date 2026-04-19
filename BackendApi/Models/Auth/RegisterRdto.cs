namespace BackendApi.Models.Auth;

public class RegisterRdto
{
    public required string Email { get; set; }
    public required string Password { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public required ClientType ClientType { get; set; }
}