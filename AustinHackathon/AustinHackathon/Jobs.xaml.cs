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
    public partial class Jobs : ContentPage
    {
        public Jobs()
        {
            InitializeComponent();
        }
        private async void Back_OnClicked(object sender, EventArgs e)
        {
            await Navigation.PushAsync(new Activity());
        }
    }
}