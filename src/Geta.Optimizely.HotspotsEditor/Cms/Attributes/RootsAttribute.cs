using System;
using System.Collections.Generic;
using EPiServer.Core;
using Geta.Optimizely.HotspotsEditor.Cms.Models;

namespace Geta.Optimizely.HotspotsEditor.Cms.Attributes
{
    [AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
    public class RootsAttribute : Attribute
    {
        public RootsAttribute() : this(RootSelection.CommerceRootPage)
        {
        }

        public RootsAttribute(RootSelection selectedRoots)
        {
            SelectedRoots = selectedRoots;
        }

        public RootSelection SelectedRoots { get; set; }

        public IEnumerable<ContentReference> Roots
        {
            get
            {
                if (SelectedRoots.HasFlag(RootSelection.RootPage))
                    yield return ContentReference.RootPage;
                if (SelectedRoots.HasFlag(RootSelection.StartPage))
                    yield return ContentReference.StartPage;
                if (SelectedRoots.HasFlag(RootSelection.CommerceRootPage))
                    yield return new ContentReference(1 | 3 << 30, 0, "CatalogContent");
            }
        }
    }
}
