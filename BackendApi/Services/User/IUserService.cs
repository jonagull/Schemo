using BackendApi.Models.User;

namespace BackendApi.Services.User;

public interface IUserService
{
    Task<UserSdto?> GetUserByIdAsync(Guid userId);
    Task<UserSdto?> GetCurrentUserAsync(Guid userId);
    Task<UserSdto?> UpdateUserAsync(Guid userId, UpdateUserRdto request);
}

