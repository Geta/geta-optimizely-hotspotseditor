using System;
using System.Collections.Generic;
using System.Linq;
using EPiServer.Shell.ObjectEditing;
using EPiServer.Shell.ObjectEditing.EditorDescriptors;
using Geta.Optimizely.HotspotsEditor.Cms.Attributes;
using Geta.Optimizely.HotspotsEditor.Cms.Models;

namespace Geta.Optimizely.HotspotsEditor.Cms.EditorDescriptors
{
    [EditorDescriptorRegistration(TargetType = typeof(IEnumerable<HotSpotContainer>), UIHint = UIHint.HotspotsEditor)]
    public class HotspotsEditorDescriptor : EditorDescriptor
    {
        public HotspotsEditorDescriptor()
        {
            ClientEditingClass = "hotspots/editors/HotspotsEditor";
        }

        public override void ModifyMetadata(ExtendedMetadata metadata, IEnumerable<Attribute> attributes)
        {
            var attr = attributes as Attribute[] ?? attributes.ToArray();
            
            if (attr.OfType<TypesAttribute>().FirstOrDefault() is TypesAttribute typesAttribute
                && metadata.Parent is ExtendedMetadata)
            {
                AllowedTypes = typesAttribute.AllowedTypes;
                AllowedTypesFormatSuffix = typesAttribute.TypesFormatSuffix;
            }

            if (attr?.OfType<RootsAttribute>().FirstOrDefault() is RootsAttribute rootsAttribute)
            {
                metadata.EditorConfiguration["roots"] = rootsAttribute.Roots;
            }

            base.ModifyMetadata(metadata, attr);
        }
    }
}
