using BackendApi.Models.User;
using BackendApi.Repositories.User;

namespace BackendApi.Services.User;

public class UserService(IUserRepository userRepository) : IUserService
{
    public async Task<UserSdto?> GetUserByIdAsync(Guid userId)
    {
        var user = await userRepository.GetByIdAsync(userId);
        if (user == null)
            return null;

        return MapToDto(user);
    }

    public async Task<UserSdto?> GetCurrentUserAsync(Guid userId)
    {
        return await GetUserByIdAsync(userId);
    }

    public async Task<UserSdto?> UpdateUserAsync(Guid userId, UpdateUserRdto request)
    {
        var user = await userRepository.GetByIdAsync(userId);
        if (user == null)
            return null;

        if (!string.IsNullOrWhiteSpace(request.FirstName))
            user.FirstName = request.FirstName;

        if (!string.IsNullOrWhiteSpace(request.LastName))
            user.LastName = request.LastName;

        user.UpdatedAt = DateTime.UtcNow;

        await userRepository.UpdateAsync(user);

        return MapToDto(user);
    }

    private static UserSdto MapToDto(Entities.User user)
    {
        return new UserSdto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName ?? string.Empty,
            LastName = user.LastName ?? string.Empty,
            IsActive = user.IsActive
        };
    }
}

