using System.Collections.Generic;
using EPiServer.PlugIn;
using Geta.Optimizely.HotspotsEditor.Cms.Models;

namespace Geta.Optimizely.HotspotsEditor.Cms.Properties
{
    [PropertyDefinitionTypePlugIn(Description = "A property for picking hotspots.", DisplayName = "Hotspot list")]
    public class PropertyHotspotContainerList : PropertyJsonSerializedObject<List<HotSpotContainer>>
    {
    }
}