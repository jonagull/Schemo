namespace BackendApi.Models;



public enum ApiResponseStatusCode {
    Success = 200,
    Created = 201,
    NoContent = 204,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    ImATeapot = 418,
    InternalServerError = 500
}

public class ApiResponse<T>
{
    public bool Success { get; set; } = true;
    public ApiResponseStatusCode StatusCode { get; set; }
    public string? Message { get; set; }
    public T? Data { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}