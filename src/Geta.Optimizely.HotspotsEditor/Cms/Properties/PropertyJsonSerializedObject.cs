using System;
using EPiServer.Core;
using Newtonsoft.Json;

namespace Geta.Optimizely.HotspotsEditor.Cms.Properties
{
    public abstract class PropertyJsonSerializedObject<T> : PropertyLongString where T : class
    {
        protected T? InternalValue;

        public override Type PropertyValueType => typeof(T);

        public override object? Value
        {
            get
            {
                if (InternalValue != null) return InternalValue;

                if (base.Value is not string str) return default(T);

                try
                {
                    InternalValue = JsonConvert.DeserializeObject<T>(str);
                }
                catch (Exception)
                {
                    InternalValue = default;
                }

                return InternalValue;
            }
            set
            {
                if (value is T)
                {
                    InternalValue = default;

                    try
                    {
                        base.Value = JsonConvert.SerializeObject(value);
                    }
                    catch (Exception)
                    {
                        base.Value = value;
                    }
                }
                else
                {
                    base.Value = value;
                }
            }
        }

        public override object SaveData(PropertyDataCollection properties)
        {
            return LongString;
        }
    }
}