using System.Text.Json.Serialization;

namespace BackendApi.Models.Auth;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ClientType
{
    Web,
    Mobile
}