using System.Collections;
using SportConnect.Application.Interfaces;
using SportConnect.Infrastructure.Persistence.Context;

namespace SportConnect.Infrastructure.Persistence.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly MyDbContext _context;
    private Hashtable _repositories;

    public UnitOfWork(MyDbContext context)
    {
        _context = context;
        _repositories = new Hashtable();
    }

    public IGenericRepository<TEntity> Repository<TEntity>() where TEntity : class
    {
        if (_repositories == null)
            _repositories = new Hashtable();

        var type = typeof(TEntity).Name;

        if (!_repositories.ContainsKey(type))
        {
            var repositoryType = typeof(GenericRepository<>);
            var repositoryInstance = Activator.CreateInstance(repositoryType.MakeGenericType(typeof(TEntity)), _context);
            _repositories.Add(type, repositoryInstance);
        }

        return (IGenericRepository<TEntity>)_repositories[type]!;
    }

    public async Task<int> CompleteAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
