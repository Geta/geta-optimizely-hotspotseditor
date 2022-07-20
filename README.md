# Geta.Optimizely.HotspotsEditor

[![Build](https://github.com/Geta/geta-optimizely-hotspotseditor/actions/workflows/build.yml/badge.svg)](https://github.com/Geta/geta-optimizely-hotspotseditor/actions/workflows/build.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Geta_geta-optimizely-hotspotseditor&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Geta_geta-optimizely-hotspotseditor)
[![Platform](https://img.shields.io/badge/Platform-.NET%206-blue.svg?style=flat)](https://docs.microsoft.com/en-us/dotnet/)
[![Platform](https://img.shields.io/badge/Optimizely-%2012-orange.svg?style=flat)](http://world.episerver.com/cms/)

An editor for image hotspots.

## Installation

Type the following into your package manager console.

```
dotnet add package Geta.Optimizely.HotspotsEditor
```

## Configuration

For the HotspotsEditor to work, you have to call AddHotspotsEditor extension method in Startup.ConfigureServices method.

```
services.AddHotspotsEditor();
```

Add a property on an existing instance of `ImageData` or create a new one like the following.

```
using Geta.Optimizely.HotspotsEditor.Cms.Models;
using Geta.Optimizely.HotspotsEditor.Cms.Properties;

[ContentType(GUID = "d28c84b4-c4bd-40e7-b5b2-9c0cf79dd9c5")]
[MediaDescriptor(ExtensionString = "jpg,jpeg,jpe,ico,gif,bmp,png")]
public class ImageFile : ImageData
{
    [Display(
        Name = "Hotspot configuration",
        Description = "Hotspot editor",
        GroupName = "Hotspots"
    )]
    [UIHint(Geta.Optimizely.HotspotsEditor.Cms.UIHint.HotspotsEditor)]
    [BackingType(typeof(PropertyHotspotContainerList))]
    public virtual IEnumerable<HotSpotContainer> HotSpots { get; set; }
}
```

The hotspot editor should now be visible on a tab named 'Hotspots' when editing 'All properties' on an image inside Optimizely edit mode.
The hotspot data saved during edit is then persisted into the property defined above.

If you want to link to other content than the default you can specify content like the following.

```
[Roots(RootSelection.StartPage | RootSelection.CommerceRootPage)]
[Types(typeof(PageData), typeof(ProductContent))]
```

## Changelog

[Changelog](CHANGELOG.md)
