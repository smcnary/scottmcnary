# Database Migrations

To create the initial migration, run:

```bash
dotnet ef migrations add InitialCreate --project backend.csproj
```

To apply migrations to the database:

```bash
dotnet ef database update --project backend.csproj
```

Note: The application will automatically run migrations on startup if the database connection is configured.

