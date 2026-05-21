import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from './AdminLayout';
import { adminService } from '../../services/adminService';
import { publicService } from '../../services/publicService';

export default function AdminSportCategoriesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    color: '#000000',
    icon: '',
    status: true
  });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['sportCategories'],
    queryFn: () => publicService.getSportCategories()
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminService.createSportCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sportCategories'] });
      closeModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => adminService.updateSportCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sportCategories'] });
      closeModal();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteSportCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sportCategories'] });
    }
  });

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', color: '#000000', icon: '', status: true });
    setIsModalOpen(true);
  };

  const openEditModal = (category: any) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon,
      status: category.status
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa môn thể thao này?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <AdminLayout 
      title="Quản lý Môn thể thao" 
      subtitle="Thêm, sửa, xóa các môn thể thao trên hệ thống"
    >
      <div className="admin-page-content">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button 
            className="btn-book" 
            style={{ width: 'auto', padding: '10px 20px' }}
            onClick={openAddModal}
          >
            + Thêm môn thể thao
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Icon</th>
                <th>Tên môn thể thao</th>
                <th>Màu sắc</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</td></tr>
              ) : categories.map((cat: any) => (
                <tr key={cat.id}>
                  <td>#{cat.id}</td>
                  <td style={{ fontSize: '24px' }}>{cat.icon}</td>
                  <td style={{ fontWeight: '500' }}>{cat.name}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '20px', height: '20px', backgroundColor: cat.color, borderRadius: '4px', border: '1px solid #ddd' }}></div>
                      {cat.color}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${cat.status ? 'active' : 'inactive'}`} style={{
                      backgroundColor: cat.status ? '#e6f4ea' : '#fce8e6',
                      color: cat.status ? '#1e8e3e' : '#d93025',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {cat.status ? 'Hoạt động' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        style={{ background: 'none', border: 'none', color: '#1a73e8', cursor: 'pointer', fontWeight: 'bold' }}
                        onClick={() => openEditModal(cat)}
                      >
                        Sửa
                      </button>
                      <button 
                        style={{ background: 'none', border: 'none', color: '#d93025', cursor: 'pointer', fontWeight: 'bold' }}
                        onClick={() => handleDelete(cat.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: 'white', padding: '30px', borderRadius: '12px',
            width: '100%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>
              {editingId ? 'Sửa môn thể thao' : 'Thêm môn thể thao'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Tên môn thể thao *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                  placeholder="VD: Cầu lông"
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Mã màu (Hex) *</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="color" 
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    style={{ height: '40px', width: '60px', padding: '0', border: 'none', cursor: 'pointer' }}
                  />
                  <input 
                    type="text" 
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    required
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                    placeholder="VD: #50E3C2"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Icon (Emoji) *</label>
                <input 
                  type="text" 
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '20px' }}
                  placeholder="VD: 🏸"
                />
                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>Gợi ý: Nhấn phím Windows + . (chấm) để mở bảng Emoji</small>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.checked})}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: '500' }}>Hiển thị trên hệ thống</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                <button 
                  type="button" 
                  onClick={closeModal}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#4A90E2', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
