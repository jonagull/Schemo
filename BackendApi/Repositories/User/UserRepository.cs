using Microsoft.EntityFrameworkCore;
using BackendApi.Data;

namespace BackendApi.Repositories.User;

public class UserRepository(ApplicationDbContext context) : Repository<Entities.User>(context), IUserRepository
{
    public async Task<Entities.User?> GetByEmailAsync(string email)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _dbSet.AnyAsync(u => u.Email == email);
    }
}