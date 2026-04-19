using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace BackendApi.Controllers;

[Authorize]
public abstract class BaseAuthenticatedController : ControllerBase
{
    protected Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            throw new UnauthorizedAccessException("User ID not found in claims");


        return userId;
    }

    protected void RequireSameId(Guid id)
    {
        if (GetUserId() != id) throw new UnauthorizedAccessException("You do not have access to this resource");
    }


    protected Guid? TryGetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return null;

        return userId;
    }
}