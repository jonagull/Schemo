namespace BackendApi.Models.Hardware;

public class HardwareChatSdto
{
    public bool NeedsClarification { get; set; } = false;
    public string? ClarifyingQuestion { get; set; }
    public string Message { get; set; } = "";
    public MicrocontrollerInfo Microcontroller { get; set; } = new();
    public DiagramData Diagram { get; set; } = new();
    public List<PinInfo> Pins { get; set; } = [];
    public CodeInfo Code { get; set; } = new();
    public List<BomItem> Bom { get; set; } = [];
}

public class MicrocontrollerInfo
{
    public string Name { get; set; } = "";
    public string Reason { get; set; } = "";
}

public class DiagramData
{
    public List<DiagramNode> Nodes { get; set; } = [];
    public List<DiagramEdge> Edges { get; set; } = [];
}

public class DiagramNode
{
    public string Id { get; set; } = "";
    public string Type { get; set; } = "";
    public string Label { get; set; } = "";
}

public class DiagramEdge
{
    public string Id { get; set; } = "";
    public string Source { get; set; } = "";
    public string Target { get; set; } = "";
    public string Label { get; set; } = "";
}

public class PinInfo
{
    public string Pin { get; set; } = "";
    public string Component { get; set; } = "";
    public string Role { get; set; } = "";
    public string Direction { get; set; } = "";
    public string Notes { get; set; } = "";
}

public class CodeInfo
{
    public string Language { get; set; } = "";
    public string Filename { get; set; } = "";
    public string Content { get; set; } = "";
}

public class BomItem
{
    public string Part { get; set; } = "";
    public int Qty { get; set; }
    public double Price { get; set; }
    public string Description { get; set; } = "";
}
