namespace BackendApi.Models;

public class NotFoundException(string message) : Exception(message) { }