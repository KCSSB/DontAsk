
using DataBaseInfo;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using DataBaseInfo.Services;
using System.Text;
using Microsoft.EntityFrameworkCore.Internal;
using API.Helpers;
using API.BackGroundServices;
using API.Configuration;

// ������ ������ ��� ��������� ����������
var builder = WebApplication.CreateBuilder(args);
// ���������� ������ AuthSettings � ������� �������
builder.Services.Configure<AuthSettings>(builder.Configuration.GetSection("AuthSettings"));

// ����������� ������� ���������
builder.Services.AddDbContextFactory<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));



//����������� ������� ��� ������� ������ �������:
builder.Services.AddHostedService<RefreshTokensCleaner>();
//����������� ������� ��������� �������

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {

        var authSettings = builder.Configuration.GetSection("AuthSettings").Get<AuthSettings>(); 
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(authSettings.SecretKey))
        };
       
    });



// ������ �������
builder.Services.AddDatabaseDeveloperPageExceptionFilter();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddScoped<HashService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<JWTServices>();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options => options.AddPolicy("MyPolicy", builder => builder.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
Console.WriteLine($"Connection string: {connectionString?.Replace("Password=", "Password=***")}");

if (string.IsNullOrEmpty(connectionString))
{
    throw new Exception("Connection string is not configured!");
}
using (var scope = app.Services.CreateScope())
{
    var service = scope.ServiceProvider;
    var dbFactory = scope.ServiceProvider.GetRequiredService<IDbContextFactory<AppDbContext>>();
    using(var dbContext = dbFactory.CreateDbContext())
    {
        var logger = service.GetService<ILogger<Program>>();
        try
    {
        dbContext.Database.Migrate();
            
            logger.LogInformation("�������� ���� ������� ���������");
    }
    catch (Exception ex)
    {
        
        logger.LogError(ex, "������ ��� ���������� ��������");
        throw;
    }
    }
}
   

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
    app.UseMigrationsEndPoint();
}


app.UseHttpsRedirection();
app.UseRouting();
// ��������� CORS
app.UseAuthentication();
app.UseAuthorization();
app.UseCors("MyPolicy");
app.MapControllers();

app.Run();