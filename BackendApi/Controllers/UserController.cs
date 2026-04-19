using Microsoft.AspNetCore.Mvc;
using BackendApi.Models;
using BackendApi.Models.User;
using BackendApi.Services.User;

namespace BackendApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController(IUserService userService) : BaseAuthenticatedController
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<UserSdto>>> GetCurrentUser()
    {
        var userId = GetUserId();
        var user = await userService.GetCurrentUserAsync(userId);

        if (user == null)
            return Ok(new ApiResponse<UserSdto>
            {
                Success = false,
                StatusCode = ApiResponseStatusCode.NotFound,
                Message = "User not found",
                Data = null
            });

        return Ok(new ApiResponse<UserSdto>
        {
            Success = true,
            StatusCode = ApiResponseStatusCode.Success,
            Message = null,
            Data = user
        });
    }

    [HttpPut]
    public async Task<ActionResult<ApiResponse<UserSdto>>> UpdateUser([FromBody] UpdateUserRdto request)
    {
        var userId = GetUserId();
        var user = await userService.UpdateUserAsync(userId, request);

        if (user == null)
            return Ok(new ApiResponse<UserSdto>
            {
                Success = false,
                StatusCode = ApiResponseStatusCode.NotFound,
                Message = "User not found",
                Data = null
            });

        return Ok(new ApiResponse<UserSdto>
        {
            Success = true,
            StatusCode = ApiResponseStatusCode.Success,
            Message = "User updated successfully",
            Data = user
        });
    }
}