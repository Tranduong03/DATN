# Sơ đồ Entity Relationship Diagram (ERD) - SportConnect

Dưới đây là sơ đồ thực thể mối quan hệ (ERD) khớp chính xác với **19 bảng dữ liệu** được định nghĩa thông qua các thuộc tính `DbSet` trong lớp `MyDbContext` của ứng dụng backend.

```mermaid
erDiagram
    Users {
        Guid id PK
        string username
        string email
        string password_hash
        string google_id
        string full_name
        string phone
        string avatar_url
        double trust_score
        int no_show_count
        datetime created_at
        bool status
        string refresh_token
        datetime refresh_token_expiry
        double height
        double weight
        string special_notes
        string fav_position
        string sports_level
        string goals
        string frequency
        string preferred_sports
        string preferred_locations
    }

    Roles {
        Guid id PK
        string name
    }

    UserRoles {
        Guid user_id PK, FK
        Guid role_id PK, FK
    }

    Venues {
        Guid id PK
        Guid owner_id FK
        string name
        string address
        string bank_qr_url
        string contact_phone
        string contact_phone2
        string description
        TimeSpan operating_start_hour
        TimeSpan operating_end_hour
        string sport_types
        int venue_scale
        datetime created_at
        string status
        double average_rating
        int review_count
    }

    Courts {
        Guid id PK
        Guid venue_id FK
        string court_name
        string description
        string status
        datetime created_at
    }

    PriceRules {
        Guid id PK
        Guid venue_id FK
        int day_of_week
        TimeSpan start_hour
        TimeSpan end_hour
        decimal price
        string description
        string sport_type
    }

    Bookings {
        Guid id PK
        Guid booker_id FK
        Guid court_id FK
        datetime start_time
        datetime end_time
        decimal total_price
        string status
        int order_number
        datetime created_at
    }

    Matches {
        Guid id PK
        Guid booking_id FK "nullable"
        Guid host_id FK
        string title
        string skill_level
        int max_players
        decimal fee_per_player
        string status
        datetime created_at
        string custom_venue_name
        string custom_court_name
        datetime custom_start_time
        datetime custom_end_time
        string sport_type
    }

    MatchPlayers {
        Guid match_id PK, FK
        Guid user_id PK, FK
        datetime joined_at
        string status
    }

    StaffVenuePermissions {
        Guid staff_user_id PK, FK
        Guid venue_id PK, FK
        string permission
        Guid granted_by FK
        datetime granted_at
    }

    ActivityLogs {
        Guid id PK
        Guid actor_id FK
        string actor_role
        string action
        string target_type
        string target_id
        string old_value
        string new_value
        string ip_address
        string user_agent
        datetime created_at
    }

    VenueImages {
        Guid id PK
        Guid venue_id FK
        string image_url
        datetime created_at
    }

    OwnerProfiles {
        Guid id PK
        Guid user_id FK
        string onboarding_status
        string verification_status
        int current_step
        string draft_data
        string reject_reason
        datetime created_at
        datetime updated_at
    }

    SportCategories {
        int id PK
        string name
        string color
        string icon
        bool status
    }

    Notifications {
        Guid id PK
        Guid user_id FK
        string title
        string message
        bool is_read
        datetime created_at
    }

    FavoriteVenues {
        Guid user_id PK, FK
        Guid venue_id PK, FK
        datetime created_at
    }

    Reviews {
        Guid id PK
        Guid booking_id FK
        Guid user_id FK
        int rating
        string comment
        datetime created_at
    }

    Teams {
        Guid id PK
        Guid creator_id FK
        string name
        string description
        string sport_type
        string avatar_url
        string skill_level
        string location
        string status
        datetime created_at
    }

    TeamMembers {
        Guid team_id PK, FK
        Guid user_id PK, FK
        string role
        string status
        datetime joined_at
    }

    Users ||--o{ UserRoles : has
    Roles ||--o{ UserRoles : contains
    Users ||--o{ Venues : owns
    Venues ||--o{ Courts : has
    Venues ||--o{ PriceRules : defines
    Venues ||--o{ VenueImages : has
    Users ||--o{ Bookings : booker
    Courts ||--o{ Bookings : booked-on
    Bookings ||--o| Matches : contains
    Users ||--o{ Matches : host
    Matches ||--o{ MatchPlayers : has
    Users ||--o{ MatchPlayers : participant
    Users ||--o{ StaffVenuePermissions : staff
    Venues ||--o{ StaffVenuePermissions : venue
    Users ||--o{ StaffVenuePermissions : granter
    Users ||--o{ ActivityLogs : logs
    Users ||--o| OwnerProfiles : profile
    Users ||--o{ Notifications : notifies
    Users ||--o{ FavoriteVenues : favorites
    Venues ||--o{ FavoriteVenues : favorited-by
    Bookings ||--o| Reviews : reviewed-by
    Users ||--o{ Reviews : writes
    Users ||--o{ Teams : creates
    Teams ||--o{ TeamMembers : has
    Users ||--o{ TeamMembers : joins
```

## Danh sách 19 bảng khớp với mã nguồn DbContext:

1. **Users**: Lưu thông tin chi tiết người chơi/chủ sân.
2. **Roles**: Danh mục vai trò trong hệ thống (User, Owner, Admin...).
3. **UserRoles**: Bảng trung gian phân quyền người dùng.
4. **Venues**: Quản lý các cụm sân thể thao do đối tác sở hữu.
5. **Courts**: Chi tiết từng sân đấu đơn lẻ thuộc một cụm sân.
6. **PriceRules**: Thiết lập khung giá theo khung giờ/ngày trong tuần cho cụm sân.
7. **Bookings**: Thông tin giao dịch thuê sân của người chơi.
8. **Matches**: Thông tin kèo đấu ghép cặp/giao lưu thể thao.
9. **MatchPlayers**: Danh sách người chơi tham gia vào từng kèo đấu.
10. **StaffVenuePermissions**: Cấp quyền quản lý cụm sân cho nhân viên (Staff).
11. **ActivityLogs**: Ghi nhật ký hành động thay đổi dữ liệu của người dùng/admin để kiểm toán.
12. **VenueImages**: Bộ sưu tập hình ảnh liên kết với cụm sân.
13. **OwnerProfiles**: Thông tin đăng ký kinh doanh và trạng thái onboarding của chủ sân.
14. **SportCategories**: Danh mục các môn thể thao (Bóng đá, Cầu lông, Pickleball...).
15. **Notifications**: Quản lý thông báo đẩy gửi tới người dùng.
16. **FavoriteVenues**: Danh sách sân bóng yêu thích của người chơi.
17. **Reviews**: Đánh giá và chấm điểm chất lượng sân dựa trên lượt đặt sân đã xong.
18. **Teams**: Quản lý câu lạc bộ/đội nhóm thể thao.
19. **TeamMembers**: Quản lý danh sách thành viên tham gia câu lạc bộ.
