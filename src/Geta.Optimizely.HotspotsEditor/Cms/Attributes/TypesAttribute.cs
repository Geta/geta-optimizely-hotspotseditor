using System;
using EPiServer.Core;

namespace Geta.Optimizely.HotspotsEditor.Cms.Attributes
{
    [AttributeUsage(AttributeTargets.Property)]
    public class TypesAttribute : Attribute
    {
        public Type[] AllowedTypes { get; set; }
        public string? TypesFormatSuffix { get; set; }

        public TypesAttribute()
            : this(new[] { typeof(IContentData) }, "reference")
        {
        }

        public TypesAttribute(params Type[] allowedTypes) : this(allowedTypes, null)
        {
        }

        public TypesAttribute(Type[] allowedTypes, string? typesFormatSuffix = null)
        {
            AllowedTypes = allowedTypes;
            TypesFormatSuffix = typesFormatSuffix;
        }
    }
}
