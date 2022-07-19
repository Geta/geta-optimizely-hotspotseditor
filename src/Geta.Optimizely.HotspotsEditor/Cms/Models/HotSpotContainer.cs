using EPiServer;
using EPiServer.Core;
using EPiServer.ServiceLocation;
using Newtonsoft.Json;

namespace Geta.Optimizely.HotspotsEditor.Cms.Models
{
    public class HotSpotContainer
    {
        private IContent? _content;

        protected Injected<IContentLoader> ContentLoader { get; set; }

        public string? Link { get; set; }

        [JsonIgnore]
        public IContent? Content
        {
            get
            {
                if (_content == null
                    && !string.IsNullOrEmpty(Link)
                    && ContentReference.TryParse(Link, out var contentReference))
                {
                    ContentLoader.Service.TryGet(contentReference, out _content);
                }

                return _content;
            }
        }

        public Rectangle? HotSpot { get; set; }
        public FRectangle? Area { get; set; }

        public class Rectangle
        {
            public decimal Top { get; set; }
            public decimal Left { get; set; }
            public int Width { get; set; }
            public int Height { get; set; }
        }

        public class FRectangle
        {
            public decimal Top { get; set; }
            public decimal Left { get; set; }
            public decimal Width { get; set; }
            public decimal Height { get; set; }
        }
    }
}