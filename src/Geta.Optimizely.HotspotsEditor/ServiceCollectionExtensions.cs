using System;
using System.Linq;
using EPiServer.Shell.Modules;
using Microsoft.Extensions.DependencyInjection;

namespace Geta.Optimizely.HotspotsEditor
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddHotspotsEditor(this IServiceCollection services)
        {
            AddModule(services);

            return services;
        }

        private static void AddModule(IServiceCollection services)
        {
            services.Configure<ProtectedModuleOptions>(
                pm =>
                {
                    if (!pm.Items.Any(i => i.Name.Equals(Constants.ModuleName, StringComparison.OrdinalIgnoreCase)))
                    {
                        pm.Items.Add(new ModuleDetails {Name = Constants.ModuleName});
                    }
                });
        }
    }
}