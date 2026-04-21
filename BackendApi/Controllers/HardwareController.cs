using BackendApi.Models;
using BackendApi.Models.Hardware;
using BackendApi.Services.Claude;
using Microsoft.AspNetCore.Mvc;

namespace BackendApi.Controllers;

[ApiController]
[Route("api/hardware")]
public class HardwareController(IClaudeService claudeService) : BaseAuthenticatedController
{
    [HttpPost("chat")]
    public async Task<ActionResult<ApiResponse<HardwareChatSdto>>> Chat([FromBody] HardwareChatRdto request)
    {
        if (request.Messages.Count == 0)
            return BadRequest(new ApiResponse<HardwareChatSdto>
            {
                Success = false,
                StatusCode = ApiResponseStatusCode.BadRequest,
                Message = "Messages cannot be empty."
            });

        var (success, response, error) = await claudeService.ChatAsync(request.Messages, request.Language);

        if (!success)
            return StatusCode(500, new ApiResponse<HardwareChatSdto>
            {
                Success = false,
                StatusCode = ApiResponseStatusCode.InternalServerError,
                Message = error
            });

        return Ok(new ApiResponse<HardwareChatSdto>
        {
            Success = true,
            StatusCode = ApiResponseStatusCode.Success,
            Data = response
        });
    }

    [HttpPost("chat/stream")]
    public async Task StreamChat([FromBody] HardwareChatRdto request)
    {
        if (request.Messages.Count == 0)
        {
            Response.StatusCode = 400;
            return;
        }

        Response.ContentType = "text/event-stream";
        Response.Headers.Append("Cache-Control", "no-cache");
        Response.Headers.Append("X-Accel-Buffering", "no");
        Response.Headers.Append("Connection", "keep-alive");

        await claudeService.StreamChatAsync(
            request.Messages,
            request.Language,
            Response.Body,
            HttpContext.RequestAborted
        );
    }
}
