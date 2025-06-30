
using DataBaseInfo;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using DataBaseInfo.Services;
using System.Text;
using Microsoft.EntityFrameworkCore.Internal;

//������ ������ ��� ��������� ����������
var builder = WebApplication.CreateBuilder(args);
//���������� ������ AuthSettings � ������� �������
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
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options => options.AddPolicy("MyPolicy", builder => builder.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var service = scope.ServiceProvider;
    var dbFactory = scope.ServiceProvider.GetRequiredService<IDbContextFactory<AppDbContext>>();
    using(var dbContext = dbFactory.CreateDbContext())
    {

    try
    {
        dbContext.Database.Migrate();
            var logger = service.GetService<ILogger<Program>>();
            logger.LogInformation("�������� ���� ������� ���������");
    }
    catch (Exception ex)
    {
        var logger = service.GetService<ILogger<Program>>();
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