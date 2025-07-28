
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
using API.Services;
using API.Exceptions.ErrorContext;
using System.Net;
using Serilog;
using Microsoft.CodeAnalysis.Elfie.Serialization;
using Microsoft.OpenApi.Models;



// ������ ������ ��� ��������� ����������
var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog((ctx, lc) => lc.ReadFrom.Configuration(ctx.Configuration));

// ���������� ������ AuthSettings � ������� �������
builder.Services.Configure<AuthSettings>(builder.Configuration.GetSection("AuthSettings"));
builder.Services.Configure<ImageKitSettings>(builder.Configuration.GetSection("ImageKitSettings"));
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
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.SuppressModelStateInvalidFilter = true;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddScoped<HashService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<JWTServices>();
builder.Services.AddScoped<ProjectService>();
builder.Services.AddScoped<TokenExtractorService>();
builder.Services.AddScoped<GroupService>();
builder.Services.AddSwaggerGen(c =>
{
    // ������ ��������� Swagger...

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,

            },
            new List<string>()
        }
    });
});

builder.Services.AddCors(options => options.AddPolicy("MyPolicy", builder => builder.AllowAnyOrigin()
.AllowAnyHeader()
.AllowAnyMethod()));

var app = builder.Build();
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
Console.WriteLine($"Connection string: {connectionString?.Replace("Password=", "Password=***")}");

if (string.IsNullOrEmpty(connectionString))
    throw new AppException(new ErrorContext("Program",
                           "Program",
                           (HttpStatusCode)1001,
                           "��������� ������ � ������ ������� ����������",
                           $"��������� ������ � ������ ����������� � ���� ������"));


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
            throw new AppException(new ErrorContext("Program",
                               "Program",
                               (HttpStatusCode)1001,
                               "��������� ������ � ������ ������� ����������",
                               $"��������� ������ ��� ������� ��������� ��������"));

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
app.UseExceptionHandling();
app.MapControllers();

app.Run();