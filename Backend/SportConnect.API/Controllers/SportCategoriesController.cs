using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportConnect.Application.DTOs.Admin;
using SportConnect.Application.Interfaces;

namespace SportConnect.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SportCategoriesController : ControllerBase
{
    private readonly ISportCategoryService _sportCategoryService;

    public SportCategoriesController(ISportCategoryService sportCategoryService)
    {
        _sportCategoryService = sportCategoryService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<SportCategoryDto>>> GetAll()
    {
        var categories = await _sportCategoryService.GetAllAsync();
        return Ok(categories);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<SportCategoryDto>> GetById(int id)
    {
        var category = await _sportCategoryService.GetByIdAsync(id);
        if (category == null) return NotFound();
        return Ok(category);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SportCategoryDto>> Create([FromBody] CreateSportCategoryDto dto)
    {
        var category = await _sportCategoryService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Update(int id, [FromBody] CreateSportCategoryDto dto)
    {
        var result = await _sportCategoryService.UpdateAsync(id, dto);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Delete(int id)
    {
        var result = await _sportCategoryService.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
