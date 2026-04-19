using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BackendApi.Models;
using BackendApi.Models.Auth;
using BackendApi.Services.Auth;

namespace BackendApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<AuthSdto>>> Login([FromBody] LoginRdto request)
    {
        var (success, response, error) = await authService.LoginAsync(request);

        if (!success)
            return Ok(new ApiResponse<AuthSdto>
            {
                Success = false,
                StatusCode = ApiResponseStatusCode.Unauthorized,
                Message = error,
                Data = null
            });

        return Ok(new ApiResponse<AuthSdto>
        {
            Success = true,
            StatusCode = ApiResponseStatusCode.Success,
            Message = "Login successful",
            Data = response
        });
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<AuthSdto>>> Register([FromBody] RegisterRdto request)
    {
        var (success, response, error) = await authService.RegisterAsync(request);

        if (!success)
            return Ok(new ApiResponse<AuthSdto>
            {
                Success = false,
                StatusCode = ApiResponseStatusCode.BadRequest,
                Message = error,
                Data = null
            });

        return Ok(new ApiResponse<AuthSdto>
        {
            Success = true,
            StatusCode = ApiResponseStatusCode.Created,
            Message = "Registration successful",
            Data = response
        });
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<AuthSdto>>> Refresh()
    {
        var (success, response, error) = await authService.RefreshTokenAsync();

        if (!success)
            return Ok(new ApiResponse<AuthSdto>
            {
                Success = false,
                StatusCode = ApiResponseStatusCode.Unauthorized,
                Message = error,
                Data = null
            });

        return Ok(new ApiResponse<AuthSdto>
        {
            Success = true,
            StatusCode = ApiResponseStatusCode.Success,
            Message = "Token refreshed successfully",
            Data = response
        });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<object>>> Logout()
    {
        await authService.LogoutAsync();
        return Ok(new ApiResponse<object>
        {
            Success = true,
            StatusCode = ApiResponseStatusCode.Success,
            Message = "Logout successful",
            Data = null
        });
    }
}