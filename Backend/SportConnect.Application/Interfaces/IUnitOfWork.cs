namespace SportConnect.Application.Interfaces;

public interface IUnitOfWork : IDisposable
{
    // Chúng ta có thể expose trực tiếp Repository hoặc dùng hàm Generic
    // Ở đây ta dùng hàm Generic để dễ mở rộng
    IGenericRepository<TEntity> Repository<TEntity>() where TEntity : class;
    
    Task<int> CompleteAsync();
}
