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
    public partial class Dashboard : ContentPage
    {
        public Dashboard()
        {
            InitializeComponent();
        }
        private async void Activity_OnClicked(object sender, EventArgs e)
        {
            await Navigation.PushAsync(new Activity());
        }
        private async void Back_OnClicked(object sender, EventArgs e)
        {
            await Navigation.PushAsync(new MainPage());
        }
        private async void DashboardToVideoDisplay(object sender, WebNavigatingEventArgs e)
        {
            
            //Store all url here (But UseLess ) --> GO back is also there
            //https://stackoverflow.com/questions/34309138/xamarin-forms-making-webview-go-back   
        }
    }
}
