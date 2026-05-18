# SportConnect - Backend API

The backend API for the SportConnect platform, built with .NET Core using Clean Architecture principles. It provides a robust, scalable, and secure foundation for managing users, sport venues, bookings, and administrative tasks.

## 🚀 Technologies

*   **Framework:** ASP.NET Core Web API (.NET)
*   **Language:** C#
*   **Architecture:** Clean Architecture (Domain-Driven Design)
*   **Database ORM:** Entity Framework Core
*   **Database:** SQL Server
*   **Authentication:** JWT (JSON Web Tokens) & BCrypt Password Hashing
*   **Email Service:** SMTP Integration
*   **Security:** Global Exception Handling, CORS policies

## 📂 Architecture Overview

The project is strictly divided into four layers to ensure separation of concerns:

1.  **SportConnect.Core (Domain Layer):**
    Contains the core entities (User, Venue, Staff, Role, etc.), interfaces, and constants. This layer has no dependencies on other layers.
2.  **SportConnect.Application (Use Cases):**
    Contains business logic, services, DTOs (Data Transfer Objects), and interfaces for external services (like Email Service).
3.  **SportConnect.Infrastructure:**
    Implementation details for data access (DbContext, Repositories) and external integrations (SMTP Email Sender).
4.  **SportConnect.API (Presentation):**
    The ASP.NET Core Web API project. Contains Controllers, Middlewares (Global Exception Handler), and dependency injection setups (`Program.cs`).

## 🔑 Key Features

*   **Multi-Role Authentication:** Supports `Admin`, `Owner`, `Staff`, and `Default` users with role-based authorization.
*   **Owner Onboarding Flow:** Multi-step approval process for users to become Venue Owners.
*   **Google OAuth Integration:** Secure third-party login.
*   **Secure Password Management:** Forgot/Reset password functionality via email.

## 🛠️ Getting Started

### Prerequisites

*   .NET 8.0 SDK (or appropriate version)
*   SQL Server

### Setup & Run

1.  Navigate to the `Backend` directory.
2.  Restore NuGet packages:
    ```bash
    dotnet restore SportConnect.sln
    ```
3.  Configure Database:
    *   Update the `ConnectionStrings` in `SportConnect.API/appsettings.json`.
4.  Apply Migrations:
    ```bash
    cd SportConnect.Infrastructure
    dotnet ef database update --startup-project ../SportConnect.API
    ```
    *(Or use Package Manager Console in Visual Studio: `Update-Database`)*
5.  Run the application:
    ```bash
    cd SportConnect.API
    dotnet run
    ```
    The API will be available at `https://localhost:7034/api` (or depending on your `launchSettings.json`).

## 📚 API Documentation

Swagger UI is enabled in the development environment. Once the server is running, navigate to `/swagger` to view and interact with the API endpoints.
