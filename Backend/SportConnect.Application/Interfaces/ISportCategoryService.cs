using System.Collections.Generic;
using System.Threading.Tasks;
using SportConnect.Application.DTOs.Admin;

namespace SportConnect.Application.Interfaces;

public interface ISportCategoryService
{
    Task<IEnumerable<SportCategoryDto>> GetAllAsync();
    Task<SportCategoryDto?> GetByIdAsync(int id);
    Task<SportCategoryDto> CreateAsync(CreateSportCategoryDto dto);
    Task<bool> UpdateAsync(int id, CreateSportCategoryDto dto);
    Task<bool> DeleteAsync(int id);
}
