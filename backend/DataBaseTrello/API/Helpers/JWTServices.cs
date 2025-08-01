﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using DataBaseInfo.models;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using DataBaseInfo;
using API.Configuration;
using System.Runtime.CompilerServices;
using API.Extensions;
using API.Exceptions;
using API.Exceptions.ErrorContext;
using System.Net;
using API.Constants;
namespace API.Helpers
{
    public class JWTServices(IOptions<AuthSettings> options, IDbContextFactory<AppDbContext> contextFactory, HashService hash)
    {
        public string GenerateAccessToken(User user)
        {
            var claims = new List<Claim>
            {
               new Claim("UserName", user.UserName),
                new Claim("UserEmail", user.UserEmail),
                new Claim("UserId", user.Id.ToString()),
            };
            var jwtToken = new JwtSecurityToken(
                expires: DateTime.UtcNow.Add(options.Value.AccessTokenExpires),
                claims: claims,
                signingCredentials: new SigningCredentials(
                    new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.Value.SecretKey)), SecurityAlgorithms.HmacSha256));
            return new JwtSecurityTokenHandler().WriteToken(jwtToken);
        }
        

    

        public async Task CreateRefreshTokenAsync(User user, string token)
        {
                using (var context = contextFactory.CreateDbContext())
                {

                    var hashedToken = new RefreshToken
                    {
                        CreatedAt = DateTime.UtcNow,
                        ExpiresAt = DateTime.UtcNow.Add(options.Value.RefreshTokenExpires),
                        Token = hash.HashToken(token),
                        IsRevoked = false,
                        UserId = user.Id,

                    };
                    user.RefreshToken = hashedToken;
                    await context.RefreshTokens.AddAsync(hashedToken);


                await context.SaveChangesWithContextAsync(ServiceName.JWTServices,
                    OperationName.CreateRefreshTokenAsync,
                    "Ошибка при сохранении Hashed Refresh Token",
                    "Ошибка во время авторизации, повторите попытку позже",
                    HttpStatusCode.InternalServerError);
                }
            
        }
        public async Task<(string accessToken, string refreshToken)> RefreshTokenAsync(string refreshToken)
        {
            
               
            using(var context = contextFactory.CreateDbContext())
            {
                var HashToken = hash.HashToken(refreshToken);
            var storedToken = await context.RefreshTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => HashToken == rt.Token);

            if (storedToken == null || storedToken.IsRevoked || storedToken.ExpiresAt < DateTime.UtcNow)
               throw new AppException(new ErrorContext(ServiceName.JWTServices,
                   OperationName.RefreshTokenAsync,
                   HttpStatusCode.Unauthorized,
                   UserExceptionMessages.AuthorizeExceptionMessage,
                   "RefreshToken не существует в базе данных или его время истекло"));

            storedToken.IsRevoked = true;
                await context.SaveChangesWithContextAsync(ServiceName.JWTServices,
                    OperationName.RefreshTokenAsync,
                    "Ошибка при отзыве старого Refresh token",
                    UserExceptionMessages.AuthorizeExceptionMessage,
                    HttpStatusCode.InternalServerError);
            //Возможны проблемы
                var token = Guid.NewGuid().ToString();
            var newRefreshToken = new RefreshToken
            {
                Token = hash.HashToken(token),
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.Add(options.Value.RefreshTokenExpires),
                UserId = storedToken.UserId,
               
            };

                storedToken.User.RefreshToken = newRefreshToken;

                await context.RefreshTokens.AddAsync(newRefreshToken);
            //Возможны проблемы
            await context.SaveChangesAsync();
            //Возможны проблемы
            //Возможны проблемы
            var newAccessToken = GenerateAccessToken(newRefreshToken.User);
            //Возможны проблемы
            return (newAccessToken, token);
            }
            
            
    
        }
        public async Task RevokeRefreshTokenAsync(string refreshToken) // Где то тут может быть ошибка, поищи
        {

            using var context = contextFactory.CreateDbContext();

                    var hashedRequestToken = hash.HashToken(refreshToken);
                    var token = await context.RefreshTokens.FirstOrDefaultAsync(t => t.Token == hashedRequestToken);
                    if (token == null)
                throw new AppException(new ErrorContext(
                    ServiceName.JWTServices,
                    OperationName.RevokeRefreshTokenAsync,
                    HttpStatusCode.Unauthorized,
                    UserExceptionMessages.AuthorizeExceptionMessage,
                    "В базе не найден refresh token, соответствующий значению из cookie при попытке разлогирования."));

            context.RefreshTokens.Remove(token);
                    await context.SaveChangesWithContextAsync(ServiceName.JWTServices,
                        OperationName.RevokeRefreshTokenAsync, $"Ошибка при удалении Refresh Token из базы данных refresh token id: {token.Id}",
                        "Ошибка при попытке выйти из системы", HttpStatusCode.InternalServerError);
                   
                
            
        }
    }
}
