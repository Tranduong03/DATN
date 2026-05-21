namespace SportConnect.Application.DTOs.Admin;

public class SportCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public bool Status { get; set; }
}

public class CreateSportCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public bool Status { get; set; } = true;
}
