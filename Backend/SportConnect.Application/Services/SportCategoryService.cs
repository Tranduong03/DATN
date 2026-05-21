using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SportConnect.Application.DTOs.Admin;
using SportConnect.Application.Interfaces;
using SportConnect.Core.Entities;

namespace SportConnect.Application.Services;

public class SportCategoryService : ISportCategoryService
{
    private readonly IUnitOfWork _unitOfWork;

    public SportCategoryService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<SportCategoryDto>> GetAllAsync()
    {
        var categories = await _unitOfWork.Repository<SportCategory>().GetAllAsync();
        return categories.Select(c => new SportCategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Color = c.Color,
            Icon = c.Icon,
            Status = c.Status
        });
    }

    public async Task<SportCategoryDto?> GetByIdAsync(int id)
    {
        var category = (await _unitOfWork.Repository<SportCategory>().FindAsync(c => c.Id == id)).FirstOrDefault();
        if (category == null) return null;

        return new SportCategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Color = category.Color,
            Icon = category.Icon,
            Status = category.Status
        };
    }

    public async Task<SportCategoryDto> CreateAsync(CreateSportCategoryDto dto)
    {
        var category = new SportCategory
        {
            Name = dto.Name,
            Color = dto.Color,
            Icon = dto.Icon,
            Status = dto.Status
        };

        await _unitOfWork.Repository<SportCategory>().AddAsync(category);
        await _unitOfWork.CompleteAsync();

        return new SportCategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Color = category.Color,
            Icon = category.Icon,
            Status = category.Status
        };
    }

    public async Task<bool> UpdateAsync(int id, CreateSportCategoryDto dto)
    {
        var category = (await _unitOfWork.Repository<SportCategory>().FindAsync(c => c.Id == id)).FirstOrDefault();
        if (category == null) return false;

        category.Name = dto.Name;
        category.Color = dto.Color;
        category.Icon = dto.Icon;
        category.Status = dto.Status;

        _unitOfWork.Repository<SportCategory>().Update(category);
        return await _unitOfWork.CompleteAsync() > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var category = (await _unitOfWork.Repository<SportCategory>().FindAsync(c => c.Id == id)).FirstOrDefault();
        if (category == null) return false;

        _unitOfWork.Repository<SportCategory>().Remove(category);
        return await _unitOfWork.CompleteAsync() > 0;
    }
}
