using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace AustinHackathon
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class Activity : ContentPage
    {
        public Activity()
        {
            InitializeComponent();
            var browser = new WebView();
            browser.Source = "file:///android_asset/TestWebPage.html"; 
            Content = browser;
        }
    }
}