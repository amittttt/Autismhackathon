using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xamarin.Forms;

namespace AustinHackathon
{
    // Learn more about making custom code visible in the Xamarin.Forms previewer
    // by visiting https://aka.ms/xamarinforms-previewer
    [DesignTimeVisible(false)]
    public partial class MainPage : ContentPage
    {
        public MainPage()
        {
            InitializeComponent();

        }
        private async void LoginPageToDashboardUrl(object sender, WebNavigatingEventArgs e)
        {
            
            if (e.Url.Contains("Dashboard"))
            {
                await Navigation.PushAsync(new Dashboard());
            }   
            else if (e.Url.Contains("NewUser")) {
                await Navigation.PushAsync(new NewUser());
            }
        }
    }
}
