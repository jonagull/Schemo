using BackendApi.Entities;

namespace BackendApi.Repositories.User;

public interface IUserRepository : IRepository<Entities.User>
{
    Task<Entities.User?> GetByEmailAsync(string email);
    Task<bool> EmailExistsAsync(string email);
}