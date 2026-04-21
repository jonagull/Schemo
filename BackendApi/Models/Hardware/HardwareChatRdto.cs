namespace BackendApi.Models.Hardware;

public class HardwareChatRdto
{
    public List<ChatMessageDto> Messages { get; set; } = [];
    public string Language { get; set; } = "arduino";
}

public class ChatMessageDto
{
    public string Role { get; set; } = "";
    public string Content { get; set; } = "";
}
